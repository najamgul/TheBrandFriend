// ============================================
// DISRUPTOR — Neo-Brutalist Interactions
// TheBrandFriend Agency
// ============================================

gsap.registerPlugin(ScrollTrigger);

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenu = document.getElementById('close-menu');
if (hamburger) {
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== HERO ANIMATIONS =====
const heroTl = gsap.timeline({ delay: 0.3 });
heroTl
  .from('.sticker-hero', { y: -30, opacity: 0, rotation: 10, duration: 0.6, ease: 'back.out(1.7)' })
  .from('.hero-headline', { y: 80, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
  .from('.hero-sub', { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
  .from('.brutalist-form', { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  .from('.tech-label', { opacity: 0, duration: 0.4 }, '-=0.2');

// ===== STICKER CARDS STAGGER =====
gsap.from('.sticker-card', {
  scrollTrigger: { trigger: '.sticker-bar', start: 'top 85%' },
  y: 40, opacity: 0, rotation: (i) => [-5, 4, -3, 5][i % 4],
  duration: 0.6, stagger: 0.12, ease: 'back.out(1.5)'
});

// ===== SERVICE CARDS =====
gsap.from('.service-card', {
  scrollTrigger: { trigger: '.services-grid', start: 'top 80%' },
  y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
});

// ===== COMPARISON ROWS =====
document.querySelectorAll('.compare-row').forEach(row => {
  gsap.from(row.querySelector('.compare-old'), {
    scrollTrigger: { trigger: row, start: 'top 85%' },
    x: -60, opacity: 0, duration: 0.7, ease: 'power3.out'
  });
  gsap.from(row.querySelector('.compare-new'), {
    scrollTrigger: { trigger: row, start: 'top 85%' },
    x: 60, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.15
  });
});

// ===== PROCESS CARDS =====
gsap.from('.process-card', {
  scrollTrigger: { trigger: '.process-grid', start: 'top 80%' },
  y: 60, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out'
});

// ===== STATS COUNTER =====
document.querySelectorAll('.stat-num').forEach(el => {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target, duration: 2, ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(this.targets()[0].val) + suffix;
        }
      });
    }
  });
});

// ===== STAT BOXES STAGGER =====
gsap.from('.stat-box', {
  scrollTrigger: { trigger: '.stats-row', start: 'top 80%' },
  y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
});

// ===== CTA SECTION =====
gsap.from('.cta-headline', {
  scrollTrigger: { trigger: '.cta-block', start: 'top 75%' },
  y: 60, opacity: 0, duration: 0.8, ease: 'power3.out'
});

// ===== HERO FORM SUBMIT =====
const heroForm = document.getElementById('hero-form');
if (heroForm) {
  heroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = heroForm.querySelector('.brutal-submit');
    btn.textContent = 'SENT ✓';
    btn.style.background = '#CCFF00';
    btn.style.color = '#000';
    setTimeout(() => {
      btn.textContent = "LET'S GO →";
      btn.style.background = '';
      btn.style.color = '';
      heroForm.reset();
    }, 3000);
  });
}

// ===== CONTACT FORM SUBMIT =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    const origText = btn.textContent;
    btn.textContent = 'SENT ✓';
    btn.style.background = '#000';
    btn.style.color = '#CCFF00';
    btn.style.boxShadow = 'none';
    btn.style.transform = 'translate(8px, 8px)';
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
      btn.style.color = '';
      btn.style.boxShadow = '';
      btn.style.transform = '';
      contactForm.reset();
    }, 3000);
  });
}

// ===== SECTION REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(el => observer.observe(el));
}
