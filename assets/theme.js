/**
 * AAEL Theme JavaScript
 * Shopify Online Store 2.0
 */

/* ========================================
   PRODUCT CARD WEB COMPONENT
   ======================================== */

class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.slides = this.querySelectorAll('.slide-container');
    this.dots = this.querySelectorAll('.dotnav-item');
    this.playBtn = this.querySelector('.control-btn');
    this.timings = JSON.parse(this.getAttribute('data-timings') || '[4000]');
    
    this.state = {
      currentSlide: 0,
      isPlaying: true
    };
    
    this.timer = null;
  }

  connectedCallback() {
    // Bind Controls
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
    
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Only auto-start if we have multiple slides
    if (this.slides.length > 1) {
      this.startTimer();
    }
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  getCurrentDuration() {
    const t = this.timings;
    if (Array.isArray(t)) {
      return t[this.state.currentSlide] || t[t.length - 1];
    }
    return t;
  }

  goToSlide(index) {
    this.stopTimer();
    this.state.currentSlide = index;
    this.renderState();
    if (this.state.isPlaying) this.startTimer();
  }

  togglePlay() {
    this.state.isPlaying = !this.state.isPlaying;
    this.renderState();
    
    if (this.state.isPlaying) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  renderState() {
    // Update Slides
    this.slides.forEach((s, i) => {
      s.classList.toggle('active', i === this.state.currentSlide);
    });

    // Update Dots
    this.dots.forEach((d, i) => {
      const isActive = i === this.state.currentSlide;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
      
      const progress = d.querySelector('.dot-progress');
      if (progress) {
        progress.style.animation = 'none';
        d.offsetHeight; // Trigger reflow
        
        if (isActive && this.state.isPlaying) {
          const duration = this.getCurrentDuration();
          progress.style.animation = `progress-fill ${duration}ms linear forwards`;
        }
      }
    });
    
    // Update Play Button
    if (this.playBtn) {
      this.playBtn.classList.toggle('paused', !this.state.isPlaying);
      this.playBtn.setAttribute('aria-label', this.state.isPlaying ? 'Pause slideshow' : 'Play slideshow');
    }
  }

  startTimer() {
    this.stopTimer();
    if (!this.state.isPlaying || this.slides.length <= 1) return;

    this.renderState();

    const duration = this.getCurrentDuration();
    this.timer = setTimeout(() => {
      const next = (this.state.currentSlide + 1) % this.slides.length;
      this.goToSlide(next);
    }, duration);
  }

  stopTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Pause animation visually
    const activeDot = this.querySelector('.dotnav-item.active .dot-progress');
    if (activeDot) {
      activeDot.style.animationPlayState = 'paused';
    }
  }
}

// Define custom element
if (!customElements.get('product-card')) {
  customElements.define('product-card', ProductCard);
}

/* ========================================
   HERO CARD WEB COMPONENT
   ======================================== */

class HeroCard extends HTMLElement {
  constructor() {
    super();
    this.slides = this.querySelectorAll('.slide-container');
    this.dots = this.querySelectorAll('.dotnav-item');
    this.playBtn = this.querySelector('.control-btn');
    this.timings = JSON.parse(this.getAttribute('data-timings') || '[12000]');
    
    this.state = {
      currentSlide: 0,
      isPlaying: true
    };
    
    this.timer = null;
  }

  connectedCallback() {
    // Bind Controls
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
    
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Click on image to advance to next slide
    this.heroVisual = this.querySelector('.hero-visual');
    if (this.heroVisual) {
      this.heroVisual.addEventListener('click', (e) => {
        // Don't trigger if clicking on controls
        if (!e.target.closest('.card-controls')) {
          this.nextSlide();
        }
      });
    }

    // Touch/swipe support for mobile
    if (this.heroVisual) {
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartY = 0;
      let touchEndY = 0;
      const minSwipeDistance = 50; // Minimum distance for a swipe
      
      this.heroVisual.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });
      
      this.heroVisual.addEventListener('touchend', (e) => {
        // Don't trigger if touching controls
        if (e.target.closest('.card-controls')) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only trigger if horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            // Swipe right - go to previous slide
            this.previousSlide();
          } else {
            // Swipe left - go to next slide
            this.nextSlide();
          }
        }
      }, { passive: true });
    }

    // Only auto-start if we have multiple slides
    if (this.slides.length > 1) {
      this.startTimer();
    }
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  getCurrentDuration() {
    const t = this.timings;
    if (Array.isArray(t)) {
      return t[this.state.currentSlide] || t[t.length - 1];
    }
    return t;
  }

  goToSlide(index) {
    this.stopTimer();
    this.state.currentSlide = index;
    this.renderState();
    if (this.state.isPlaying) this.startTimer();
  }

  nextSlide() {
    const next = (this.state.currentSlide + 1) % this.slides.length;
    this.goToSlide(next);
  }

  previousSlide() {
    const prev = (this.state.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev);
  }

  togglePlay() {
    this.state.isPlaying = !this.state.isPlaying;
    this.renderState();
    
    if (this.state.isPlaying) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  renderState() {
    // Update Slides
    this.slides.forEach((s, i) => {
      s.classList.toggle('active', i === this.state.currentSlide);
    });

    // Update Dots
    this.dots.forEach((d, i) => {
      const isActive = i === this.state.currentSlide;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
      
      const progress = d.querySelector('.dot-progress');
      if (progress) {
        progress.style.animation = 'none';
        d.offsetHeight; // Trigger reflow
        
        if (isActive && this.state.isPlaying) {
          const duration = this.getCurrentDuration();
          progress.style.animation = `progress-fill ${duration}ms linear forwards`;
        }
      }
    });
    
    // Update Play Button
    if (this.playBtn) {
      this.playBtn.classList.toggle('paused', !this.state.isPlaying);
      this.playBtn.setAttribute('aria-label', this.state.isPlaying ? 'Pause slideshow' : 'Play slideshow');
    }
  }

  startTimer() {
    this.stopTimer();
    if (!this.state.isPlaying || this.slides.length <= 1) return;

    this.renderState();

    const duration = this.getCurrentDuration();
    this.timer = setTimeout(() => {
      const next = (this.state.currentSlide + 1) % this.slides.length;
      this.goToSlide(next);
    }, duration);
  }

  stopTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Pause animation visually
    const activeDot = this.querySelector('.dotnav-item.active .dot-progress');
    if (activeDot) {
      activeDot.style.animationPlayState = 'paused';
    }
  }
}

// Define custom element
if (!customElements.get('hero-card')) {
  customElements.define('hero-card', HeroCard);
}

/* ========================================
   GLOBAL UI LOGIC
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initSmoothScroll();
  initCookieConsent();
  initBlurUpImages();
});

/**
 * Cookie Consent Functionality
 * Handles banner visibility and preferences
 */
function initCookieConsent() {
  const container = document.getElementById('CookieConsent');
  const banner = document.getElementById('CookieBanner');
  const prefs = document.getElementById('CookiePreferences');
  const storageKey = 'aael-cookie-consent';

  // Debug: add ?reset to URL to clear consent and test
  if (window.location.search.includes('reset')) {
    localStorage.removeItem(storageKey);
    window.location.href = window.location.pathname;
    return;
  }

  // 1. Extreme kill switch for native banners
  const purgeNative = () => {
    const selectors = [
      '#shopify-privacy-banner-container',
      '.shopify-privacy-banner-container',
      '#shopify-privacy-banner',
      '.shopify-policy-banner',
      'iframe[src*="privacy"]',
      '#cookie-consent-banner'
    ];
    
    selectors.forEach(s => {
      document.querySelectorAll(s).forEach(el => {
        if (el && el.id !== 'CookieConsent' && !el.closest('#CookieConsent')) {
          el.style.setProperty('display', 'none', 'important');
          el.remove();
        }
      });
    });
  };

  purgeNative();
  setInterval(purgeNative, 200); // Check 5 times a second

  // 2. Force show logic
  const savedConsent = localStorage.getItem(storageKey);
  
  // Skip if consent already given
  if (savedConsent) return;

  setTimeout(() => {
    if (container) {
      container.classList.remove('is-hidden');
      console.log('AAEL: Custom banner should be visible now.');
    }
  }, 1000);

  // Bind Banner Buttons
  container?.querySelector('.js-cookie-accept')?.addEventListener('click', () => setConsent({
    analytics: true,
    marketing: true,
    personalization: true
  }));

  container?.querySelector('.js-cookie-decline')?.addEventListener('click', () => setConsent({
    analytics: false,
    marketing: false,
    personalization: false
  }));

  container?.querySelector('.js-cookie-manage')?.addEventListener('click', () => {
    banner?.classList.add('is-hidden');
    prefs?.classList.remove('is-hidden');
  });

  container?.querySelector('.js-cookie-close')?.addEventListener('click', () => {
    container.classList.add('is-hidden');
  });

  // Bind Prefs Buttons
  container?.querySelector('.js-cookie-close-prefs')?.addEventListener('click', () => {
    prefs?.classList.add('is-hidden');
    banner?.classList.remove('is-hidden');
  });

  container?.querySelector('.js-cookie-save-choices')?.addEventListener('click', () => {
    const choices = {};
    container.querySelectorAll('.js-cookie-toggle').forEach(toggle => {
      choices[toggle.dataset.type] = toggle.checked;
    });
    setConsent(choices);
  });

  container?.querySelector('.js-cookie-decline-all')?.addEventListener('click', () => setConsent({
    analytics: false,
    marketing: false,
    personalization: false
  }));

  container?.querySelector('.js-cookie-accept-all')?.addEventListener('click', () => setConsent({
    analytics: true,
    marketing: true,
    personalization: true
  }));

  function setConsent(choices) {
    localStorage.setItem(storageKey, JSON.stringify(choices));
    
    if (window.Shopify && window.Shopify.customerPrivacy) {
      window.Shopify.customerPrivacy.setTrackingConsent(choices, () => {
        console.log('Consent updated');
      });
    }

    if (container) container.classList.add('is-hidden');
  }
}

/**
 * Theme Toggle Functionality
 * Switches between light and dark themes
 */
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.js-theme-toggle, .js-theme-toggle-slider');
  const lightBtns = document.querySelectorAll('.js-theme-light');
  const darkBtns = document.querySelectorAll('.js-theme-dark');
  
  // Helper function to set theme
  function setTheme(theme) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }
  
  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Default to light if no saved preference
    document.body.classList.add('light');
    document.documentElement.classList.add('light');
  }
  
  // Main toggle buttons (toggles between light/dark)
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      setTheme(isDark ? 'light' : 'dark');
    });
  });
  
  // Explicit light theme buttons
  lightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme('light');
    });
  });
  
  // Explicit dark theme buttons
  darkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme('dark');
    });
  });
}

/**
 * Mobile Menu Functionality
 * Handles opening/closing the mobile menu
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.js-menu-toggle');
  const menuContainer = document.querySelector('.mobile-menu-container');
  const headerWrapper = document.getElementById('HeaderWrapper');
  const contentArea = document.querySelector('.content-for-layout');
  
  if (!menuBtn || !menuContainer) return;
  
  menuBtn.addEventListener('click', () => {
    const isOpen = menuContainer.classList.contains('open');
    
    if (isOpen) {
      // Close menu
      menuContainer.classList.remove('open');
      menuContainer.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
      
      if (headerWrapper) {
        headerWrapper.classList.remove('pushed');
      }
      if (contentArea) {
        contentArea.classList.remove('pushed');
      }
      
      document.body.style.overflow = '';
    } else {
      // Open menu
      menuContainer.classList.add('open');
      menuContainer.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close menu');
      
      if (headerWrapper) {
        headerWrapper.classList.add('pushed');
      }
      if (contentArea) {
        contentArea.classList.add('pushed');
      }
      
      document.body.style.overflow = 'hidden';
    }
  });
  
  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && menuContainer.classList.contains('open')) {
      menuContainer.classList.remove('open');
      menuContainer.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      
      if (headerWrapper) {
        headerWrapper.classList.remove('pushed');
      }
      if (contentArea) {
        contentArea.classList.remove('pushed');
      }
      
      document.body.style.overflow = '';
    }
  });
}

/**
 * Smooth Scroll for Anchor Links
 * Handles smooth scrolling to newsletter form and other anchors
 */
function initSmoothScroll() {
  const scrollLinks = document.querySelectorAll('.js-scroll-to-newsletter, a[href^="#"]');
  
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        // Focus the first input if it's a form
        const input = target.querySelector('input');
        if (input) {
          setTimeout(() => input.focus(), 500);
        }
      }
    });
  });
}

/**
 * Blur-up Image Loading
 * Adds smooth blur-to-sharp transition for lazy-loaded images
 */
function initBlurUpImages() {
  const allImages = document.querySelectorAll('.hero-image, .product-image');
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  // Helper to mark image as loaded
  const markAsLoaded = (img) => {
    if (!img.classList.contains('loaded')) {
      img.classList.add('loaded');
    }
  };
  
  // Immediately mark all eager-loaded images as loaded
  allImages.forEach(img => {
    if (img.loading !== 'lazy' || (img.complete && img.naturalHeight !== 0)) {
      markAsLoaded(img);
    }
  });
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // If image is already loaded (cached), mark it immediately
          if (img.complete && img.naturalHeight !== 0) {
            markAsLoaded(img);
          } else {
            // Wait for image to load
            img.addEventListener('load', () => {
              markAsLoaded(img);
            }, { once: true });
            
            // Handle load errors gracefully
            img.addEventListener('error', () => {
              markAsLoaded(img);
            }, { once: true });
            
            // Double-check after a tiny delay in case image loads very quickly
            setTimeout(() => {
              if (img.complete && img.naturalHeight !== 0) {
                markAsLoaded(img);
              }
            }, 100);
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.01
    });
    
    lazyImages.forEach(img => {
      // If image is already in viewport and loaded, mark immediately
      if (img.complete && img.naturalHeight !== 0) {
        markAsLoaded(img);
      } else {
        imageObserver.observe(img);
      }
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        markAsLoaded(img);
      } else {
        img.addEventListener('load', () => {
          markAsLoaded(img);
        }, { once: true });
        
        img.addEventListener('error', () => {
          markAsLoaded(img);
        }, { once: true });
      }
    });
  }
}

/* ========================================
   SHOPIFY CART AJAX (Optional Enhancement)
   ======================================== */

/**
 * Update cart count display
 * Call this after cart updates to refresh the count
 */
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const countElements = document.querySelectorAll('.cart-count');
      countElements.forEach(el => {
        el.textContent = cart.item_count;
      });
    })
    .catch(console.error);
}

// Expose to global scope for Shopify theme customization
window.AAEL = {
  updateCartCount,
  ProductCard,
  HeroCard
};

/* ========================================
   NEWSLETTER FORM VALIDATION
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.newsletter-form-prelaunch').forEach((form) => {
    const input = form.querySelector('.newsletter-input-prelaunch');
    const button = form.querySelector('button[type="submit"]');
    const error = form.querySelector('.newsletter-error-message');
    const errorText = error ? error.querySelector('span:last-child') : null;

    if (!input || !button) return;

    let fieldTouched = false;
    let currentError = '';
    let errorShown = false; // Track if error has been shown via hover

    // Email validation regex - basic but comprehensive
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateEmail = (email) => {
      const trimmed = email.trim();
      
      if (!trimmed) {
        return { valid: false, message: 'Please enter an email address' };
      }
      
      if (!trimmed.includes('@')) {
        return { valid: false, message: "Please include an '@' in the email address" };
      }
      
      if (!emailRegex.test(trimmed)) {
        return { valid: false, message: 'Please enter a valid email address' };
      }
      
      return { valid: true, message: '' };
    };

    const updateButtonState = () => {
      const value = input.value.trim();
      const validation = validateEmail(value);
      
      if (!fieldTouched && !value) {
        // Initial state - button enabled
        button.disabled = false;
        currentError = '';
        errorShown = false;
        if (error) error.classList.remove('error-persist');
      } else if (validation.valid) {
        // Valid email - enable button
        button.disabled = false;
        currentError = '';
        errorShown = false;
        if (error) error.classList.remove('error-persist');
      } else {
        // Invalid email - disable button
        button.disabled = true;
        currentError = validation.message;
      }

      // Update error message text
      if (errorText) {
        errorText.textContent = currentError;
      }
    };

    // On focus: Mark as touched and validate
    input.addEventListener('focus', () => {
      fieldTouched = true;
      updateButtonState();
    });

    // On input: Real-time validation
    input.addEventListener('input', () => {
      if (fieldTouched) {
        updateButtonState();
      }
      
      // Clear server-side error message if visible
      if (error) {
        error.classList.remove('visible');
      }
    });

    // On submit: Final validation
    form.addEventListener('submit', (event) => {
      const validation = validateEmail(input.value);
      
      if (!validation.valid) {
        event.preventDefault();
        event.stopPropagation();
        fieldTouched = true;
        updateButtonState();
        return false;
      }
    });

    // Show error persistently when hovering over disabled button
    button.addEventListener('mouseenter', () => {
      if (button.disabled && currentError && !errorShown) {
        errorShown = true;
        if (error) {
          error.classList.add('error-persist');
        }
      }
    });

    // Initial state
    updateButtonState();
  });
});

// Smooth newsletter success state handling - prevent page jump
(function() {
  // Maintain scroll position on newsletter form submission
  if (window.location.search.includes('contact_posted=true')) {
    // Prevent automatic scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Handle smooth transition to success state
    window.addEventListener('load', () => {
      // Clean up URL without reload
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
      
      // Smooth scroll to newsletter section after brief delay
      setTimeout(() => {
        const newsletter = document.querySelector('.newsletter-section-wrapper') || 
                          document.querySelector('.section-newsletter') ||
                          document.getElementById('newsletter-form');
        
        if (newsletter) {
          const yOffset = -100; // Offset from top for better centering
          const y = newsletter.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          window.scrollTo({ 
            top: y, 
            behavior: 'smooth' 
          });
        }
      }, 200);
    });
  }
})();

/**
 * Dynamic Logo Mark Visibility
 * Show/hide the graphic logo based on available space
 */
(function() {
  function checkLogoSpace() {
    const logoBadges = document.querySelectorAll('.logo-badge');
    
    logoBadges.forEach(badge => {
      const logoMark = badge.querySelector('.logo-mark');
      const brandText = badge.querySelector('.brand-text, .header__heading-logo');
      const collectionText = badge.querySelector('.collection-text');
      
      if (!logoMark || !brandText || !collectionText) return;
      
      // Temporarily hide logo mark to measure text widths
      logoMark.style.display = 'none';
      
      // Get the actual widths
      const badgeWidth = badge.offsetWidth;
      const brandWidth = brandText.offsetWidth || brandText.getBoundingClientRect().width;
      const collectionWidth = collectionText.offsetWidth || collectionText.getBoundingClientRect().width;
      const logoMarkWidth = 24; // SVG is 24px wide
      const gap = 12; // Gap between elements
      const padding = 48; // Total horizontal padding (24px each side)
      
      // Calculate total needed width: brand + gap + logoMark + gap + collection + padding
      const neededWidth = brandWidth + gap + logoMarkWidth + gap + collectionWidth + padding;
      
      // Show logo mark if there's enough space
      if (neededWidth <= badgeWidth) {
        logoMark.classList.add('has-space');
        logoMark.style.display = '';
      } else {
        logoMark.classList.remove('has-space');
        logoMark.style.display = 'none';
      }
    });
  }
  
  // Check on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkLogoSpace);
  } else {
    checkLogoSpace();
  }
  
  // Check on resize with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(checkLogoSpace, 150);
  });
  
  // Check after fonts load (they can change text width)
  if (document.fonts) {
    document.fonts.ready.then(checkLogoSpace);
  }
})();
