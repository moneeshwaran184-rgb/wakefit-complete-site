(() => {
  /* ==========================================================================
     1. SCROLL-DRIVEN CANVAS ANIMATION CORE (300 FRAMES)
     ========================================================================== */
  const TOTAL_FRAMES = 300;
  const FRAME_PATH = (index) =>
    `ezgif-30efc2aba5f53b16-jpg/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;

  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loader-progress');
  const loaderText = document.getElementById('loader-text');

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  let lastRenderedFrame = -1;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    if (lastRenderedFrame >= 0 && images[lastRenderedFrame]) {
      drawFrame(images[lastRenderedFrame]);
    }
  }

  function drawFrame(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Centered Cover scaling
    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const offsetX = (canvasW - drawW) * 0.5;
    const offsetY = (canvasH - drawH) * 0.5;

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  function updateScrollTarget() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
    targetFrame = progress * (TOTAL_FRAMES - 1);
  }

  function animationLoop() {
    const delta = targetFrame - currentFrame;
    if (Math.abs(delta) > 0.001) {
      currentFrame += delta * 0.08;
    } else {
      currentFrame = targetFrame;
    }

    const frameIndex = Math.min(
      Math.max(Math.round(currentFrame), 0),
      TOTAL_FRAMES - 1
    );

    if (frameIndex !== lastRenderedFrame && images[frameIndex]?.complete) {
      drawFrame(images[frameIndex]);
      lastRenderedFrame = frameIndex;
    }

    requestAnimationFrame(animationLoop);
  }

  function preloadImages() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameIndex = i;

      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        if (loaderProgress) loaderProgress.style.width = `${percent}%`;
        if (loaderText) loaderText.textContent = `Loading Experience ${percent}%`;

        if (frameIndex === 0 && lastRenderedFrame === -1) {
          drawFrame(img);
          lastRenderedFrame = 0;
        }

        if (loadedCount >= TOTAL_FRAMES && loader) {
          setTimeout(() => {
            loader.classList.add('hidden');
          }, 200);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= TOTAL_FRAMES && loader) {
          loader.classList.add('hidden');
        }
      };

      img.src = FRAME_PATH(i + 1);
      images[i] = img;
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', updateScrollTarget, { passive: true });

  resizeCanvas();
  updateScrollTarget();
  preloadImages();
  requestAnimationFrame(animationLoop);

  /* ==========================================================================
     2. NAVIGATION & ACTIVE SECTION HIGHLIGHTING
     ========================================================================== */
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-nav-item').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Active dock navigation on scroll
  window.addEventListener('scroll', () => {
    let currentSectionId = 'home';
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id') || 'home';
      }
    });

    navItems.forEach((item) => {
      if (item.getAttribute('data-nav') === currentSectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }, { passive: true });

  /* ==========================================================================
     3. INTERACTIVE PHONE MOCKUP (HERO)
     ========================================================================== */
  const mockTabs = document.querySelectorAll('.mock-tab');
  const mockDistVal = document.getElementById('mock-dist-val');
  const mockRadiusVal = document.getElementById('mock-radius-val');
  const mockArmBtn = document.getElementById('mock-arm-toggle');
  const mockArmText = document.getElementById('mock-arm-text');
  const mockArmedStatus = document.getElementById('mock-armed-status');

  const mockModeData = {
    train: { dist: '3.4 km', radius: '1.2 km' },
    bus: { dist: '850 m', radius: '400 m' },
    car: { dist: '2.1 km', radius: '1.0 km' },
    plane: { dist: '28.5 km', radius: '12.0 km' },
  };

  mockTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      mockTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.getAttribute('data-mode');
      if (mockModeData[mode]) {
        if (mockDistVal) mockDistVal.textContent = `Distance: ${mockModeData[mode].dist}`;
        if (mockRadiusVal) mockRadiusVal.textContent = mockModeData[mode].radius;
      }
    });
  });

  if (mockArmBtn) {
    mockArmBtn.addEventListener('click', () => {
      const isArmed = mockArmBtn.classList.contains('armed');
      if (isArmed) {
        mockArmBtn.classList.remove('armed');
        mockArmBtn.classList.add('disarmed');
        if (mockArmText) mockArmText.textContent = 'Tap to Arm Alarm';
        if (mockArmedStatus) {
          mockArmedStatus.textContent = 'Standby';
          mockArmedStatus.className = 'val highlight-amber';
        }
      } else {
        mockArmBtn.classList.remove('disarmed');
        mockArmBtn.classList.add('armed');
        if (mockArmText) mockArmText.textContent = 'Alarm Armed & Monitoring';
        if (mockArmedStatus) {
          mockArmedStatus.textContent = 'Armed';
          mockArmedStatus.className = 'val highlight-green';
        }
      }
    });
  }

  /* ==========================================================================
     4. REAL WEB AUDIO API SOUND ENGINE (ALARM SYNTHESIZER)
     ========================================================================== */
  let audioCtx = null;
  let activeOscs = [];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function stopAllAudio() {
    activeOscs.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    activeOscs = [];
  }

  function playSynthesizedTone(type) {
    stopAllAudio();
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.75, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (type === 'chime') {
      const freqs = [587.33, 880, 1174.66, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        const startTime = ctx.currentTime + idx * 0.28;
        osc.frequency.setValueAtTime(freq, startTime);
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.4, startTime + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.6);
        activeOscs.push(osc);
      });
    } else if (type === 'siren') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const now = ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        osc.frequency.setValueAtTime(980, now + i * 0.35);
        osc.frequency.setValueAtTime(740, now + i * 0.35 + 0.17);
      }
      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.4);
      activeOscs.push(osc);
    } else {
      // Radar Sonar Ping
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        const startTime = ctx.currentTime + i * 0.38;
        osc.frequency.setValueAtTime(1400, startTime);
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.32);
        activeOscs.push(osc);
      }
    }
  }

  /* ==========================================================================
     5. INTERACTIVE SIMULATOR LOGIC
     ========================================================================== */
  let simCurrentSpeed = 110;
  let simCurrentRadius = 2.0;
  let simCurrentTone = 'siren';

  const simModeBtns = document.querySelectorAll('.sim-mode-btn');
  const simRadiusSlider = document.getElementById('sim-radius-slider');
  const simRadiusDisplay = document.getElementById('sim-radius-display');
  const simRadiusVal = document.getElementById('sim-radius-val');
  const simSpeedVal = document.getElementById('sim-speed-val');
  const simLeadMinutes = document.getElementById('sim-lead-minutes');
  const simToneName = document.getElementById('sim-tone-name');
  const simToneBtns = document.querySelectorAll('.tone-btn');
  const simTestToneBtn = document.getElementById('sim-test-tone-btn');
  const simTestToneText = document.getElementById('sim-test-tone-text');
  const simTriggerArrivalBtn = document.getElementById('sim-trigger-arrival-btn');
  const simAlarmAlert = document.getElementById('sim-alarm-alert');

  const toneNames = {
    siren: 'Tactical Siren (980Hz)',
    chime: 'Dual Chime (587Hz)',
    radar: 'Pulsed Sonar (1400Hz)'
  };

  function updateSimulatorTelemetry() {
    const minutes = ((simCurrentRadius / simCurrentSpeed) * 60).toFixed(1);
    if (simLeadMinutes) simLeadMinutes.textContent = minutes;
    if (simRadiusDisplay) simRadiusDisplay.textContent = `${simCurrentRadius.toFixed(1)} km`;
    if (simRadiusVal) simRadiusVal.textContent = `${simCurrentRadius.toFixed(1)} km`;
    if (simSpeedVal) simSpeedVal.textContent = `${simCurrentSpeed} km/h`;
    if (simToneName) simToneName.textContent = toneNames[simCurrentTone] || simCurrentTone;
  }

  simModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      simModeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      simCurrentSpeed = parseFloat(btn.getAttribute('data-speed')) || 110;
      const defRadius = parseFloat(btn.getAttribute('data-def-radius')) || 2.0;
      simCurrentRadius = defRadius;
      if (simRadiusSlider) simRadiusSlider.value = String(defRadius);
      updateSimulatorTelemetry();
    });
  });

  if (simRadiusSlider) {
    simRadiusSlider.addEventListener('input', (e) => {
      simCurrentRadius = parseFloat(e.target.value) || 2.0;
      updateSimulatorTelemetry();
    });
  }

  simToneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      simToneBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      simCurrentTone = btn.getAttribute('data-tone') || 'siren';
      updateSimulatorTelemetry();
    });
  });

  if (simTestToneBtn) {
    simTestToneBtn.addEventListener('click', () => {
      playSynthesizedTone(simCurrentTone);
      if (simTestToneText) {
        simTestToneText.textContent = 'Playing Preview...';
        setTimeout(() => {
          simTestToneText.textContent = 'Test Selected Tone';
        }, 1500);
      }
    });
  }

  if (simTriggerArrivalBtn) {
    simTriggerArrivalBtn.addEventListener('click', () => {
      playSynthesizedTone(simCurrentTone);
      if (simAlarmAlert) {
        simAlarmAlert.classList.remove('hidden');
        setTimeout(() => {
          simAlarmAlert.classList.add('hidden');
        }, 3500);
      }
    });
  }

  updateSimulatorTelemetry();

  /* ==========================================================================
     6. FAQ ACCORDION
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach((f) => {
          f.classList.remove('active');
          f.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  /* ==========================================================================
     7. DOWNLOAD MODAL & DIRECT APK DOWNLOAD HELPER
     ========================================================================== */
  const downloadModal = document.getElementById('download-modal');
  const closeDownloadBtn = document.getElementById('close-download-modal');
  const openDownloadBtns = [
    document.getElementById('open-download-nav'),
    document.getElementById('open-download-mobile'),
    document.getElementById('hero-download-btn'),
    document.getElementById('step-download-btn'),
    document.getElementById('cta-download-btn'),
    document.getElementById('open-download-footer'),
  ].filter(Boolean);

  const startApkDownloadBtn = document.getElementById('start-apk-download-btn');
  const startDownloadBtnText = document.getElementById('start-download-btn-text');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const apkLinkInput = document.getElementById('apk-link-input');

  function openDownload() {
    if (downloadModal) downloadModal.classList.remove('hidden');
  }

  function closeDownload() {
    if (downloadModal) downloadModal.classList.add('hidden');
  }

  openDownloadBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openDownload();
    });
  });

  if (closeDownloadBtn) closeDownloadBtn.addEventListener('click', closeDownload);

  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) closeDownload();
    });
  }

  function triggerDirectApkDownload() {
    const a = document.createElement('a');
    a.href = 'WakeStop.apk';
    a.download = 'WakeStop.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (startApkDownloadBtn) {
    startApkDownloadBtn.addEventListener('click', (e) => {
      // Show instant feedback on the download button
      if (startDownloadBtnText) {
        startDownloadBtnText.textContent = 'Downloading WakeStop APK...';
        setTimeout(() => {
          startDownloadBtnText.textContent = 'Download APK Now';
        }, 3500);
      }
    });
  }

  // Populate actual APK download link into the input field
  if (apkLinkInput) {
    try {
      const fullUrl = new URL('WakeStop.apk', window.location.href).href;
      apkLinkInput.value = fullUrl;
    } catch (_) {
      apkLinkInput.value = window.location.origin + '/WakeStop.apk';
    }
  }

  if (copyLinkBtn && apkLinkInput) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(apkLinkInput.value).then(() => {
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyLinkBtn.textContent = 'Copy Link';
        }, 2000);
      }).catch(() => {
        apkLinkInput.select();
        document.execCommand('copy');
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyLinkBtn.textContent = 'Copy Link';
        }, 2000);
      });
    });
  }

  /* ==========================================================================
     8. LEGAL MODALS (PRIVACY, TERMS, CONTACT)
     ========================================================================== */
  const legalModal = document.getElementById('legal-modal');
  const closeLegalBtn = document.getElementById('close-legal-modal');
  const legalContent = document.getElementById('legal-content');

  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  const openTermsBtn = document.getElementById('open-terms-btn');
  const openContactBtn = document.getElementById('open-contact-btn');

  const legalDocuments = {
    privacy: `
      <div class="legal-tag">Privacy Policy</div>
      <h3 class="modal-title">Your Location Stays On Your Device</h3>
      <div class="apk-row font-mono" style="margin-bottom: 16px;"><span>Last updated:</span><span>October 2026</span></div>
      <div class="legal-body">
        <p>At <strong>Antigravity</strong>, we believe travel peace-of-mind should never come at the cost of personal surveillance.</p>
        <h4>1. On-Device Geofencing</h4>
        <p>All GPS location polling, distance radius calculations, and waypoint markers are executed strictly on your local device. We do not transmit your coordinates, travel routes, transit stops, or travel history to remote cloud servers.</p>
        <h4>2. Zero Telemetry & Tracking</h4>
        <p>The application contains no third-party advertising SDKs, behavioral analytics, or location brokers. Your destinations belong entirely to you.</p>
      </div>
    `,
    terms: `
      <div class="legal-tag">Terms of Service</div>
      <h3 class="modal-title">Terms & Safe Commuting Guidelines</h3>
      <div class="apk-row font-mono" style="margin-bottom: 16px;"><span>Last updated:</span><span>October 2026</span></div>
      <div class="legal-body">
        <p>Welcome to Antigravity GPS Wake-Up Alarm. By downloading or running the application, you agree to these terms.</p>
        <h4>1. Emergency Awareness</h4>
        <p>Antigravity is designed as a convenience alarm for public transit, trains, flights, and road travel. It does not replace personal situational awareness or emergency transit announcements.</p>
        <h4>2. License & Distribution</h4>
        <p>The software is provided for personal use. You may install the APK directly across your personal Android devices.</p>
      </div>
    `,
    contact: `
      <div class="legal-tag">Support & Inquiry</div>
      <h3 class="modal-title">Contact the Engineering Team</h3>
      <p class="modal-subtitle">Questions regarding device compatibility, GPS calibration, or custom fleet deployments?</p>
      <form id="contact-form" class="contact-form">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" required placeholder="you@domain.com" class="form-input">
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea required placeholder="Describe your question or feedback..." class="form-textarea"></textarea>
        </div>
        <button type="submit" class="btn-pill-primary w-full">Send Message</button>
        <div id="contact-success" class="highlight-green font-mono text-center" style="display:none; font-size:12px; margin-top:8px;">Thank you! Your message has been received.</div>
      </form>
    `
  };

  function openLegal(docKey) {
    if (legalContent && legalDocuments[docKey]) {
      legalContent.innerHTML = legalDocuments[docKey];
      if (docKey === 'contact') {
        const form = document.getElementById('contact-form');
        const success = document.getElementById('contact-success');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (success) success.style.display = 'block';
            setTimeout(() => {
              if (legalModal) legalModal.classList.add('hidden');
            }, 1800);
          });
        }
      }
    }
    if (legalModal) legalModal.classList.remove('hidden');
  }

  function closeLegal() {
    if (legalModal) legalModal.classList.add('hidden');
  }

  if (openPrivacyBtn) openPrivacyBtn.addEventListener('click', () => openLegal('privacy'));
  if (openTermsBtn) openTermsBtn.addEventListener('click', () => openLegal('terms'));
  if (openContactBtn) openContactBtn.addEventListener('click', () => openLegal('contact'));
  if (closeLegalBtn) closeLegalBtn.addEventListener('click', closeLegal);

  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) closeLegal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDownload();
      closeLegal();
    }
  });
})();
