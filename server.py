import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.apk': 'application/vnd.android.package-archive',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def end_headers(self):
        # Enable caching for static frame images for peak performance
        if self.path.endswith('.jpg') or self.path.endswith('.jpeg'):
            self.send_header('Cache-Control', 'public, max-age=86400')
        elif self.path.endswith('.apk'):
            self.send_header('Content-Type', 'application/vnd.android.package-archive')
            self.send_header('Content-Disposition', 'attachment; filename="WakeStop.apk"')
            self.send_header('Cache-Control', 'no-cache')
        else:
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        # Keep logs clean
        pass

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def handle_error(self, request, client_address):
        # Ignore disconnects when client closes or cancels stream early
        err_type = sys.exc_info()[0]
        if err_type in (ConnectionResetError, BrokenPipeError):
            return
        super().handle_error(request, client_address)

if __name__ == '__main__':
    try:
        with ThreadedHTTPServer(('', PORT), QuietHandler) as httpd:
            print(f"Serving at http://localhost:{PORT}")
            sys.stdout.flush()
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
