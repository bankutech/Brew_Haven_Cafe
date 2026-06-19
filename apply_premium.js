const fs = require('fs');

const premiumCSS = `
/* ==========================================================================
   PREMIUM AESTHETIC UPGRADES
   ========================================================================== */

/* 1. Curved Layouts & Advanced Glassmorphism */
.main-header {
  background: rgba(253, 251, 247, 0.6) !important;
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

body.dark-mode .main-header {
  background: rgba(18, 14, 11, 0.6) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.shop-card, .menu-card, .features-card, .team-card, .about-card, .ambience-card, .testimonial-card, .sitemap-col {
  border-radius: 28px !important;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px -10px rgba(140, 98, 57, 0.1), 0 4px 10px -5px rgba(140, 98, 57, 0.05);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
  overflow: hidden;
}

body.dark-mode .shop-card, body.dark-mode .menu-card, body.dark-mode .features-card, body.dark-mode .team-card, body.dark-mode .about-card, body.dark-mode .ambience-card, body.dark-mode .testimonial-card, body.dark-mode .sitemap-col {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

/* 2. Premium Hover Effects */
.shop-card:hover, .menu-card:hover, .features-card:hover, .team-card:hover, .testimonial-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 40px -10px rgba(140, 98, 57, 0.2), 0 10px 20px -5px rgba(140, 98, 57, 0.1);
}

body.dark-mode .shop-card:hover, body.dark-mode .menu-card:hover, body.dark-mode .features-card:hover, body.dark-mode .team-card:hover {
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(197, 155, 39, 0.1);
}

.shop-card img, .menu-card img, .team-card img, .about-card img, .ambience-card img {
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.shop-card:hover img, .menu-card:hover img, .team-card:hover img, .about-card:hover img, .ambience-card:hover img {
  transform: scale(1.08);
}

/* Rounded Buttons with Glow */
.btn, .cart-toggle, .mobile-toggle, .floating-btn {
  border-radius: 50px !important;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover {
  box-shadow: 0 10px 20px -5px rgba(140, 98, 57, 0.5) !important;
  transform: translateY(-3px) scale(1.05);
}

body.dark-mode .btn-primary:hover {
  box-shadow: 0 10px 20px -5px rgba(197, 155, 39, 0.4) !important;
}

/* 3. Upgraded Reveal Animations with Blur */
.reveal, .reveal-left, .reveal-right, .reveal-scale {
  filter: blur(12px);
  will-change: opacity, transform, filter;
  transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 1.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.reveal.reveal-active, .reveal-left.reveal-active, .reveal-right.reveal-active, .reveal-scale.reveal-active {
  filter: blur(0);
}

.reveal-scale {
  opacity: 0;
  transform: scale(0.9);
}
.reveal-scale.reveal-active {
  opacity: 1;
  transform: scale(1);
}

/* 4. Ambient Glowing Background Orbs */
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.4;
  pointer-events: none;
  animation: floatOrb 20s ease-in-out infinite alternate;
}

@keyframes floatOrb {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(5%, 10%) scale(1.1); }
  100% { transform: translate(-5%, -10%) scale(0.9); }
}

body.dark-mode .ambient-orb.orb-1 { background: rgba(197, 155, 39, 0.15); }
body.dark-mode .ambient-orb.orb-2 { background: rgba(140, 98, 57, 0.15); }
.ambient-orb.orb-1 { background: rgba(226, 184, 66, 0.2); width: 600px; height: 600px; top: -100px; left: -100px; }
.ambient-orb.orb-2 { background: rgba(140, 98, 57, 0.1); width: 500px; height: 500px; bottom: -100px; right: -100px; }

/* 5. Flowing SVG Waves */
.wave-divider {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
  line-height: 0;
  z-index: 1;
}

.wave-divider svg {
  position: absolute;
  display: block;
  width: calc(100% + 1.3px);
  height: 100px;
}

.wave-divider .shape-fill {
  fill: var(--bg-primary);
  transition: fill 0.4s ease;
}

/* Smooth Parallax classes */
.parallax-bg {
  will-change: transform;
}
`;

const premiumJS = `
/* ==========================================================================
   PREMIUM AESTHETIC JAVASCRIPT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Inject Ambient Orbs globally
  const orb1 = document.createElement('div');
  orb1.className = 'ambient-orb orb-1';
  const orb2 = document.createElement('div');
  orb2.className = 'ambient-orb orb-2';
  document.body.prepend(orb1, orb2);

  // 2. Smooth Parallax Scrolling
  const heroImage = document.querySelector('.hero-content');
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    
    // Hero subtle parallax fade/scale
    if (heroImage && scrollY < window.innerHeight) {
      heroImage.style.transform = \`translateY(\${scrollY * 0.3}px)\`;
      heroImage.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
    }

    // Generic parallax elements
    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const speed = el.getAttribute('data-speed') || 0.15;
        el.style.transform = \`translateY(\${(rect.top - window.innerHeight/2) * speed}px)\`;
      }
    });
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  // 3. Staggered Reveals
  // Upgrade existing reveal classes to support stagger if they are in a grid
  const grids = document.querySelectorAll('.menu-grid, .shop-grid, .team-grid, .features-grid, .sitemap-grid');
  grids.forEach(grid => {
    const items = grid.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    items.forEach((item, index) => {
      item.style.transitionDelay = \`\${index * 0.1}s\`;
    });
  });

  // 4. Magnetic Buttons (Hover effect)
  const magneticButtons = document.querySelectorAll('.btn-primary');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = \`translate(\${x * 0.2}px, \${y * 0.2}px) scale(1.05)\`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // 5. Inject Wave Dividers after major sections dynamically
  const sections = document.querySelectorAll('.features, .menu-preview, .about-section, .testimonial-section');
  sections.forEach((sec, idx) => {
    // Skip if it already has a wave or is the last section
    if (idx % 2 === 0) {
      const wave = document.createElement('div');
      wave.className = 'wave-divider';
      wave.innerHTML = \`<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.54,196.42,106.68Z" class="shape-fill"></path>
      </svg>\`;
      sec.parentNode.insertBefore(wave, sec.nextSibling);
    }
  });

});
`;

fs.appendFileSync('style.css', '\n' + premiumCSS, 'utf8');
fs.appendFileSync('script.js', '\n' + premiumJS, 'utf8');

console.log('Premium aesthetic upgrades applied successfully.');
