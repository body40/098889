document.addEventListener('DOMContentLoaded', () => {
  // Use one identical Lead Minds artwork in every page hero/detail header.
  const createBrandArtwork = () => {
    const artwork = document.createElement('div');
    artwork.className = 'brand-artwork';
    artwork.setAttribute('role', 'img');
    artwork.setAttribute('aria-label', 'Lead Minds');

    for (let index = 1; index <= 6; index += 1) {
      const cell = document.createElement('span');
      cell.className = 'brand-artwork__cell brand-artwork__cell--' + index;
      artwork.appendChild(cell);
    }

    return artwork;
  };

  document.querySelectorAll('.page-hero-media').forEach((media) => {
    media.replaceChildren(createBrandArtwork());
    media.classList.add('page-hero-media--brand-artwork');
  });

  document.querySelectorAll('.course-cover, .post-cover').forEach((cover) => {
    const artwork = createBrandArtwork();
    artwork.classList.add('brand-artwork--content');
    cover.replaceWith(artwork);
  });

  // Sticky Header Scroll Effect
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on load
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // Premium Mobile Drawer, Accordions, Swipe gestures and Focus Trap
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const navPanel = nav?.querySelector('.nav-panel');

  const openDrawer = () => {
    if (!nav) return;
    nav.classList.add('open');
    document.body.classList.add('drawer-open');
    navToggle?.setAttribute('aria-expanded', 'true');
    trapFocus(nav);
  };

  const closeDrawer = () => {
    if (!nav) return;
    nav.classList.remove('open');
    document.body.classList.remove('drawer-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    closeDropdowns();
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nav.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close buttons inside drawer
    nav.querySelectorAll('[data-nav-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDrawer();
      });
    });

    // Close when clicking links inside drawer (excluding dropdown toggles)
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (link.closest('[data-nav-dropdown-toggle]')) return;
        closeDrawer();
      });
    });

    // Close when clicking outside the drawer panel (on the overlay backdrop)
    nav.addEventListener('click', (event) => {
      if (navPanel && !navPanel.contains(event.target)) {
        closeDrawer();
      }
    });
  }

  // Dropdowns (Accordion mode on mobile, standard hover/click on desktop)
  const closeDropdowns = (except = null) => {
    document.querySelectorAll('[data-nav-dropdown]').forEach((dropdown) => {
      if (dropdown === except) return;
      dropdown.classList.remove('open');
      dropdown.querySelector('[data-nav-dropdown-toggle]')?.setAttribute('aria-expanded', 'false');
    });
  };

  document.querySelectorAll('[data-nav-dropdown]').forEach((dropdown) => {
    const toggle = dropdown.querySelector('[data-nav-dropdown-toggle]');

    toggle?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = !dropdown.classList.contains('open');
      closeDropdowns(dropdown);
      dropdown.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-nav-dropdown]')) {
      closeDropdowns();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
      closeDropdowns();
    }
  });

  // Focus trap implementation
  const trapFocus = (element) => {
    const focusableElements = element.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Reset focus to first element when opened
    setTimeout(() => firstFocusableElement.focus(), 50);

    element.addEventListener('keydown', function(e) {
      const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

      if (!isTabPressed) {
        return;
      }

      if (e.shiftKey) { // shift + tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else { // tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    });
  };

  // Swipe to Close Support on Mobile Drawer
  if (navPanel) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    navPanel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    navPanel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;
      // Swiping right (towards positive X) closes the right drawer
      if (swipeDistance > 70) {
        closeDrawer();
      }
    };
  }

  // Client-side category filter for blog page
  const applyCategoryFilter = () => {
    const hash = window.location.hash;
    const category = hash ? hash.substring(1) : null;
    
    const cards = document.querySelectorAll('.cards-grid .card');
    if (cards.length === 0) return;

    cards.forEach(card => {
      if (!category || category === 'all' || category === '') {
        card.style.display = '';
      } else {
        const cardCategory = card.getAttribute('data-category');
        if (cardCategory === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      }
    });
  };

  window.addEventListener('hashchange', applyCategoryFilter);
  applyCategoryFilter(); // Run on load

  // Theme switcher for both desktop and mobile drawer toggle buttons
  document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const body = document.body;
      const nextTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
      body.dataset.theme = nextTheme;
      document.cookie = 'lead_mines_theme=' + nextTheme + '; path=/; max-age=31536000';
    });
  });

  
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.style.display = 'none';
    }, { once: true });
  });

  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { event_category: 'forms', event_label: 'contact_submission' });
      }
    });
  });

  document.querySelectorAll('[data-card-link]').forEach((card) => {
    const href = card.dataset.cardLink;
    if (!href) {
      return;
    }

    const openCardLink = () => {
      window.location.href = href;
    };

    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button, input, textarea, select, label')) {
        return;
      }

      if (window.getSelection && String(window.getSelection()).trim()) {
        return;
      }

      openCardLink();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCardLink();
      }
    });
  });

  document.querySelectorAll('[data-slogan-rotator]').forEach((rotator) => {
    const textNode = rotator.querySelector('[data-slogan-text]');
    if (!textNode) {
      return;
    }

    let slogans = [];
    try {
      slogans = JSON.parse(rotator.dataset.slogans || '[]');
    } catch (error) {
      slogans = [];
    }

    slogans = slogans.map((item) => String(item || '').trim()).filter(Boolean);
    if (slogans.length < 2) {
      return;
    }

    let index = 0;
    let frame = 0;
    const waitBetween = 1500;
    const typeDelay = () => 42 + Math.floor(Math.random() * 54);
    const eraseDelay = () => 24 + Math.floor(Math.random() * 30);

    const setText = (value) => {
      textNode.textContent = value;
    };

    const erase = (text, done) => {
      if (frame > 0) {
        window.clearTimeout(frame);
      }

      if (text.length === 0) {
        done();
        return;
      }

      setText(text.slice(0, -1));
      frame = window.setTimeout(() => erase(text.slice(0, -1), done), eraseDelay());
    };

    const type = (text, position, done) => {
      if (frame > 0) {
        window.clearTimeout(frame);
      }

      if (position > text.length) {
        done();
        return;
      }

      setText(text.slice(0, position));
      frame = window.setTimeout(() => type(text, position + 1, done), typeDelay());
    };

    const next = () => {
      index = (index + 1) % slogans.length;
      erase(textNode.textContent || '', () => {
        frame = window.setTimeout(() => {
          type(slogans[index], 0, () => {
            frame = window.setTimeout(next, waitBetween);
          });
        }, 180);
      });
    };

    frame = window.setTimeout(next, waitBetween);
  });

  const chatWidget = document.querySelector('[data-chat-widget]');
  const openChat = document.querySelector('[data-chat-open]');
  const closeChat = document.querySelector('[data-chat-close]');
  const chatForm = document.querySelector('[data-chat-form]');
  const chatMessages = document.querySelector('[data-chat-messages]');

  openChat?.addEventListener('click', () => {
    if (chatWidget) {
      chatWidget.hidden = false;
    }
  });

  closeChat?.addEventListener('click', () => {
    if (chatWidget) {
      chatWidget.hidden = true;
    }
  });

  chatForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(chatForm);
    const message = String(formData.get('message') || '').trim();

    if (!message || !chatMessages) {
      return;
    }

    chatMessages.insertAdjacentHTML('beforeend', '<div class="chat-widget__bubble user">' + message + '</div>');
    chatForm.reset();

    try {
      const response = await fetch(chatForm.dataset.endpoint || '../api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          csrf_token: formData.get('_csrf_token'),
        }),
      });

      const payload = await response.json();
      chatMessages.insertAdjacentHTML('beforeend', '<div class="chat-widget__bubble bot">' + (payload.reply || 'Thanks! Our team will get back to you soon.') + '</div>');
    } catch (error) {
      chatMessages.insertAdjacentHTML('beforeend', '<div class="chat-widget__bubble bot">Thanks! Our team will get back to you soon.</div>');
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});
