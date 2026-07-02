/* ═══════════════════════════════════════════════════════
   ELEVATE DIGITAL — JavaScript
   Particles · Scroll effects · Carousel · Forms · Stats
═══════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. NAVBAR SCROLL BEHAVIOUR
───────────────────────────────────────── */
const navbar  = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Active link highlighting
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 200) current = section.id;
  });
  navItems.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === `#${current}`) {
      a.style.color = 'var(--neon)';
    }
  });
}, { passive: true });

/* ─────────────────────────────────────────
   2. PARTICLE CANVAS ANIMATION
───────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'particlesCanvas';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const NUM_PARTICLES = 80;
  const MAX_DIST = 140;

  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }

  function randomBetween(a, b) { return Math.random() * (b - a) + a; }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      vx: randomBetween(-0.4, 0.4),
      vy: randomBetween(-0.4, 0.4),
      r: randomBetween(1, 2.5),
      alpha: randomBetween(0.2, 0.7),
    };
  }

  function init() {
    particles = Array.from({ length: NUM_PARTICLES }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
      ctx.fill();
    });

    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
})();

/* ─────────────────────────────────────────
   3. SCROLL REVEAL ANIMATION
───────────────────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.style.animationDelay || '0') * 1000;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────
   4. ANIMATED COUNTER (HERO STATS)
───────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  let started = false;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounters() {
    if (started) return;
    started = true;
    counters.forEach(el => {
      const raw    = el.dataset.target;
      const target = parseInt(raw.replace(/,/g, ''), 10);
      const duration = 2000;
      const startTime = performance.now();

      function update(now) {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current  = Math.round(easeOutQuart(progress) * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) animateCounters();
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) heroObserver.observe(statsEl);
})();

/* ─────────────────────────────────────────
   5. TESTIMONIALS CAROUSEL
───────────────────────────────────────── */
(function initCarousel() {
  const track    = document.getElementById('testimonialsTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track) return;

  const cards    = track.querySelectorAll('.testimonial-card');
  const total    = cards.length;
  let current    = 0;
  let autoTimer  = null;

  function getVisible() {
    if (window.innerWidth < 769) return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const maxIndex = total - getVisible();
    for (let i = 0; i <= Math.max(maxIndex, 0); i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(idx) {
    const maxIndex = total - getVisible();
    current = Math.max(0, Math.min(idx, maxIndex));
    const cardWidth = cards[0].offsetWidth + 24; // gap 24px
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      const maxIndex = total - getVisible();
      goTo(current < maxIndex ? current + 1 : 0);
    }, 5000);
  }

  window.addEventListener('resize', () => { goTo(current); buildDots(); }, { passive: true });

  buildDots();
  resetAuto();

  // Touch/swipe support
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goTo(current + 1) : goTo(current - 1);
    startX = null;
    resetAuto();
  });
})();

/* ─────────────────────────────────────────
   6. PRICING TOGGLE
───────────────────────────────────────── */
(function initPricingToggle() {
  const monthlyBtn = document.getElementById('toggleMonthly');
  const annualBtn  = document.getElementById('toggleAnnual');
  const amounts    = document.querySelectorAll('.price-amount');
  if (!monthlyBtn) return;

  function setMode(mode) {
    monthlyBtn.classList.toggle('active', mode === 'monthly');
    annualBtn.classList.toggle('active', mode === 'annual');
    amounts.forEach(el => {
      el.textContent = mode === 'monthly' ? el.dataset.monthly : el.dataset.annual;
    });
  }

  monthlyBtn.addEventListener('click', () => setMode('monthly'));
  annualBtn.addEventListener('click', () => setMode('annual'));
})();

/* ─────────────────────────────────────────
   7. CONTACT FORM
───────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('contactSubmit');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btnText = submitBtn.querySelector('.btn-text');

    // Simulate loading
    btnText.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      btnText.textContent = '✓ Sent!';
      success.classList.add('show');
      form.reset();

      setTimeout(() => {
        btnText.textContent = 'Send My Brief';
        submitBtn.disabled = false;
        success.classList.remove('show');
      }, 5000);
    }, 1500);
  });
})();

/* ─────────────────────────────────────────
   8. NEWSLETTER FORM
───────────────────────────────────────── */
(function initNewsletter() {
  const form    = document.getElementById('newsletterForm');
  const success = document.getElementById('newsletterSuccess');
  const btn     = document.getElementById('newsletterSubmit');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const span = btn.querySelector('span');
    span.textContent = 'Subscribing…';
    btn.disabled = true;

    setTimeout(() => {
      success.classList.add('show');
      form.reset();
      span.textContent = 'Subscribed!';

      setTimeout(() => {
        span.textContent = 'Subscribe Free';
        btn.disabled = false;
        success.classList.remove('show');
      }, 5000);
    }, 1200);
  });
})();

/* ─────────────────────────────────────────
   9. SMOOTH SCROLL FOR ANCHOR LINKS
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ─────────────────────────────────────────
   10. PARALLAX ORBS (subtle effect)
───────────────────────────────────────── */
(function initParallax() {
  const orbs = document.querySelectorAll('.hero-gradient-orb');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 0.08;
      orb.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
})();

/* ─────────────────────────────────────────
   11. CURSOR GLOW EFFECT (desktop)
───────────────────────────────────────── */
(function initCursorGlow() {
  if (window.innerWidth < 768) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s linear;
  `;
  document.body.appendChild(glow);

  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

/* ─────────────────────────────────────────
   12. CARD TILT EFFECT
───────────────────────────────────────── */
(function initTilt() {
  if (window.innerWidth < 768) return;

  const tiltCards = document.querySelectorAll('.service-card, .team-card, .pricing-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ─────────────────────────────────────────
   13. PAGE LOAD POLISH
───────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
