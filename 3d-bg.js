/* ═══════════════════════════════════════════════════════════════
   BREWVERSE — 3D Interactive Animated Background
   Floating coffee beans, swirling particles, geometric rings,
   and mouse-reactive effects behind the portal split layout.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────
  const CONFIG = {
    particleCount: 8000,
    starCount: 3000,
    beanCount: 18,
    ringCount: 4,
    cafeColor: 0xC8873A,    // warm golden
    restColor: 0x5B8CCC,    // cool blue
    goldColor: 0xC8A96A,
    bgColor: 0x0D0D0D,
    fogDensity: 0.015
  };

  let scene, camera, renderer;
  let mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let clock, animId;
  let particleSystem, starSystem;
  let beans = [];
  let rings = [];
  let centralOrb;
  let isLight = false;

  // ─── INIT ──────────────────────────────────────────────────
  function init() {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'three-bg';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(CONFIG.bgColor, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(CONFIG.bgColor, CONFIG.fogDensity);

    // Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    clock = new THREE.Clock();

    // Lights
    const ambient = new THREE.AmbientLight(0x404050, 0.6);
    scene.add(ambient);

    const warmLight = new THREE.PointLight(CONFIG.cafeColor, 1.8, 40);
    warmLight.position.set(-8, 5, 8);
    warmLight.name = 'warmLight';
    scene.add(warmLight);

    const coolLight = new THREE.PointLight(CONFIG.restColor, 1.5, 40);
    coolLight.position.set(8, -3, 8);
    coolLight.name = 'coolLight';
    scene.add(coolLight);

    const centerLight = new THREE.PointLight(CONFIG.goldColor, 1, 20);
    centerLight.position.set(0, 0, 5);
    centerLight.name = 'centerLight';
    scene.add(centerLight);

    // Build elements
    buildParticleField();
    buildStarField();
    buildCoffeeBeans();
    buildGeometricRings();
    buildCentralOrb();
    buildFloatingDust();

    // Events — pointer-events are none on canvas so we listen on document
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // Watch for theme toggle
    observeTheme();

    // Start
    animate();
  }

  // ─── PARTICLE FIELD ────────────────────────────────────────
  function buildParticleField() {
    const count = CONFIG.particleCount;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    const cafeCol = new THREE.Color(CONFIG.cafeColor);
    const restCol = new THREE.Color(CONFIG.restColor);
    const goldCol = new THREE.Color(CONFIG.goldColor);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute in a disc/sphere shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 18;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // Color: left side warm, right side cool, center gold
      const xNorm = positions[i3] / 18; // -1 to 1
      let c;
      if (xNorm < -0.2) {
        c = cafeCol.clone().lerp(goldCol, Math.random() * 0.3);
      } else if (xNorm > 0.2) {
        c = restCol.clone().lerp(goldCol, Math.random() * 0.3);
      } else {
        c = goldCol.clone();
      }
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      speeds[i] = 0.2 + Math.random() * 0.8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.userData.speeds = speeds;

    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    particleSystem = new THREE.Points(geo, mat);
    scene.add(particleSystem);
  }

  // ─── STAR FIELD ────────────────────────────────────────────
  function buildStarField() {
    const count = CONFIG.starCount;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = -20 - Math.random() * 40;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    starSystem = new THREE.Points(geo, mat);
    scene.add(starSystem);
  }

  // ─── COFFEE BEANS (Abstract rounded shapes) ────────────────
  function buildCoffeeBeans() {
    const beanGeo = new THREE.SphereGeometry(0.15, 8, 6);
    // Squash to bean-like shape
    beanGeo.scale(1, 0.6, 1.4);

    for (let i = 0; i < CONFIG.beanCount; i++) {
      const side = i < CONFIG.beanCount / 2 ? -1 : 1; // left=cafe, right=restaurant
      const baseColor = side < 0 ? CONFIG.cafeColor : CONFIG.restColor;

      const mat = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 0.4,
        roughness: 0.3,
        transparent: true,
        opacity: 0.5 + Math.random() * 0.3,
        clearcoat: 0.8
      });

      const mesh = new THREE.Mesh(beanGeo, mat);

      // Position on each side
      mesh.position.set(
        side * (2 + Math.random() * 6),
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      mesh.userData = {
        rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.01 },
        floatSpeed: 0.3 + Math.random() * 0.7,
        floatAmp: 0.3 + Math.random() * 0.5,
        initialY: mesh.position.y,
        orbitRadius: 0.5 + Math.random() * 1,
        orbitSpeed: 0.1 + Math.random() * 0.3,
        orbitPhase: Math.random() * Math.PI * 2
      };

      beans.push(mesh);
      scene.add(mesh);
    }
  }

  // ─── GEOMETRIC RINGS ──────────────────────────────────────
  function buildGeometricRings() {
    const ringConfigs = [
      { radius: 3.5, tube: 0.012, color: CONFIG.goldColor, opacity: 0.25, rotAxis: 'x' },
      { radius: 5.0, tube: 0.015, color: CONFIG.cafeColor, opacity: 0.15, rotAxis: 'y' },
      { radius: 6.5, tube: 0.01, color: CONFIG.restColor, opacity: 0.15, rotAxis: 'z' },
      { radius: 4.2, tube: 0.01, color: CONFIG.goldColor, opacity: 0.1, rotAxis: 'xy' }
    ];

    ringConfigs.forEach((cfg, i) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Initial tilt
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotAxis: cfg.rotAxis,
        speed: 0.05 + i * 0.02
      };

      rings.push(mesh);
      scene.add(mesh);
    });
  }

  // ─── CENTRAL ORB (at divider line) ────────────────────────
  function buildCentralOrb() {
    // Glowing sphere at center
    const geo = new THREE.SphereGeometry(0.25, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: CONFIG.goldColor,
      transparent: true,
      opacity: 0.4
    });
    centralOrb = new THREE.Mesh(geo, mat);
    scene.add(centralOrb);

    // Outer glow ring
    const glowGeo = new THREE.RingGeometry(0.35, 0.8, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: CONFIG.goldColor,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glowRing = new THREE.Mesh(glowGeo, glowMat);
    glowRing.name = 'orbGlow';
    centralOrb.add(glowRing);
  }

  // ─── FLOATING DUST PARTICLES ──────────────────────────────
  function buildFloatingDust() {
    const count = 500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      color: CONFIG.goldColor,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const dust = new THREE.Points(geo, mat);
    dust.name = 'dust';
    scene.add(dust);
  }

  // ─── ANIMATE ───────────────────────────────────────────────
  function animate() {
    animId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    // Camera subtle sway from mouse
    camera.position.x = mouse.x * 1.5;
    camera.position.y = mouse.y * 0.8;
    camera.lookAt(0, 0, 0);

    // Rotate particle field slowly
    if (particleSystem) {
      particleSystem.rotation.y = t * 0.02;
      particleSystem.rotation.x = Math.sin(t * 0.1) * 0.05;

      // Gentle wave motion
      const positions = particleSystem.geometry.attributes.position.array;
      const speeds = particleSystem.geometry.userData.speeds;
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3;
        positions[i + 1] += Math.sin(t * speeds[idx] + positions[i] * 0.1) * 0.001;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Stars
    if (starSystem) {
      starSystem.rotation.y = t * 0.005;
      starSystem.rotation.z = t * 0.003;
    }

    // Coffee beans float + rotate
    beans.forEach(bean => {
      const ud = bean.userData;
      bean.rotation.x += ud.rotSpeed.x;
      bean.rotation.y += ud.rotSpeed.y;
      bean.rotation.z += ud.rotSpeed.z;

      bean.position.y = ud.initialY + Math.sin(t * ud.floatSpeed) * ud.floatAmp;

      // Gentle orbit
      const angle = t * ud.orbitSpeed + ud.orbitPhase;
      bean.position.x += Math.cos(angle) * 0.003;
      bean.position.z += Math.sin(angle) * 0.003;
    });

    // Rings rotate
    rings.forEach(ring => {
      const { rotAxis, speed } = ring.userData;
      if (rotAxis.includes('x')) ring.rotation.x += speed * 0.01;
      if (rotAxis.includes('y')) ring.rotation.y += speed * 0.01;
      if (rotAxis.includes('z')) ring.rotation.z += speed * 0.008;
    });

    // Central orb pulse
    if (centralOrb) {
      const s = 1 + Math.sin(t * 1.5) * 0.15;
      centralOrb.scale.setScalar(s);
      centralOrb.material.opacity = 0.25 + Math.sin(t * 2) * 0.15;

      const glowRing = centralOrb.getObjectByName('orbGlow');
      if (glowRing) {
        glowRing.rotation.z = t * 0.5;
        glowRing.scale.setScalar(1 + Math.sin(t * 1.2) * 0.2);
      }
    }

    // Dust float
    const dust = scene.getObjectByName('dust');
    if (dust) {
      dust.rotation.y = t * 0.01;
      const dPos = dust.geometry.attributes.position.array;
      for (let i = 0; i < dPos.length; i += 3) {
        dPos[i + 1] += 0.002;
        if (dPos[i + 1] > 7) dPos[i + 1] = -7;
      }
      dust.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  // ─── THEME OBSERVER ───────────────────────────────────────
  function observeTheme() {
    // Watch for body class changes (light mode toggle)
    const observer = new MutationObserver(() => {
      const bodyHasLight = document.body.classList.contains('light');
      if (bodyHasLight !== isLight) {
        isLight = bodyHasLight;
        updateTheme();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function updateTheme() {
    if (isLight) {
      renderer.setClearColor(0xF8F4EE, 1);
      scene.fog.color.set(0xF8F4EE);
      if (particleSystem) particleSystem.material.opacity = 0.35;
      if (starSystem) starSystem.material.opacity = 0.1;
      beans.forEach(b => { b.material.opacity = 0.35; });
      rings.forEach(r => { r.material.opacity *= 0.5; });
    } else {
      renderer.setClearColor(CONFIG.bgColor, 1);
      scene.fog.color.set(CONFIG.bgColor);
      if (particleSystem) particleSystem.material.opacity = 0.6;
      if (starSystem) starSystem.material.opacity = 0.35;
      beans.forEach(b => { b.material.opacity = 0.5 + Math.random() * 0.3; });
    }
  }

  // ─── EVENTS ────────────────────────────────────────────────
  function onMouseMove(e) {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ─── START ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
