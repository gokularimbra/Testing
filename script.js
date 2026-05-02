/* =========================================
   BMW Landing — Interactions
   ========================================= */
(() => {
  'use strict';

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };
    animate();

    document.querySelectorAll('a, button, .model-card, .ec-card, .feature, .t-card, input, select').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Scroll progress ---------- */
  const progress = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = `${scrolled}%`;
  };
  document.addEventListener('scroll', updateProgress, { passive: true });

  /* ---------- Nav scrolled state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.nav__burger');
  const links = document.querySelector('.nav__links');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        links.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          entry.target.style.transitionDelay = `${delay}s`;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const duration = 2000;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = target * eased;
          el.textContent = target % 1 === 0 ? Math.round(value).toString() : value.toFixed(1);
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target.toString();
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- Model filter tabs ---------- */
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.model-card');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const filter = tab.dataset.filter;
      cards.forEach((card) => {
        const cats = card.dataset.cat.split(' ');
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------- Hero parallax ---------- */
  const heroBg = document.querySelector('.hero__bg-img');
  const heroContent = document.querySelector('.hero__content');
  if (heroBg) {
    document.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroBg.style.transform = `scale(1.08) translateY(${y * 0.25}px)`;
          if (heroContent) {
            heroContent.style.transform = `translateY(${y * 0.15}px)`;
            heroContent.style.opacity = String(Math.max(0, 1 - y / 600));
          }
        }
      },
      { passive: true }
    );
  }

  /* ---------- Testimonial slider ---------- */
  const tCards = document.querySelectorAll('.t-card');
  const tDots = document.querySelectorAll('.t-dots .dot');
  const prevBtn = document.querySelector('.t-arrow--prev');
  const nextBtn = document.querySelector('.t-arrow--next');
  let activeIdx = 0;
  let autoplay;

  const setActive = (i) => {
    activeIdx = (i + tCards.length) % tCards.length;
    tCards.forEach((c, idx) => c.classList.toggle('is-active', idx === activeIdx));
    tDots.forEach((d, idx) => d.classList.toggle('is-active', idx === activeIdx));
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplay = setInterval(() => setActive(activeIdx + 1), 5000);
  };
  const stopAutoplay = () => clearInterval(autoplay);

  prevBtn?.addEventListener('click', () => { setActive(activeIdx - 1); startAutoplay(); });
  nextBtn?.addEventListener('click', () => { setActive(activeIdx + 1); startAutoplay(); });
  tDots.forEach((d) =>
    d.addEventListener('click', () => {
      setActive(parseInt(d.dataset.i, 10));
      startAutoplay();
    })
  );
  startAutoplay();

  /* ---------- Tilt on model cards ---------- */
  document.querySelectorAll('.model-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- Smooth anchor scroll offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Set min date for booking ---------- */
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
})();
