/* ═══════════════════════════════════════════════
   DR. TANVI JAIN — PORTFOLIO
   Three.js 3D Background + Interactions
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Three.js 3D Particle Background ──────────
  const canvas = document.getElementById('three-canvas');
  let scene, camera, renderer, particleSystem, dnaHelixGroup;
  let mouseX = 0, mouseY = 0;
  let windowW = window.innerWidth;
  let windowH = window.innerHeight;

  function initThree() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, windowW / windowH, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(windowW, windowH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    createParticles();
    createDNAHelix();
    createFloatingMolecules();

    animate();
  }

  /* ── Floating Particles ─────────────────────── */
  function createParticles() {
    const count = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color(0x2a5cad),  // navy
      new THREE.Color(0x4a80d4),  // lighter blue
      new THREE.Color(0xd4a843),  // gold accent
      new THREE.Color(0x7aaaf0),  // soft blue
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 120;
      positions[i3 + 1] = (Math.random() - 0.5) * 120;
      positions[i3 + 2] = (Math.random() - 0.5) * 80;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  /* ── DNA Helix ──────────────────────────────── */
  function createDNAHelix() {
    dnaHelixGroup = new THREE.Group();
    const helixPoints = 80;
    const radius = 6;
    const height = 60;

    const sphereGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const matA = new THREE.MeshBasicMaterial({ color: 0x2a5cad, transparent: true, opacity: 0.5 });
    const matB = new THREE.MeshBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.4 });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4a80d4, transparent: true, opacity: 0.15 });

    for (let i = 0; i < helixPoints; i++) {
      const t = i / helixPoints;
      const angle = t * Math.PI * 6;
      const y = (t - 0.5) * height;

      // Strand A
      const xA = Math.cos(angle) * radius;
      const zA = Math.sin(angle) * radius;
      const sphereA = new THREE.Mesh(sphereGeo, matA);
      sphereA.position.set(xA, y, zA);
      dnaHelixGroup.add(sphereA);

      // Strand B (offset by PI)
      const xB = Math.cos(angle + Math.PI) * radius;
      const zB = Math.sin(angle + Math.PI) * radius;
      const sphereB = new THREE.Mesh(sphereGeo, matB);
      sphereB.position.set(xB, y, zB);
      dnaHelixGroup.add(sphereB);

      // Connecting "rungs" every 4th point
      if (i % 4 === 0) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(xA, y, zA),
          new THREE.Vector3(xB, y, zB),
        ]);
        const line = new THREE.Line(lineGeo, lineMat);
        dnaHelixGroup.add(line);
      }
    }

    dnaHelixGroup.position.set(35, 0, -20);
    dnaHelixGroup.rotation.z = 0.3;
    scene.add(dnaHelixGroup);
  }

  /* ── Floating Molecules ─────────────────────── */
  function createFloatingMolecules() {
    const group = new THREE.Group();

    for (let i = 0; i < 12; i++) {
      const geo = new THREE.OctahedronGeometry(Math.random() * 1.2 + 0.3, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x2a5cad : 0xd4a843,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40
      );
      mesh.userData.speed = Math.random() * 0.005 + 0.002;
      mesh.userData.axis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      group.add(mesh);
    }

    scene.add(group);
    scene.userData.molecules = group;
  }

  /* ── Animation Loop ─────────────────────────── */
  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0003;

    // Rotate particle system gently
    if (particleSystem) {
      particleSystem.rotation.y = time * 0.15;
      particleSystem.rotation.x = Math.sin(time * 0.5) * 0.05;
    }

    // Rotate DNA helix
    if (dnaHelixGroup) {
      dnaHelixGroup.rotation.y = time * 0.4;
      dnaHelixGroup.position.y = Math.sin(time * 2) * 3;
    }

    // Rotate molecules
    if (scene.userData.molecules) {
      scene.userData.molecules.children.forEach(mesh => {
        mesh.rotation.x += mesh.userData.speed;
        mesh.rotation.y += mesh.userData.speed * 0.7;
      });
    }

    // Subtle camera movement following mouse
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  /* ── Mouse tracking ─────────────────────────── */
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / windowW) * 2 - 1;
    mouseY = (e.clientY / windowH) * 2 - 1;
  });

  /* ── Resize ─────────────────────────────────── */
  window.addEventListener('resize', () => {
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    camera.aspect = windowW / windowH;
    camera.updateProjectionMatrix();
    renderer.setSize(windowW, windowH);
  });

  // ── Initialize Three.js ────────────────────────
  if (canvas) initThree();


  // ═══════════════════════════════════════════════
  // GSAP ANIMATIONS
  // ═══════════════════════════════════════════════

  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero entrance animation ────────────────── */
  const heroTL = gsap.timeline({ delay: 0.3 });
  heroTL
    .to('.hero-badge', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    .to('.hero-name', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
    .to('.hero-title', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
    .to('.hero-tags', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3');

  /* ── Scroll Reveal Elements ─────────────────── */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  revealElements.forEach((el, index) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          delay: index % 3 * 0.15,
          ease: 'power3.out',
          onComplete: () => el.classList.add('revealed'),
        });
      },
    });
  });


  // ═══════════════════════════════════════════════
  // COUNTER ANIMATION
  // ═══════════════════════════════════════════════

  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      if (counter.dataset.animated) return;
      const target = parseInt(counter.dataset.count, 10);
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        counter.textContent = Math.round(eased * target);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = target;
          counter.dataset.animated = 'true';
        }
      }
      requestAnimationFrame(update);
    });
  }

  // Trigger counters on hero stats visibility
  ScrollTrigger.create({
    trigger: '.hero-stats',
    start: 'top 90%',
    once: true,
    onEnter: animateCounters,
  });

  // Trigger metric rings
  ScrollTrigger.create({
    trigger: '.metrics-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      // Animate ring fills
      document.querySelectorAll('.metric-ring').forEach(ring => {
        const percent = parseInt(ring.dataset.percent, 10);
        const fill = ring.querySelector('.ring-fill');
        if (fill) {
          const circumference = 264; // 2 * PI * 42
          const offset = circumference - (circumference * percent / 100);
          fill.style.stroke = 'url(#ring-gradient)';
          fill.style.strokeDashoffset = offset;
        }
      });

      // Animate metric values
      document.querySelectorAll('.metric-value').forEach(el => {
        if (el.dataset.animated) return;
        const target = parseInt(el.dataset.count, 10);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else {
            el.textContent = target;
            el.dataset.animated = 'true';
          }
        }
        requestAnimationFrame(update);
      });
    },
  });

  // Add SVG gradient definition for rings
  const svgNS = 'http://www.w3.org/2000/svg';
  const svgs = document.querySelectorAll('.metric-ring svg');
  svgs.forEach(svg => {
    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'ring-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#d4a843');

    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#4a80d4');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.prepend(defs);
  });


  // ═══════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════

  const nav = document.getElementById('main-nav');

  /* ── Scroll styling ─────────────────────────── */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Back to top visibility
    const btn = document.getElementById('back-to-top');
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  /* ── Mobile nav toggle ──────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  /* ── Active nav link highlighting ───────────── */
  const sections = document.querySelectorAll('.section, .hero-section');

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active-link');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  /* ── Back to top ────────────────────────────── */
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ═══════════════════════════════════════════════
  // CONTACT FORM
  // ═══════════════════════════════════════════════

  const contactForm = document.getElementById('contact-form');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('form-submit');
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<span>Message Sent! ✓</span>';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
      // Re-initialize lucide icons for the button
      if (window.lucide) lucide.createIcons();
    }, 3000);
  });


  // ═══════════════════════════════════════════════
  // INITIALIZE LUCIDE ICONS
  // ═══════════════════════════════════════════════

  if (window.lucide) {
    lucide.createIcons();
  }

  // ═══════════════════════════════════════════════
  // SMOOTH SCROLL POLYFILL FOR ANCHOR LINKS
  // ═══════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
