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
   GLOBAL UI LOGIC
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initSmoothScroll();
  initCookieConsent();
});

/**
 * Cookie Consent Functionality
 * Handles banner visibility and preferences
 */
function initCookieConsent() {
  const container = document.getElementById('CookieConsent');
  const storageKey = 'aael-cookie-consent';

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
  // Remove the '|| true' once you confirm it works!
  if (savedConsent && !window.location.search.includes('debug')) return;

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
  const toggleBtns = document.querySelectorAll('.js-theme-toggle');
  
  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(savedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(savedTheme);
  } else {
    // Default to light if no saved preference
    document.body.classList.add('light');
    document.documentElement.classList.add('light');
  }
  
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      
      localStorage.setItem('theme', newTheme);
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
  ProductCard
};
