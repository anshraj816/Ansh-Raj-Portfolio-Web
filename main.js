/**
 * ============================================================================
 * MASTER CONTROLLER: ANSH RAJ — 3D PERSONAL PORTFOLIO
 * Features: 4 Flagship Dashing 3D Scenes, WebGL Engine & Audio SFX
 * Modes:
 *   1. 'reactor'   // Cybernetic Quantum Reactor with Exploded View on Scroll
 *   2. 'laptop'    // Floating 3D Cyber Laptop with Live Terminal Execution
 *   3. 'brain'     // 3D AI Neural Synapse Brain with Electrical Pulses
 *   4. 'chrome'    // Liquid Molten Quicksilver & Chrome Fluid
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     0. PERSONAL BRAND CONFIGURATION OBJECT: ANSH RAJ
     -------------------------------------------------------------------------- */
  const PORTFOLIO_CONFIG = {
    name: "ANSH RAJ",
    title: "Data Science & Artificial Intelligence Engineer | Python & Web Developer",
    degree: "2nd Year B.Tech Computer Science Engineering (Data Science & AI) // Batch 2025–2029",
    email: "ar2575499@gmail.com",
    linkedin: "https://www.linkedin.com/in/ansh-raj-6442a7393",
    github: "https://github.com/anshraj816",
    status: "APPRENTICESHIP SEEKING",
    metrics: {
      rankAir: 68,
      certifications: 8,
      dedicationRate: 100
    }
  };

  // State Management
  const state = {
    audioEnabled: false,
    audioCtx: null,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    windowHalfX: window.innerWidth / 2,
    windowHalfY: window.innerHeight / 2,
    scrollProgress: 0,
    currentSection: 0,
    fps: 60,
    frameCount: 0,
    lastTime: performance.now(),
    webGlSupported: true,
    active3DMode: 'reactor'
  };

  /* --------------------------------------------------------------------------
     1. WEB AUDIO SYNTHESIZER
     -------------------------------------------------------------------------- */
  function initAudioContext() {
    if (!state.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        state.audioCtx = new AudioCtxClass();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playSynthSFX(type) {
    if (!state.audioEnabled || !state.audioCtx) return;
    try {
      const ctx = state.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.04);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'warp') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.24);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        osc.frequency.setValueAtTime(659.25, now + 0.16);
        osc.frequency.setValueAtTime(880, now + 0.24);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }

  // Audio Toggle UI Binding
  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      initAudioContext();
      state.audioEnabled = !state.audioEnabled;
      audioBtn.classList.toggle('active', state.audioEnabled);
      const label = audioBtn.querySelector('.sfx-text');
      if (label) {
        label.textContent = state.audioEnabled ? 'SFX: ACTIVE' : 'SFX: OFF';
      }
      if (state.audioEnabled) {
        playSynthSFX('warp');
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. THREE.JS 3D SCENE & FOUR DASHING 3D CONCEPTS
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('webgl-canvas');
  let scene, camera, renderer;
  let heroCoreGroup, particleSystem;
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };

  const targetCorePos = { x: 4.5, y: 0, z: 0 };
  const targetCoreScale = { x: 1, y: 1, z: 1 };

  // 4 Flagship 3D Modes
  const modeGroups = {
    reactor: new THREE.Group(),
    laptop: new THREE.Group(),
    brain: new THREE.Group(),
    chrome: new THREE.Group()
  };

  // Dynamic Terminal Canvas Texture for the 3D Laptop
  let terminalCanvas, terminalCtx, terminalTexture;
  let cursorBlink = true;
  let blinkTimer = 0;

  function createLiveTerminalTexture() {
    terminalCanvas = document.createElement('canvas');
    terminalCanvas.width = 512;
    terminalCanvas.height = 320;
    terminalCtx = terminalCanvas.getContext('2d');
    terminalTexture = new THREE.CanvasTexture(terminalCanvas);
    terminalTexture.anisotropy = 4;
    return terminalTexture;
  }

  function updateLiveTerminal(time) {
    if (!terminalCtx) return;
    const ctx = terminalCtx;

    // Terminal Background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, 512, 320);

    // Title bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 32);

    // Window controls (Red, Yellow, Green dots)
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(20, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(36, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(52, 16, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('bash — ansh_raj@ai-core-node', 72, 20);

    // Code output lines
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('ansh@ai-lab:~$ python data_analytics_model.py', 20, 68);

    ctx.font = '13px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('[✓] IIT GUWAHATI TECHNOTHLON: AIR 68 VERIFIED', 20, 102);

    ctx.fillStyle = '#a855f7';
    ctx.fillText('[✓] EY & MICROSOFT AI SKILL PASSPORT LOADED', 20, 130);

    ctx.fillStyle = '#60a5fa';
    ctx.fillText('[✓] AWS SOLUTIONS ARCHITECTURE SIMULATION: ACTIVE', 20, 158);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('[*] TRAINING DEEP LEARNING MODEL ON PANDAS/NUMPY...', 20, 188);

    // Progress bar
    const progressPct = Math.floor((Math.sin(time * 2) * 0.5 + 0.5) * 100);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(20, 204, 460, 14);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(20, 204, (460 * progressPct) / 100, 14);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`STATUS: OPTIMIZED [${progressPct}%] — ACCURACY: 99.4%`, 20, 244);

    // Cursor
    if (Math.floor(time * 3) % 2 === 0) {
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('>> READY FOR APPRENTICESHIP TRANSMISSION _', 20, 280);
    } else {
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('>> READY FOR APPRENTICESHIP TRANSMISSION', 20, 280);
    }

    terminalTexture.needsUpdate = true;
  }

  // Neural Brain Axon Pulses State
  const brainPulses = [];

  function buildAll4FlagshipModes() {
    // ========================================================================
    // CONCEPT 1: 3D CYBERNETIC QUANTUM REACTOR (EXPLODED VIEW ON SCROLL)
    // ========================================================================
    const reactorInnerGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const reactorInnerMat = new THREE.MeshStandardMaterial({
      color: 0x050b14,
      roughness: 0.2,
      metalness: 0.9
    });
    const reactorPlasma = new THREE.Mesh(reactorInnerGeo, reactorInnerMat);
    reactorPlasma.name = "reactorPlasma";
    modeGroups.reactor.add(reactorPlasma);

    const reactorWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const reactorWire = new THREE.Mesh(reactorInnerGeo, reactorWireMat);
    modeGroups.reactor.add(reactorWire);

    // 3 Beveled Mechanical Gimbal Rings that Explode on Scroll
    const ring1Geo = new THREE.TorusGeometry(4.4, 0.14, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.3, metalness: 0.8 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.name = "reactorRing1";
    ring1.rotation.x = Math.PI / 3;
    modeGroups.reactor.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(5.8, 0.12, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3, metalness: 0.8 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.name = "reactorRing2";
    ring2.rotation.y = Math.PI / 4;
    modeGroups.reactor.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(7.2, 0.08, 16, 120);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.name = "reactorRing3";
    ring3.rotation.z = Math.PI / 6;
    modeGroups.reactor.add(ring3);

    // 4 Laser Conduits through the Core
    for (let i = 0; i < 4; i++) {
      const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 15, 8);
      const laserMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f0ff : 0x8b5cf6, transparent: true, opacity: 0.6 });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.rotation.z = (i * Math.PI) / 4;
      laser.rotation.x = (i * Math.PI) / 8;
      modeGroups.reactor.add(laser);
    }

    // ========================================================================
    // CONCEPT 2: FLOATING 3D CYBER LAPTOP & LIVE TERMINAL
    // ========================================================================
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, -1, 0);

    // Base Chassis
    const baseGeo = new THREE.BoxGeometry(8.8, 0.35, 5.8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0c101c, roughness: 0.2, metalness: 0.85 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    laptopGroup.add(baseMesh);

    // Keyboard Matrix (Emissive grid)
    const kbGeo = new THREE.PlaneGeometry(7.4, 2.8);
    const kbMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35, wireframe: true });
    const kbMesh = new THREE.Mesh(kbGeo, kbMat);
    kbMesh.rotation.x = -Math.PI / 2;
    kbMesh.position.set(0, 0.19, -0.6);
    laptopGroup.add(kbMesh);

    // Trackpad
    const tpGeo = new THREE.PlaneGeometry(2.4, 1.4);
    const tpMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 });
    const tpMesh = new THREE.Mesh(tpGeo, tpMat);
    tpMesh.rotation.x = -Math.PI / 2;
    tpMesh.position.set(0, 0.19, 1.6);
    laptopGroup.add(tpMesh);

    // Display Screen Lid (Angled at 110 degrees)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.18, -2.8); // Hinge position
    lidGroup.rotation.x = -Math.PI * 0.38;

    const lidBezelGeo = new THREE.BoxGeometry(8.8, 5.8, 0.2);
    const lidBezel = new THREE.Mesh(lidBezelGeo, baseMat);
    lidBezel.position.set(0, 2.9, 0);
    lidGroup.add(lidBezel);

    // Live Animated Terminal Screen
    const termTexture = createLiveTerminalTexture();
    const screenGeo = new THREE.PlaneGeometry(8.2, 5.2);
    const screenMat = new THREE.MeshBasicMaterial({ map: termTexture });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 2.9, 0.11);
    lidGroup.add(screenMesh);

    laptopGroup.add(lidGroup);

    // Floating 3D Holographic Bars Hovering Above Keyboard
    const holoBars = new THREE.Group();
    holoBars.name = "holoBars";
    for (let i = 0; i < 7; i++) {
      const bHeight = 0.8 + Math.random() * 2.2;
      const bGeo = new THREE.BoxGeometry(0.3, bHeight, 0.3);
      const bMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f0ff : 0x8b5cf6, transparent: true, opacity: 0.7 });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(-2.4 + i * 0.8, 1.2 + bHeight / 2, -0.6);
      holoBars.add(bMesh);
    }
    laptopGroup.add(holoBars);
    modeGroups.laptop.add(laptopGroup);

    // ========================================================================
    // CONCEPT 3: 3D AI NEURAL SYNAPSE BRAIN (ANATOMICAL DUAL HEMISPHERES)
    // ========================================================================
    const brainGroup = new THREE.Group();
    const nodeCount = 700;
    const leftHemispherePoints = [];
    const rightHemispherePoints = [];

    // Parametric mathematical lobe generation
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      // Sinusoidal brain convolutions (gyri and sulci)
      const conv = 1.0 + 0.18 * Math.sin(theta * 6) * Math.cos(phi * 4);

      const rX = 3.6 * conv * Math.sin(phi) * Math.cos(theta);
      const rY = 4.2 * conv * Math.sin(phi) * Math.sin(theta);
      const rZ = 4.8 * conv * Math.cos(phi);

      // Left lobe
      leftHemispherePoints.push(new THREE.Vector3(rX - 0.7, rY, rZ));
      // Right lobe
      rightHemispherePoints.push(new THREE.Vector3(rX + 0.7, rY, rZ));
    }

    // Build Point Clouds for Left & Right Hemispheres
    const leftGeo = new THREE.BufferGeometry().setFromPoints(leftHemispherePoints);
    const rightGeo = new THREE.BufferGeometry().setFromPoints(rightHemispherePoints);

    const brainNodeMat = new THREE.PointsMaterial({
      size: 0.16,
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const brainRightMat = new THREE.PointsMaterial({
      size: 0.16,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    brainGroup.add(new THREE.Points(leftGeo, brainNodeMat));
    brainGroup.add(new THREE.Points(rightGeo, brainRightMat));

    // Curved Axon Laser Lines Connecting Key Nodes
    for (let i = 0; i < 90; i++) {
      const idx1 = Math.floor(Math.random() * nodeCount);
      const idx2 = Math.floor(Math.random() * nodeCount);
      const p1 = leftHemispherePoints[idx1];
      const p2 = rightHemispherePoints[idx2];

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += (Math.random() - 0.5) * 1.5;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(12));
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0x8b5cf6,
        transparent: true,
        opacity: 0.35
      });
      brainGroup.add(new THREE.Line(lineGeo, lineMat));

      // Create animated electrical light packets (pulses)
      if (i < 12) {
        const pulseGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        pulseMesh.position.copy(p1);
        brainGroup.add(pulseMesh);
        brainPulses.push({ mesh: pulseMesh, curve: curve, progress: Math.random(), speed: 0.008 + Math.random() * 0.012 });
      }
    }
    modeGroups.brain.add(brainGroup);

    // ========================================================================
    // CONCEPT 4: LIQUID MOLTEN QUICKSILVER & CHROME CAUSTICS
    // ========================================================================
    const knotGeo = new THREE.TorusKnotGeometry(3.6, 1.25, 160, 32, 2, 3);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x141b2d,
      roughness: 0.04,
      metalness: 0.98,
      wireframe: false
    });
    const chromeMesh = new THREE.Mesh(knotGeo, chromeMat);
    chromeMesh.name = "chromeKnot";
    modeGroups.chrome.add(chromeMesh);

    // Iridescent Wireframe Reflection Halo
    const chromeWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const chromeWire = new THREE.Mesh(knotGeo, chromeWireMat);
    modeGroups.chrome.add(chromeWire);

    // Orbital Liquid Beads
    for (let i = 0; i < 8; i++) {
      const beadGeo = new THREE.SphereGeometry(0.35 + Math.random() * 0.25, 16, 16);
      const beadMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.1, metalness: 0.95 });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      const angle = (i / 8) * Math.PI * 2;
      bead.position.set(Math.cos(angle) * 6.5, Math.sin(angle) * 6.5, (Math.random() - 0.5) * 2);
      modeGroups.chrome.add(bead);
    }
  }

  function set3DMode(modeName) {
    if (!heroCoreGroup || !modeGroups[modeName]) return;
    state.active3DMode = modeName;

    // Clear existing children
    while (heroCoreGroup.children.length > 0) {
      heroCoreGroup.remove(heroCoreGroup.children[0]);
    }

    // Attach selected flagship mode
    heroCoreGroup.add(modeGroups[modeName]);

    // Update Telemetry
    const modeEl = document.getElementById('telemetry-mode');
    if (modeEl) {
      modeEl.textContent = modeName.toUpperCase();
    }

    // Sync button UI
    const switchBtns = document.querySelectorAll('.switch-btn');
    switchBtns.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-mode') === modeName);
    });

    playSynthSFX('warp');
  }

  function initThreeScene() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js CDN unavailable.');
      state.webGlSupported = false;
      return;
    }

    try {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.0022);

      camera = new THREE.PerspectiveCamera(
        42,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 24;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Master Core Group
      heroCoreGroup = new THREE.Group();
      heroCoreGroup.position.set(targetCorePos.x, targetCorePos.y, targetCorePos.z);
      scene.add(heroCoreGroup);

      // Build 4 Flagship Dashing Modes
      buildAll4FlagshipModes();

      // Read ?mode= param or default to 'reactor'
      const urlParams = new URLSearchParams(window.location.search);
      const requestedMode = urlParams.get('mode') || 'reactor';
      const startMode = modeGroups[requestedMode] ? requestedMode : 'reactor';
      set3DMode(startMode);

      // 1,600-particle Galaxy Background
      const count = 1600;
      const partGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const colorBlue = new THREE.Color(0x00f0ff);
      const colorViolet = new THREE.Color(0x8b5cf6);
      const colorWhite = new THREE.Color(0xffffff);

      for (let i = 0; i < count * 3; i += 3) {
        const rad = 14 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i] = rad * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = rad * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = rad * Math.cos(phi);

        const r = Math.random();
        const c = r > 0.65 ? colorBlue : r > 0.35 ? colorViolet : colorWhite;
        colors[i] = c.r;
        colors[i + 1] = c.g;
        colors[i + 2] = c.b;
      }

      partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const partMat = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      particleSystem = new THREE.Points(partGeo, partMat);
      scene.add(particleSystem);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 1.1);
      scene.add(ambient);

      const lightCyan = new THREE.PointLight(0x00f0ff, 3.5, 50);
      lightCyan.position.set(12, 10, 14);
      scene.add(lightCyan);

      const lightViolet = new THREE.PointLight(0x8b5cf6, 3.0, 50);
      lightViolet.position.set(-14, -12, 10);
      scene.add(lightViolet);

      // Interactive Mouse Drag to Rotate
      window.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging && heroCoreGroup) {
          const dx = e.clientX - prevMouse.x;
          const dy = e.clientY - prevMouse.y;
          heroCoreGroup.rotation.y += dx * 0.005;
          heroCoreGroup.rotation.x += dy * 0.005;
          prevMouse = { x: e.clientX, y: e.clientY };
        }
      });

    } catch (err) {
      console.warn('WebGL initialization error:', err);
      state.webGlSupported = false;
    }
  }

  /* --------------------------------------------------------------------------
     3. RENDER LOOP & SPECIALIZED OBJECT MOTIONS
     -------------------------------------------------------------------------- */
  function renderLoop() {
    requestAnimationFrame(renderLoop);

    const now = performance.now();
    const timeSec = now * 0.001;

    // Live FPS Telemetry
    state.frameCount++;
    if (now - state.lastTime >= 1000) {
      state.fps = Math.round((state.frameCount * 1000) / (now - state.lastTime));
      const fpsEl = document.getElementById('telemetry-fps');
      if (fpsEl) fpsEl.textContent = state.fps;
      state.frameCount = 0;
      state.lastTime = now;
    }

    // Smooth Mouse Physics Lerp
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

    // ------------------------------------------------------------------------
    // Mode-Specific Animations & Scroll Reactions
    // ------------------------------------------------------------------------
    if (heroCoreGroup) {
      if (!isDragging) {
        if (state.active3DMode === 'reactor') {
          // Cybernetic Reactor Rotations
          heroCoreGroup.rotation.y += 0.003;
          heroCoreGroup.rotation.x += 0.0015;

          const r1 = modeGroups.reactor.getObjectByName('reactorRing1');
          const r2 = modeGroups.reactor.getObjectByName('reactorRing2');
          const r3 = modeGroups.reactor.getObjectByName('reactorRing3');
          const plasma = modeGroups.reactor.getObjectByName('reactorPlasma');

          if (r1) r1.rotation.z += 0.006;
          if (r2) r2.rotation.z -= 0.004;
          if (r3) r3.rotation.z += 0.003;
          if (plasma) {
            const pulse = 1.0 + Math.sin(timeSec * 3) * 0.08;
            plasma.scale.set(pulse, pulse, pulse);
          }

          // EXPLODED VIEW ON SCROLL: Rings spread apart as user scrolls!
          const explosionDist = state.scrollProgress * 4.5;
          if (r1) r1.position.z = Math.sin(timeSec) * 0.5 + explosionDist * 0.8;
          if (r2) r2.position.z = -Math.sin(timeSec) * 0.5 - explosionDist * 0.8;
          if (r3) r3.position.x = Math.cos(timeSec) * 0.5 + explosionDist * 0.5;

        } else if (state.active3DMode === 'laptop') {
          // 3D Cyber Laptop Motion & Terminal Canvas Rendering
          updateLiveTerminal(timeSec);
          heroCoreGroup.rotation.y = Math.sin(timeSec * 0.8) * 0.25 - 0.2;
          heroCoreGroup.rotation.x = 0.2 + Math.cos(timeSec * 0.6) * 0.1;

          // Animate floating holographic bars
          const bars = modeGroups.laptop.getObjectByName('holoBars');
          if (bars) {
            bars.children.forEach((b, idx) => {
              b.scale.y = 0.6 + Math.sin(timeSec * 3 + idx) * 0.5;
            });
          }

        } else if (state.active3DMode === 'brain') {
          // AI Neural Brain Breathing & Axon Light Pulses
          heroCoreGroup.rotation.y += 0.003;
          heroCoreGroup.rotation.x = Math.sin(timeSec * 0.5) * 0.1;

          // Electrical impulses travel across synapses
          brainPulses.forEach((p) => {
            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;
            const pt = p.curve.getPoint(p.progress);
            p.mesh.position.copy(pt);
          });

        } else if (state.active3DMode === 'chrome') {
          // Molten Quicksilver Knot
          heroCoreGroup.rotation.x += 0.004;
          heroCoreGroup.rotation.y += 0.006;
          const knot = modeGroups.chrome.getObjectByName('chromeKnot');
          if (knot) {
            const s = 1.0 + Math.sin(timeSec * 2) * 0.05;
            knot.scale.set(s, s, s);
          }
        }
      }

      // Smooth Position & Scale Transition according to current section
      heroCoreGroup.position.x += ((targetCorePos.x + state.mouse.x * 2) - heroCoreGroup.position.x) * 0.04;
      heroCoreGroup.position.y += ((targetCorePos.y - state.mouse.y * 2) - heroCoreGroup.position.y) * 0.04;
      heroCoreGroup.position.z += (targetCorePos.z - heroCoreGroup.position.z) * 0.04;

      heroCoreGroup.scale.x += (targetCoreScale.x - heroCoreGroup.scale.x) * 0.04;
      heroCoreGroup.scale.y += (targetCoreScale.y - heroCoreGroup.scale.y) * 0.04;
      heroCoreGroup.scale.z += (targetCoreScale.z - heroCoreGroup.scale.z) * 0.04;
    }

    // Background Particle Galaxy Drift
    if (particleSystem) {
      particleSystem.rotation.y -= 0.0004;
      particleSystem.rotation.x = state.mouse.y * 0.15;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // Camera & 3D Core Positions for Each Section (0 to 6)
  function adjust3DSceneForSection(idx) {
    if (!heroCoreGroup) return;
    const isMobile = window.innerWidth <= 1024;

    if (idx === 0) {
      // 00 // HERO
      targetCorePos.x = isMobile ? 0 : 4.6;
      targetCorePos.y = 0;
      targetCorePos.z = 0;
      targetCoreScale.x = 1; targetCoreScale.y = 1; targetCoreScale.z = 1;
    } else if (idx === 1) {
      // 01 // ABOUT
      targetCorePos.x = isMobile ? 0 : -5.4;
      targetCorePos.y = 1.0;
      targetCorePos.z = 1.8;
      targetCoreScale.x = 1.15; targetCoreScale.y = 1.15; targetCoreScale.z = 1.15;
    } else if (idx === 2) {
      // 02 // SKILLS
      targetCorePos.x = isMobile ? 0 : 5.2;
      targetCorePos.y = -0.5;
      targetCorePos.z = 0;
      targetCoreScale.x = 0.95; targetCoreScale.y = 0.95; targetCoreScale.z = 0.95;
    } else if (idx === 3) {
      // 03 // PROJECTS
      targetCorePos.x = 0;
      targetCorePos.y = -1.2;
      targetCorePos.z = -7;
      targetCoreScale.x = 1.45; targetCoreScale.y = 1.45; targetCoreScale.z = 1.45;
    } else if (idx === 4) {
      // 04 // FOCUS / SERVICES
      targetCorePos.x = isMobile ? 0 : -4.8;
      targetCorePos.y = 0.5;
      targetCorePos.z = -1;
      targetCoreScale.x = 1.05; targetCoreScale.y = 1.05; targetCoreScale.z = 1.05;
    } else if (idx === 5) {
      // 05 // CREDENTIALS & CERTIFICATIONS
      targetCorePos.x = isMobile ? 0 : 5.0;
      targetCorePos.y = 0;
      targetCorePos.z = 0;
      targetCoreScale.x = 0.9; targetCoreScale.y = 0.9; targetCoreScale.z = 0.9;
    } else if (idx === 6) {
      // 06 // CONTACT
      targetCorePos.x = 0;
      targetCorePos.y = 0;
      targetCorePos.z = 1.5;
      targetCoreScale.x = 1.25; targetCoreScale.y = 1.25; targetCoreScale.z = 1.25;
    }
  }

  /* --------------------------------------------------------------------------
     4. MOUSE MOVEMENT, MAGNETIC CURSOR & HUD TELEMETRY
     -------------------------------------------------------------------------- */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  window.addEventListener('mousemove', (e) => {
    state.mouse.targetX = (e.clientX - state.windowHalfX) * 0.002;
    state.mouse.targetY = (e.clientY - state.windowHalfY) * 0.002;

    if (cursorDot) {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
    if (cursorRing) {
      cursorRing.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  });

  // Cursor Hover Feedback
  const interactives = document.querySelectorAll('a, button, [data-tilt], input, textarea, .skill-pill, .profile-link-item');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      playSynthSFX('hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // Audio SFX on Button Clicks
  document.querySelectorAll('[data-sfx="click"]').forEach((btn) => {
    btn.addEventListener('click', () => playSynthSFX('click'));
  });

  /* --------------------------------------------------------------------------
     5. 3D SCENE MODE SWITCHER BINDINGS
     -------------------------------------------------------------------------- */
  const switchBtns = document.querySelectorAll('.switch-btn');
  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      switchBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      set3DMode(mode);
    });
  });

  /* --------------------------------------------------------------------------
     6. SCROLL HANDLING & NAVIGATION DYNAMICS
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-item');
  const telemetryScroll = document.getElementById('telemetry-scroll');

  function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollY / (maxScroll || 1), 0), 1);
    state.scrollProgress = progress;

    if (telemetryScroll) {
      telemetryScroll.textContent = `${Math.round(progress * 100)}%`;
    }

    // Determine current section in view
    let activeIdx = 0;
    sections.forEach((sec, idx) => {
      const top = sec.offsetTop - 280;
      if (scrollY >= top) {
        activeIdx = idx;
      }
    });

    if (state.currentSection !== activeIdx) {
      state.currentSection = activeIdx;
      adjust3DSceneForSection(activeIdx);

      navItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIdx);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth Nav Click Routing
  navItems.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      playSynthSFX('warp');
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* --------------------------------------------------------------------------
     7. MATHEMATICAL 3D TILT EFFECT ON CARDS
     -------------------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotX = ((y - centerY) / centerY) * -8;
      const rotY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });

  /* --------------------------------------------------------------------------
     8. METRIC COUNT-UP ANIMATION
     -------------------------------------------------------------------------- */
  function runMetricCounters() {
    const numEls = document.querySelectorAll('.metric-number');
    numEls.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-target'));
      let curr = 0;
      const step = Math.max(target / 45, 0.05);
      const timer = setInterval(() => {
        curr += step;
        if (curr >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = target % 1 === 0 ? Math.floor(curr) : curr.toFixed(1);
        }
      }, 30);
    });
  }

  /* --------------------------------------------------------------------------
     9. CONTACT FORM VALIDATION & TRANSMISSION
     -------------------------------------------------------------------------- */
  window.handleFormSubmit = function (event) {
    event.preventDefault();
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');
    const statusBox = document.getElementById('form-status');

    let isValid = true;

    form.querySelectorAll('.input-group').forEach((grp) => grp.classList.remove('has-error'));

    if (!nameInput.value.trim()) {
      nameInput.closest('.input-group').classList.add('has-error');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      emailInput.closest('.input-group').classList.add('has-error');
      isValid = false;
    }

    if (!messageInput.value.trim()) {
      messageInput.closest('.input-group').classList.add('has-error');
      isValid = false;
    }

    if (!isValid) return;

    playSynthSFX('send');
    if (statusBox) {
      statusBox.textContent = `✓ MESSAGE SENT // THANK YOU FOR CONTACTING ANSH RAJ!`;
      statusBox.classList.add('success');
      form.reset();

      setTimeout(() => {
        statusBox.textContent = '';
        statusBox.classList.remove('success');
      }, 6000);
    }
  };

  /* --------------------------------------------------------------------------
     10. ANSH RAJ CURRICULUM VITAE DOWNLOAD
     -------------------------------------------------------------------------- */
  window.downloadResumeMock = function (e) {
    e.preventDefault();
    playSynthSFX('click');
    
    const cvContent = `================================================================================
ANSH RAJ — CURRICULUM VITAE
Email: ar2575499@gmail.com
LinkedIn: https://www.linkedin.com/in/ansh-raj-6442a7393
GitHub: https://github.com/anshraj816
Degree: 2nd Year B.Tech Computer Science Engineering (Data Science & AI)
Academic Batch: 2025 — 2029
Target: Seeking a Data Analytics Apprenticeship
================================================================================

PROFESSIONAL SUMMARY
Motivated and detail-oriented second-year B.Tech Computer Science Engineering 
(Data Science & Artificial Intelligence) student (Batch 2025–2029) with a strong 
foundation in Python, Git, GitHub, and web development. Passionate about solving 
real-world problems through technology and continuously improving programming skills. 
Seeking a Data Analytics Apprenticeship where I can contribute, learn from 
experienced professionals, and build impactful solutions.

ACADEMIC BACKGROUND
- Bachelor of Technology (B.Tech) in Computer Science & Engineering
  Specialization: Data Science & Artificial Intelligence
  Duration: 2025 — 2029 (Currently in 2nd Year)
  Coursework: Python Programming, Data Structures, Database Systems, 
              Data Science Foundations, AI Algorithms.

VERIFIED CERTIFICATIONS & ACHIEVEMENTS
1. IIT GUWAHATI — GOLD CERTIFICATE
   Technothlon Prelims '23 // HAULT All India Rank 68 (AIR 68)
2. EY & MICROSOFT — "AI Skill Passport" Certification
   Generative AI, machine learning ethics, cloud data principles.
3. AWS & FORAGE — Solutions Architecture Job Simulation
   Cloud architecture design, high availability, scalable storage.
4. INDIA AI (Govt of India / MeitY) — "YUVA AI for ALL"
   AI principles, ethics, and national implementation.
5. LARSEN & TOUBRO (L&T) — Website Certificate
   Modern web engineering and design standards.
6. LARSEN & TOUBRO (L&T) — IT World Essential
   Information technology enterprise essentials.
7. LARSEN & TOUBRO (L&T) — Critical Thinking, Design Thinking, Leadership & Teamwork
   Strategic problem decomposition and collaboration.
8. UDEMY — WordPress Website Development & CMS
   WordPress theme customization, plugins, and web publishing.

TECHNICAL SKILLS
- Programming Languages: Python, JavaScript (ES6+), HTML5, CSS3
- Data Science & Analytics: Exploratory Data Analysis (EDA), NumPy, Pandas, Matplotlib
- Web Development: Responsive Web Design, WordPress CMS, Three.js (3D WebGL)
- Developer Tools: Git, GitHub, AWS, VS Code, Jupyter Notebooks
- Soft Skills: Critical Thinking, Design Thinking, Leadership, Teamwork (L&T Certified)

KEY PROJECTS
1. QUANTRIX — Personal Intelligence & Analytics Platform
   Live Demo: https://quantrix-ai-lab.github.io/
   GitHub: https://github.com/quantrix-ai-lab/quantrix-ai-lab.github.io
   - High-performance personal intelligence platform with cashflow simulation,
     routine balancing, and browser-based CSV telemetry anomaly auditing.

2. Python Data Analytics & Exploratory Suite
   GitHub: https://github.com/anshraj816
   - Exploratory data analysis suite utilizing Pandas, NumPy, and Matplotlib
     for dataset profiling, outlier detection, and statistical reporting.

3. Interactive 3D Web Portfolio
   GitHub: https://github.com/anshraj816
   - Dimensional personal web experience built with Three.js, WebGL, CSS Grid,
     and Web Audio API with real-time interactive physics.
================================================================================`;

    const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Ansh_Raj_Curriculum_Vitae.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* --------------------------------------------------------------------------
     10. BIOMETRIC SCANNER CARD: 1 TO 100 DECRYPTION & 3D FLIP REVEAL
     -------------------------------------------------------------------------- */
  function initBiometricScanner() {
    if (window.ANSH_PROFILE_IMG) {
      document.querySelectorAll('.profile-photo-scan, .profile-photo').forEach((img) => {
        img.src = window.ANSH_PROFILE_IMG;
      });
    }

    const card = document.getElementById('biometricCard');
    const overlay = document.getElementById('scanLoadingOverlay') || document.getElementById('scanCounterBox');
    const pctVal = document.getElementById('scanLoadingPct') || document.getElementById('scanCounterVal');

    if (!card) {
      console.warn('Biometric card element (#biometricCard) not found.');
      return;
    }

    let scanInterval = null;
    let isFlipped = false;
    let isScanning = false;

    function startDecryption() {
      if (isFlipped || isScanning) return;
      isScanning = true;

      if (overlay) {
        overlay.classList.add('active');
        overlay.style.display = 'flex';
      }

      let progress = 1;
      if (pctVal) pctVal.textContent = '1%';
      playSynthSFX('hover');

      clearInterval(scanInterval);
      // Smooth 1 to 100 counter over ~900ms
      scanInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 3;
        if (progress >= 100) {
          progress = 100;
          if (pctVal) pctVal.textContent = '100%';
          clearInterval(scanInterval);
          isScanning = false;

          // Brief pause on 100% then trigger 3D Flip
          setTimeout(() => {
            card.classList.add('is-flipped');
            isFlipped = true;
            if (overlay) {
              overlay.classList.remove('active');
              overlay.style.display = 'none';
            }
            playSynthSFX('send');
          }, 140);
        } else {
          if (pctVal) pctVal.textContent = `${progress}%`;
          if (progress % 20 === 0) {
            playSynthSFX('click');
          }
        }
      }, 30);
    }

    function resetScanner() {
      clearInterval(scanInterval);
      isScanning = false;
      isFlipped = false;
      card.classList.remove('is-flipped');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
      }
      if (pctVal) pctVal.textContent = '0%';
      playSynthSFX('warp');
    }

    // Mouse interactions:
    card.addEventListener('mouseenter', () => {
      startDecryption();
    });

    card.addEventListener('mouseleave', () => {
      resetScanner();
    });

    // Touch / Click support:
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;
      if (isFlipped) {
        resetScanner();
      } else if (!isScanning) {
        startDecryption();
      }
    });
  }

  /* --------------------------------------------------------------------------
     11. RESIZE & INITIALIZATION
     -------------------------------------------------------------------------- */
  window.addEventListener('resize', () => {
    state.windowHalfX = window.innerWidth / 2;
    state.windowHalfY = window.innerHeight / 2;

    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    adjust3DSceneForSection(state.currentSection);
  });

  function initPortfolioApp() {
    initThreeScene();
    if (state.webGlSupported) {
      renderLoop();
      adjust3DSceneForSection(0);
    }
    runMetricCounters();
    initBiometricScanner();
    document.body.classList.remove('loading');
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initPortfolioApp);
  } else {
    initPortfolioApp();
  }

})();