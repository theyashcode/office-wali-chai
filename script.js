(function initIntroLoader() {
  const loader = document.getElementById('introLoader');
  if (!loader) return;

  const skipBtn = document.getElementById('introSkip');
  const fillRect = document.getElementById('chaiFill');
  const wavePath = document.getElementById('chaiWave');
  const shineEl = document.getElementById('chaiShineEl');
  const progressFill = document.getElementById('introProgressFill');
  const introTag = document.getElementById('introTag');

  const CUP_BOTTOM_Y = 206;
  const CUP_TOP_Y = 46;
  const CUP_HEIGHT = CUP_BOTTOM_Y - CUP_TOP_Y;

  const FILL_DURATION = 2600;
  const HOLD_DURATION = 500;
  const FADE_DURATION = 800;

  const TAG_MESSAGES = [
    { at: 0, text: 'brewing your daily cup of comfort…' },
    { at: 0.55, text: 'almost there, kadak aur garam…' },
    { at: 0.92, text: 'chai is ready!' }
  ];

  let finished = false;
  let rafId = null;
  let startTime = null;
  let tagIndex = 0;

  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const setLiquid = (progress) => {
    const eased = easeInOutCubic(progress);
    const height = CUP_HEIGHT * eased;
    const y = CUP_BOTTOM_Y - height;

    if (fillRect) {
      fillRect.setAttribute('y', y.toFixed(2));
      fillRect.setAttribute('height', Math.max(height, 0).toFixed(2));
    }

    if (wavePath) {
      const wobble = Math.sin(progress * Math.PI * 6) * 3 * (1 - progress * 0.6);
      const d = `M40,${y.toFixed(1)} Q75,${(y - 5 + wobble).toFixed(1)} 110,${y.toFixed(1)} T180,${y.toFixed(1)} V${CUP_BOTTOM_Y} H40 Z`;
      wavePath.setAttribute('d', d);
    }

    if (shineEl) {
      shineEl.setAttribute('cy', y.toFixed(2));
      shineEl.setAttribute('opacity', progress > 0.08 ? '0.6' : '0');
    }

    if (progressFill) {
      progressFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    if (introTag) {
      while (tagIndex < TAG_MESSAGES.length - 1 && progress >= TAG_MESSAGES[tagIndex + 1].at) {
        tagIndex++;
        introTag.style.opacity = '0';
        setTimeout(() => {
          introTag.textContent = TAG_MESSAGES[tagIndex].text;
          introTag.style.opacity = '1';
        }, 180);
      }
    }
  };

  const finishIntro = () => {
    if (finished) return;
    finished = true;
    if (rafId) cancelAnimationFrame(rafId);
    setLiquid(1);

    loader.classList.add('intro-done');
    document.body.classList.remove('intro-locked');

    setTimeout(() => {
      if (loader && loader.parentNode) loader.remove();
    }, FADE_DURATION + 50);
  };

  const tick = (now) => {
    if (finished) return;
    if (startTime === null) startTime = now;
    const progress = Math.min((now - startTime) / FILL_DURATION, 1);
    setLiquid(progress);

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      setTimeout(finishIntro, HOLD_DURATION);
    }
  };

  if (skipBtn) {
    skipBtn.addEventListener('click', finishIntro);
  }

  rafId = requestAnimationFrame(tick);

  setTimeout(finishIntro, FILL_DURATION + HOLD_DURATION + 400 + 2000);
})();

document.addEventListener('DOMContentLoaded', () => {

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  const highlightNav = () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      if (window.scrollY >= sectionTop) current = section.id;
    });
    navAnchors.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', highlightNav);
  highlightNav();

  const statNumbers = document.querySelectorAll('.stat-number');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + suffix;
    };
    requestAnimationFrame(step);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  statNumbers.forEach(stat => statObserver.observe(stat));

  const storyCards = document.querySelectorAll('.story-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  storyCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
    revealObserver.observe(card);
  });

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formSuccess.classList.add('show');
    contactForm.reset();
    setTimeout(() => formSuccess.classList.remove('show'), 4000);
  });

  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const loginBtnDesktop = document.getElementById('loginBtnDesktop');
  const loginBtnMobile = document.getElementById('loginBtnMobile');

  const openModal = () => {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  loginBtnDesktop.addEventListener('click', openModal);
  loginBtnMobile.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    openModal();
  });
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
  });

  const authTabBtns = document.querySelectorAll('.auth-tab-btn');
  const authForms = document.querySelectorAll('.auth-form');

  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      authTabBtns.forEach(b => b.classList.remove('active'));
      authForms.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.auth}Form`).classList.add('active');
    });
  });

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginSuccess = document.getElementById('loginSuccess');
  const registerSuccess = document.getElementById('registerSuccess');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginSuccess.classList.add('show');
    setTimeout(() => {
      loginSuccess.classList.remove('show');
      loginForm.reset();
      closeModal();
    }, 1400);
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    registerSuccess.classList.add('show');
    setTimeout(() => {
      registerSuccess.classList.remove('show');
      registerForm.reset();
      closeModal();
    }, 1400);
  });

});