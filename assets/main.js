/**
 * AAEL Theme JavaScript
 * Handles theme toggle, column switcher, and cart functionality
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // THEME TOGGLE (Light/Dark)
  // ═══════════════════════════════════════════════════════════════
  
  const ThemeToggle = {
    init() {
      this.toggle = document.querySelector('[data-theme-toggle]');
      if (!this.toggle) return;

      // Apply saved preference (backup, main one is in <head>)
      const saved = localStorage.getItem('aael-theme');
      if (saved) {
        document.documentElement.dataset.theme = saved;
      }

      this.toggle.addEventListener('click', () => this.switch());
    },

    switch() {
      const current = document.documentElement.dataset.theme || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      
      document.documentElement.dataset.theme = next;
      localStorage.setItem('aael-theme', next);

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: next } }));
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // COLUMN SWITCHER
  // ═══════════════════════════════════════════════════════════════
  
  const ColumnSwitcher = {
    init() {
      this.buttons = document.querySelectorAll('[data-columns]');
      if (!this.buttons.length) return;

      // Apply saved preference (backup, main one is in <head>)
      const saved = localStorage.getItem('aael-columns');
      if (saved) {
        this.setColumns(saved);
      }

      this.buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const cols = btn.dataset.columns;
          this.setColumns(cols);
          localStorage.setItem('aael-columns', cols);
        });
      });
    },

    setColumns(cols) {
      document.documentElement.style.setProperty('--columns', cols);
      
      // Update active state
      this.buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.columns === cols);
      });

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('columns:changed', { detail: { columns: cols } }));
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // QUICK ADD TO CART
  // ═══════════════════════════════════════════════════════════════
  
  const QuickCart = {
    init() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-add-to-cart]');
        if (!btn) return;

        e.preventDefault();
        const variantId = btn.dataset.addToCart;
        this.addItem(variantId, btn);
      });
    },

    async addItem(variantId, button) {
      const originalText = button.textContent;
      button.textContent = 'Adding...';
      button.disabled = true;

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [{
              id: variantId,
              quantity: 1
            }]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add item');
        }

        const data = await response.json();
        
        // Update cart count
        this.updateCartCount();
        
        // Success feedback
        button.textContent = 'Added!';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 1500);

        // Dispatch event
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));

      } catch (error) {
        console.error('Add to cart error:', error);
        button.textContent = 'Error';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 1500);
      }
    },

    async updateCartCount() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        
        const countElements = document.querySelectorAll('[data-cart-count]');
        countElements.forEach(el => {
          el.textContent = cart.item_count;
        });
      } catch (error) {
        console.error('Failed to update cart count:', error);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // LAZY LOADING IMAGES (native + fallback)
  // ═══════════════════════════════════════════════════════════════
  
  const LazyImages = {
    init() {
      // Native lazy loading is used via HTML attribute
      // This adds intersection observer for animation triggers
      if (!('IntersectionObserver' in window)) return;

      const images = document.querySelectorAll('.product-card__image');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-loaded');
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1
      });

      images.forEach(img => observer.observe(img));
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SMOOTH SCROLL
  // ═══════════════════════════════════════════════════════════════
  
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const target = document.querySelector(anchor.getAttribute('href'));
          if (!target) return;

          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        });
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════════
  
  document.addEventListener('DOMContentLoaded', () => {
    ThemeToggle.init();
    ColumnSwitcher.init();
    QuickCart.init();
    LazyImages.init();
    SmoothScroll.init();

    // Mark page as loaded (for CSS animations)
    document.body.classList.add('is-loaded');
  });

})();

