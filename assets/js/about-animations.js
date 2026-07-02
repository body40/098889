/**
 * LeadMinds "About Us" Cinematic Animations & Profile Viewer Module
 * Reusable, modular, and optimized for 60 FPS performance.
 * Supports scroll reveals, 3D tilts, stack swaps, and accessible fullscreen modals.
 */
const initAboutAnimations = () => {
  // Check user motion preferences for accessibility
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const cards = document.querySelectorAll('.about-card');
  if (cards.length === 0) return;

  if (prefersReducedMotion) {
    // Accessibility fallback: immediately reveal all elements without motion
    cards.forEach(card => card.classList.add('revealed'));
    
    const wrappers = document.querySelectorAll('.swap-wrapper, .team-swap-wrapper, .article-swap-wrapper');
    wrappers.forEach(w => w.classList.add('active'));
    
    // Setup modal controls for accessibility fallback
    setupProfileViewer();
  setupStackingSwap('.home-page .homepage-founders-swap-grid', '.homepage-founder-swap-wrapper', 3000);
  setupStackingSwap('.home-page .articles-swap-grid', '.article-swap-wrapper', 3000);
    return;
  }

  // ==========================================================================
  // 1. Scroll Reveal with Stagger (IntersectionObserver)
  // ==========================================================================
    const setupScrollReveal = () => {
    // Progressive enhancement: reveal all cards immediately on script run
    cards.forEach(card => card.classList.add('revealed'));
  };

  // ==========================================================================
  // 2. Randomized Breathing & Floating Rhythms
  // ==========================================================================
  const randomizeCardTimings = () => {
    cards.forEach(card => {
      const duration = (6 + Math.random() * 3).toFixed(2) + 's';
      const delay = -(Math.random() * 9).toFixed(2) + 's';
      
      card.style.setProperty('--breath-duration', duration);
      card.style.setProperty('--breath-delay', delay);

      const iconContainer = card.querySelector('.card-icon-container');
      if (iconContainer) {
        const iconDuration = (4.5 + Math.random() * 2).toFixed(2) + 's';
        const iconDelay = -(Math.random() * 6).toFixed(2) + 's';
        iconContainer.style.setProperty('--icon-duration', iconDuration);
        iconContainer.style.setProperty('--icon-delay', iconDelay);
      }
    });
  };

  // ==========================================================================
  // 3. Stacking Card Swap Loops (General Helper)
  // ==========================================================================
  const setupStackingSwap = (gridSelector, wrapperSelector, intervalMs) => {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;

    const wrappers = grid.querySelectorAll(wrapperSelector);
    if (wrappers.length < 2) return;

    let activeIndex = 0;
    let swapTimer = null;
    let isHovered = false;

    const performSwap = () => {
      if (isHovered) return;

      const currentActive = wrappers[activeIndex];
      const nextIndex = (activeIndex + 1) % wrappers.length;
      const nextActive = wrappers[nextIndex];

      currentActive.classList.remove('active');
      currentActive.classList.add('exit');

      nextActive.classList.remove('enter');
      nextActive.classList.add('active');

      activeIndex = nextIndex;

      setTimeout(() => {
        if (currentActive.classList.contains('exit')) {
          currentActive.classList.remove('exit');
          currentActive.classList.add('enter');
        }
      }, 1200); // Matches transition length
    };

    const startLoop = () => {
      stopLoop();
      swapTimer = setInterval(performSwap, intervalMs);
    };

    const stopLoop = () => {
      if (swapTimer) {
        clearInterval(swapTimer);
        swapTimer = null;
      }
    };

    grid.addEventListener('mouseenter', () => {
      isHovered = true;
      stopLoop();
    });

    grid.addEventListener('mouseleave', () => {
      isHovered = false;
      startLoop();
    });

    // Initial state setup
    wrappers.forEach((w, idx) => {
      w.classList.remove('active', 'enter', 'exit');
      if (idx === 0) {
        w.classList.add('active');
      } else {
        w.classList.add('enter');
      }
    });

    startLoop();
  };

  // ==========================================================================
  // 4. 3D Magnetic Hover & Cursor Spotlight Tracking
  // ==========================================================================
  const setupMagneticHover = () => {
    cards.forEach(card => {
      let rAF = null;

      const handleMouseMove = (e) => {
        if (rAF) cancelAnimationFrame(rAF);

        rAF = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const pctX = ((x / rect.width) * 100).toFixed(1) + '%';
          const pctY = ((y / rect.height) * 100).toFixed(1) + '%';
          card.style.setProperty('--mouse-x', pctX);
          card.style.setProperty('--mouse-y', pctY);

          const tiltX = (((y / rect.height) - 0.5) * -6).toFixed(2) + 'deg';
          const tiltY = (((x / rect.width) - 0.5) * 6).toFixed(2) + 'deg';
          card.style.setProperty('--tilt-x', tiltX);
          card.style.setProperty('--tilt-y', tiltY);
        });
      };

      const handleMouseLeave = () => {
        if (rAF) cancelAnimationFrame(rAF);
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      };

      card.addEventListener('mousemove', handleMouseMove, { passive: true });
      card.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    });
  };

  // ==========================================================================
  // 5. Accessible Fullscreen Profile Viewer Modal
  // ==========================================================================
  function setupProfileViewer() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;

    const modalName = document.getElementById('modal-name');
    const modalRole = document.getElementById('modal-role');
    const modalImg = document.getElementById('modal-img');
    const modalBullets = document.getElementById('modal-bullets');
    const modalBio = document.getElementById('modal-bio');
    const modalBody = modal.querySelector('.modal-body');

    const prevBtn = modal.querySelector('.prev-btn');
    const nextBtn = modal.querySelector('.next-btn');
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');

    let currentProfileIndex = 0;
    let lastTriggeringElement = null;
    const profiles = [];

    // Extract profiles dynamically from cards with [data-profile-index]
    const cardElements = Array.from(document.querySelectorAll('.about-card[data-profile-index]'));
    
    // Sort elements to ensure exact index matching
    cardElements.sort((a, b) => {
      return parseInt(a.dataset.profileIndex, 10) - parseInt(b.dataset.profileIndex, 10);
    });

    cardElements.forEach(card => {
      const index = parseInt(card.dataset.profileIndex, 10);
      profiles[index] = {
        name: card.querySelector('h3').textContent.replace(/^(الخبير المميز:|المستشار المميز:|المدرب المميز:|Featured Expert:|Featured Consultant:|Featured Trainer:)\s*/i, '').trim(),
        role: card.querySelector('.role').textContent.trim(),
        imgSrc: card.querySelector('.team-img-container img').src,
        imgAlt: card.querySelector('.team-img-container img').alt,
        bulletsHtml: card.querySelector('.team-bullets')?.innerHTML || '',
        bioHtml: card.querySelector('.bio-preview').innerHTML.trim(),
        triggerBtn: card.querySelector('.read-more-btn')
      };
    });

    const populateModal = (index) => {
      const profile = profiles[index];
      if (!profile) return;

      modalBody.classList.add('switching');

      setTimeout(() => {
        modalName.textContent = profile.name;
        modalRole.textContent = profile.role;

        // Reset image opacity
        modalImg.classList.remove('loaded');
        modalImg.src = profile.imgSrc;
        modalImg.alt = profile.imgAlt;

        modalBullets.innerHTML = profile.bulletsHtml;
        modalBio.innerHTML = `<p>${profile.bioHtml}</p>`;

        modalBody.classList.remove('switching');
      }, 250);
    };

    modalImg.addEventListener('load', () => {
      modalImg.classList.add('loaded');
    });

    const openModal = (index, triggerBtn) => {
      currentProfileIndex = index;
      lastTriggeringElement = triggerBtn;
      populateModal(index);

      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
      // Force layout reflow before opening transition
      modal.offsetHeight; 
      modal.classList.add('open');
      document.body.classList.add('modal-open');

      setTimeout(() => closeBtn.focus(), 120);
    };

    const closeModal = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      modal.setAttribute('aria-hidden', 'true');

      setTimeout(() => {
        modal.setAttribute('hidden', '');
        if (lastTriggeringElement) {
          lastTriggeringElement.focus();
        }
      }, 500);
    };

    const showNext = () => {
      if (profiles.length === 0) return;
      currentProfileIndex = (currentProfileIndex + 1) % profiles.length;
      let attempts = 0;
      while (!profiles[currentProfileIndex] && attempts < profiles.length) {
        currentProfileIndex = (currentProfileIndex + 1) % profiles.length;
        attempts++;
      }
      populateModal(currentProfileIndex);
    };

    const showPrev = () => {
      if (profiles.length === 0) return;
      currentProfileIndex = (currentProfileIndex - 1 + profiles.length) % profiles.length;
      let attempts = 0;
      while (!profiles[currentProfileIndex] && attempts < profiles.length) {
        currentProfileIndex = (currentProfileIndex - 1 + profiles.length) % profiles.length;
        attempts++;
      }
      populateModal(currentProfileIndex);
    };

    // Bind triggers on all cards
    cardElements.forEach(card => {
      const btn = card.querySelector('.read-more-btn');
      const idx = parseInt(card.dataset.profileIndex, 10);
      if (btn) {
        btn.addEventListener('click', () => openModal(idx, btn));
      }
    });

    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Keyboard support and Focus Trap
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;

      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      if (e.key === 'ArrowRight') {
        const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
        if (isRTL) showPrev(); else showNext();
        return;
      }

      if (e.key === 'ArrowLeft') {
        const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
        if (isRTL) showNext(); else showPrev();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = modal.querySelectorAll('button:not([disabled])');
        const firstFocus = focusables[0];
        const lastFocus = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocus) {
            lastFocus.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocus) {
            firstFocus.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // Initialize all modular components
    setupScrollReveal();
  randomizeCardTimings();
  setupStackingSwap('.about-page .vision-mission-grid', '.swap-wrapper', 5200);
  setupStackingSwap('.about-page .team-swap-grid', '.team-swap-wrapper', 5000);
  setupStackingSwap('.about-page .experts-swap-grid', '.expert-swap-wrapper', 5000);
  setupStackingSwap('.about-page .infographic-swap-grid', '.infographic-swap-wrapper', 5000);
  setupStackingSwap('.home-page .team-swap-grid', '.team-swap-wrapper', 3000);
  setupStackingSwap('.home-page .articles-swap-grid', '.article-swap-wrapper', 3000);
  setupMagneticHover();
  setupProfileViewer();
};

if (document.readyState === 'complete') {
  initAboutAnimations();
} else {
  window.addEventListener('load', initAboutAnimations);
}
