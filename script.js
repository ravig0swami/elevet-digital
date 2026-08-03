/* ═══════════════════════════════════════════════════════
   ELEVATE DIGITAL — JavaScript v2
   Premium interactions · Ripple · Parallax · Carousel · Forms
═══════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────
   0. REDUCED MOTION + SCROLL PROGRESS + BACK TO TOP
───────────────────────────────────────── */
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");

if (scrollProgress) {
  window.addEventListener(
    "scroll",
    () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      scrollProgress.style.width = progress + "%";
    },
    { passive: true },
  );
}

if (backToTop) {
  window.addEventListener(
    "scroll",
    () => {
      const show = window.scrollY > 600;
      backToTop.classList.toggle("visible", show);
      backToTop.setAttribute("aria-hidden", String(!show));
      backToTop.setAttribute("tabindex", show ? "0" : "-1");
    },
    { passive: true },
  );

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
}

/* ─────────────────────────────────────────
   1. NAVBAR SCROLL BEHAVIOUR
───────────────────────────────────────── */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  },
  { passive: true },
);

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.classList.toggle("active");
  hamburger.setAttribute("aria-expanded", isOpen);
});

// Close nav on link click (mobile)
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// Close nav on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks.classList.contains("open")) {
    hamburger.classList.remove("active");
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.focus();
  }
});

// Active link highlighting (exclude CTA button)
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-links li a");

window.addEventListener(
  "scroll",
  () => {
    let current = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 200) current = section.id;
    });
    navItems.forEach((a) => {
      a.style.color = "";
      if (a.getAttribute("href") === `#${current}`) {
        a.style.color = "var(--neon)";
      }
    });
  },
  { passive: true },
);

/* ─────────────────────────────────────────
   2. PARTICLE CANVAS ANIMATION
───────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  // Skip heavy canvas animation when user prefers reduced motion
  if (prefersReducedMotion) return;

  const canvas = document.createElement("canvas");
  canvas.id = "particlesCanvas";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let W,
    H,
    particles = [];
  const NUM_PARTICLES = 70;
  const MAX_DIST = 120;

  function resize() {
    W = canvas.width = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }

  function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
  }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(-0.3, 0.3),
      r: randomBetween(1, 2),
      alpha: randomBetween(0.15, 0.55),
    };
  }

  function init() {
    particles = Array.from({ length: NUM_PARTICLES }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p) => {
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

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        init();
      }, 200);
    },
    { passive: true },
  );
})();

/* ─────────────────────────────────────────
   3. SCROLL REVEAL (STAGGERED)
───────────────────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay =
            parseFloat(entry.target.style.animationDelay || "0") * 1000;
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  revealEls.forEach((el) => observer.observe(el));
})();

/* ─────────────────────────────────────────
   4. ANIMATED COUNTER (HERO STATS)
───────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll(".stat-number");
  let started = false;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounters() {
    if (started) return;
    started = true;
    counters.forEach((el) => {
      const raw = el.dataset.target;
      const target = parseInt(raw.replace(/,/g, ""), 10);
      const duration = 2200;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(easeOutQuart(progress) * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  const heroObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) animateCounters();
    },
    { threshold: 0.5 },
  );

  const statsEl = document.querySelector(".hero-stats");
  if (statsEl) heroObserver.observe(statsEl);
})();

/* ─────────────────────────────────────────
   5. TESTIMONIALS CAROUSEL (AUTO-SLIDE)
───────────────────────────────────────── */
(function initCarousel() {
  const track = document.getElementById("testimonialsTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("carouselDots");
  if (!track) return;

  const cards = track.querySelectorAll(".testimonial-card");
  const total = cards.length;
  let current = 0;
  let autoTimer = null;

  function getVisible() {
    if (window.innerWidth < 769) return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, total - getVisible());
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    const maxIdx = getMaxIndex();
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === current ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.setAttribute("aria-selected", i === current ? "true" : "false");
      dot.setAttribute("tabindex", i === current ? "0" : "-1");
      dot.addEventListener("click", () => {
        goTo(i);
        resetAuto();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll(".dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
      d.setAttribute("aria-selected", i === current ? "true" : "false");
      d.setAttribute("tabindex", i === current ? "0" : "-1");
    });
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, getMaxIndex()));
    const cardStyle = window.getComputedStyle(cards[0]);
    const cardWidth = cards[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap) || 24;
    const offset = current * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  prevBtn.addEventListener("click", () => {
    goTo(current > 0 ? current - 1 : getMaxIndex());
    resetAuto();
  });
  nextBtn.addEventListener("click", () => {
    goTo(current < getMaxIndex() ? current + 1 : 0);
    resetAuto();
  });

  // Keyboard support for carousel
  [prevBtn, nextBtn, dotsWrap].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        goTo(current > 0 ? current - 1 : getMaxIndex());
        resetAuto();
      } else if (e.key === "ArrowRight") {
        goTo(current < getMaxIndex() ? current + 1 : 0);
        resetAuto();
      }
    });
  });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goTo(current < getMaxIndex() ? current + 1 : 0);
    }, 6000);
  }

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        goTo(current);
        buildDots();
      }, 150);
    },
    { passive: true },
  );

  // Initial render with requestAnimationFrame for correct layout measurements
  requestAnimationFrame(() => {
    goTo(0);
    buildDots();
    resetAuto();
  });

  // Touch/swipe support
  let startX = null;
  let startY = null;

  track.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (startX === null) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      // Prevent vertical scroll when swiping horizontally
      if (dx > dy && dx > 10) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  track.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
    startX = null;
    startY = null;
    resetAuto();
  });

  // Pause on hover
  track.addEventListener("mouseenter", () => clearInterval(autoTimer));
  track.addEventListener("mouseleave", resetAuto);
})();

/* ─────────────────────────────────────────
   6. PRICING TOGGLE
───────────────────────────────────────── */
(function initPricingToggle() {
  const monthlyBtn = document.getElementById("toggleMonthly");
  const annualBtn = document.getElementById("toggleAnnual");
  const amounts = document.querySelectorAll(".price-amount");
  if (!monthlyBtn) return;

  function setMode(mode) {
    monthlyBtn.classList.toggle("active", mode === "monthly");
    annualBtn.classList.toggle("active", mode === "annual");
    monthlyBtn.setAttribute("aria-checked", mode === "monthly");
    annualBtn.setAttribute("aria-checked", mode === "annual");

    amounts.forEach((el) => {
      const target = mode === "monthly" ? el.dataset.monthly : el.dataset.annual;
      el.style.opacity = "0";
      el.style.transform = "translateY(-4px)";
      setTimeout(() => {
        el.textContent = target;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 150);
    });
  }

  monthlyBtn.addEventListener("click", () => setMode("monthly"));
  annualBtn.addEventListener("click", () => setMode("annual"));
})();

/* ─────────────────────────────────────────
   7. CONTACT FORM (IMPROVED VALIDATION)
───────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("contactSubmit");
  if (!form) return;

  function validateField(field) {
    const group = field.closest(".form-group");
    let valid = true;
    let errorMsg = "";

    if (field.hasAttribute("required") && !field.value.trim()) {
      valid = false;
      errorMsg = "This field is required";
    } else if (field.type === "email" && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        valid = false;
        errorMsg = "Please enter a valid email address";
      }
    }

    if (group) {
      const errorEl = group.querySelector(".form-error-msg");
      if (!valid) {
        group.classList.add("error");
        if (errorEl) errorEl.textContent = errorMsg;
      } else {
        group.classList.remove("error");
      }
    }

    return valid;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Honeypot: silently ignore bot submissions
    const hp = form.querySelector(".hp-field input");
    if (hp && hp.value.trim() !== "") {
      return; // Pretend success so bots think they got through
    }

    const btnText = submitBtn.querySelector(".btn-text");

    // Validate all required fields
    const requiredFields = form.querySelectorAll("[required]");
    let allValid = true;
    requiredFields.forEach((field) => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      btnText.textContent = "Please fix errors";
      setTimeout(() => {
        btnText.textContent = "Send My Brief";
      }, 2000);
      return;
    }

    // Simulate loading
    btnText.textContent = "Sending\u2026";
    submitBtn.disabled = true;

    setTimeout(() => {
      btnText.textContent = "\u2713 Sent!";
      success.classList.add("show");
      form.reset();
      // Reset field styling
      requiredFields.forEach((f) => {
        const group = f.closest(".form-group");
        if (group) group.classList.remove("error");
      });

      setTimeout(() => {
        btnText.textContent = "Send My Brief";
        submitBtn.disabled = false;
        success.classList.remove("show");
      }, 5000);
    }, 1500);
  });

  // Validate on blur, clear on input
  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.value.trim()) {
        const group = field.closest(".form-group");
        if (group) group.classList.remove("error");
      }
    });
  });
})();

/* ─────────────────────────────────────────
   8. NEWSLETTER FORM
───────────────────────────────────────── */
(function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  const success = document.getElementById("newsletterSuccess");
  const btn = document.getElementById("newsletterSubmit");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const span = btn.querySelector("span");
    span.textContent = "Subscribing\u2026";
    btn.disabled = true;

    setTimeout(() => {
      success.classList.add("show");
      form.reset();
      span.textContent = "Subscribed!";

      setTimeout(() => {
        span.textContent = "Subscribe Free";
        btn.disabled = false;
        success.classList.remove("show");
      }, 5000);
    }, 1200);
  });
})();

/* ─────────────────────────────────────────
   9. SMOOTH SCROLL FOR ANCHOR LINKS
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({
      top: target.offsetTop - offset,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
});

/* ─────────────────────────────────────────
   10. PARALLAX ORBS (MOUSE + SCROLL)
───────────────────────────────────────── */
(function initParallax() {
  const orbs = document.querySelectorAll(".hero-gradient-orb");
  if (!orbs.length) return;
  // Skip parallax when user prefers reduced motion
  if (prefersReducedMotion) return;

  // Scroll opacity fade
  window.addEventListener(
    "scroll",
    () => {
      const sy = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.06;
        orb.style.opacity = Math.max(0.3, 1 - sy * speed * 0.003);
      });
    },
    { passive: true },
  );

  // Mouse parallax (desktop only)
  if (window.innerWidth >= 768) {
    let mouseX = 0;
    let mouseY = 0;
    let rafId = null;

    window.addEventListener(
      "mousemove",
      (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true },
    );

    function animateOrbs() {
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 12;
        const x = mouseX * speed;
        const y = mouseY * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
      });
      rafId = requestAnimationFrame(animateOrbs);
    }
    animateOrbs();

    // Cleanup on leave
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && !rafId) {
        animateOrbs();
      }
    });
  }
})();

/* ─────────────────────────────────────────
   11. CURSOR GLOW EFFECT (desktop)
───────────────────────────────────────── */
(function initCursorGlow() {
  if (window.innerWidth < 768) return;
  if (prefersReducedMotion) return;

  const glow = document.createElement("div");
  glow.setAttribute("aria-hidden", "true");
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: left 0.15s ease-out, top 0.15s ease-out;
  `;
  document.body.appendChild(glow);

  window.addEventListener(
    "mousemove",
    (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    },
    { passive: true },
  );
})();

/* ─────────────────────────────────────────
   12. CARD TILT EFFECT
───────────────────────────────────────── */
(function initTilt() {
  if (window.innerWidth < 768) return;
  if (prefersReducedMotion) return;

  const tiltCards = document.querySelectorAll(
    ".service-card, .team-card, .pricing-card, .industry-card",
  );

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* ─────────────────────────────────────────
   13. BUTTON RIPPLE EFFECT
───────────────────────────────────────── */
(function initRipple() {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty("--ripple-x", x + "%");
      btn.style.setProperty("--ripple-y", y + "%");
      btn.classList.remove("rippling");
      // Force reflow
      void btn.offsetWidth;
      btn.classList.add("rippling");
      setTimeout(() => btn.classList.remove("rippling"), 600);
    });
  });
})();

/* ─────────────────────────────────────────
   14. PAGE LOAD POLISH
───────────────────────────────────────── */
window.addEventListener("load", () => {
  if (prefersReducedMotion) return;
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.6s ease";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = "1";
    });
  });
});

/* ─────────────────────────────────────────
   15. PRICE AMOUNT TRANSITIONS
───────────────────────────────────────── */
(function initPriceTransitions() {
  document.querySelectorAll(".price-amount").forEach((el) => {
    el.style.transition = "opacity 0.2s ease, transform 0.2s ease";
  });
})();
