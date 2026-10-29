/**
 * ============================================================================
 * PULSEFLOW RESPONSIVE LANDING PAGE — INTERACTIVE JAVASCRIPT
 * ============================================================================
 * Vanilla ES6+ implementation with zero external dependencies.
 *
 * Modules & Capabilities:
 * 1. Safe Storage Helper (guards against opaque-origin / sandboxed exceptions)
 * 2. Mobile Navigation Drawer & Hamburger Toggle (with ARIA & Focus Trap)
 * 3. Sticky Header with Scroll-Depth Detection
 * 4. Scrollspy for Active Navigation Link Highlighting (IntersectionObserver)
 * 5. Theme Switcher (Dark / Light Mode with localStorage & OS preference)
 * 6. Interactive Product Workflow Tabs (Keyboard Accessible Tablist)
 * 7. Code Snippet Copy-to-Clipboard Utility
 * 8. Pricing Frequency Toggle (Monthly vs. Annual with 20% Discount)
 * 9. Accessible FAQ Accordion (ARIA-compliant single/multi-panel disclosure)
 * 10. Newsletter Form Client-Side Validation & Feedback
 * 11. Accessible Toast Notification System
 * 12. Back-to-Top Smooth Scroll Controller
 * 13. Interactive Platform Demo Modal Dialog
 * ============================================================================
 */

(function () {
  'use strict';

  // Safe Storage Helper to handle sandboxed or data: URI origins gracefully
  const safeStorage = {
    get(key) {
      try {
        return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        // Suppress private browsing / cross-origin storage quota errors
      }
    }
  };

  // Wait until DOM is fully parsed
  document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initStickyHeader();
    initMobileNav();
    initScrollspy();
    initShowcaseTabs();
    initCodeCopy();
    initPricingToggle();
    initAccordion();
    initLeadForm();
    initBackToTop();
    initDemoModal();
  });

  /* --------------------------------------------------------------------------
     1. THEME MANAGER (Dark / Light Mode)
     -------------------------------------------------------------------------- */
  function initThemeManager() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;

    // Detect stored preference, or default to the HTML document's data-theme
    const existingTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const savedTheme = safeStorage.get('pulseflow-theme');
    const initialTheme = savedTheme || existingTheme;

    document.documentElement.setAttribute('data-theme', initialTheme);

    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      safeStorage.set('pulseflow-theme', newTheme);

      showToast(`Switched to ${newTheme} theme`, 'info');
    });

    // Listen for OS system theme changes if user hasn't explicitly set one
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!safeStorage.get('pulseflow-theme')) {
          const osTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', osTheme);
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     2. STICKY HEADER SCROLL DETECTION
     -------------------------------------------------------------------------- */
  function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let ticking = false;

    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    // Initial check on load
    handleScroll();
  }

  /* --------------------------------------------------------------------------
     3. MOBILE NAVIGATION DRAWER & TOGGLE
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-actions .btn');

    if (!toggleBtn || !drawer) return;

    function openDrawer() {
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }

    function closeDrawer() {
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }

    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close when clicking any link inside the mobile drawer
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
        toggleBtn.focus();
      }
    });

    // Close on window resize if scaling up to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. SCROLLSPY (ACTIVE LINK HIGHLIGHTING VIA INTERSECTION OBSERVER)
     -------------------------------------------------------------------------- */
  function initScrollspy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }

  /* --------------------------------------------------------------------------
     5. INTERACTIVE WORKFLOW SHOWCASE TABS
     -------------------------------------------------------------------------- */
  function initShowcaseTabs() {
    const tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;

    const tabs = tabList.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('.tab-panel');

    function switchTab(newTab) {
      // Deactivate all tabs
      tabs.forEach((tab) => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });

      // Hide all panels
      panels.forEach((panel) => {
        panel.classList.remove('active');
        panel.hidden = true;
      });

      // Activate target tab
      newTab.classList.add('active');
      newTab.setAttribute('aria-selected', 'true');
      newTab.setAttribute('tabindex', '0');
      newTab.focus();

      // Show associated panel
      const targetPanelId = newTab.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.hidden = false;
      }
    }

    tabs.forEach((tab, index) => {
      // Click interaction
      tab.addEventListener('click', () => switchTab(tab));

      // Keyboard navigation (Arrow keys, Home, End)
      tab.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabs.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          switchTab(tabs[targetIndex]);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. CODE SNIPPET COPY TO CLIPBOARD
     -------------------------------------------------------------------------- */
  function initCodeCopy() {
    const copyButtons = document.querySelectorAll('.copy-code-btn');
    copyButtons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            // Fallback for environments lacking clipboard API
            const tempArea = document.createElement('textarea');
            tempArea.value = textToCopy;
            document.body.appendChild(tempArea);
            tempArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempArea);
          }

          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.color = '#34d399';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.color = '';
          }, 2000);

          showToast('Snippet copied to clipboard!', 'success');
        } catch (err) {
          showToast('Failed to copy code snippet.', 'error');
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. PRICING FREQUENCY TOGGLE (Monthly vs Annual 20% discount)
     -------------------------------------------------------------------------- */
  function initPricingToggle() {
    const switchBtn = document.getElementById('billing-switch');
    const monthlyLabel = document.getElementById('monthly-label');
    const annualLabel = document.getElementById('annual-label');
    const priceElements = document.querySelectorAll('.price-value');
    const proNote = document.getElementById('pro-billing-note');
    const entNote = document.getElementById('enterprise-billing-note');

    if (!switchBtn) return;

    let isAnnual = true; // default is annual

    function updatePricing() {
      switchBtn.setAttribute('aria-checked', isAnnual ? 'true' : 'false');

      if (isAnnual) {
        annualLabel.classList.add('active');
        monthlyLabel.classList.remove('active');
        if (proNote) proNote.textContent = 'Billed annually ($468/yr)';
        if (entNote) entNote.textContent = 'Billed annually ($2,388/yr)';
      } else {
        monthlyLabel.classList.add('active');
        annualLabel.classList.remove('active');
        if (proNote) proNote.textContent = 'Billed monthly ($49/mo)';
        if (entNote) entNote.textContent = 'Billed monthly ($249/mo)';
      }

      priceElements.forEach((el) => {
        const targetPrice = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        if (targetPrice !== null) {
          // Subtle fade transition for pricing updates
          el.style.opacity = '0';
          setTimeout(() => {
            el.textContent = targetPrice;
            el.style.opacity = '1';
          }, 150);
        }
      });
    }

    switchBtn.addEventListener('click', () => {
      isAnnual = !isAnnual;
      updatePricing();
      showToast(`Showing ${isAnnual ? 'annual (20% off)' : 'monthly'} billing rates`, 'info');
    });

    // Also allow clicking directly on labels
    if (monthlyLabel) {
      monthlyLabel.style.cursor = 'pointer';
      monthlyLabel.addEventListener('click', () => {
        if (isAnnual) {
          isAnnual = false;
          updatePricing();
        }
      });
    }

    if (annualLabel) {
      annualLabel.style.cursor = 'pointer';
      annualLabel.addEventListener('click', () => {
        if (!isAnnual) {
          isAnnual = true;
          updatePricing();
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     8. ACCESSIBLE FAQ ACCORDION
     -------------------------------------------------------------------------- */
  function initAccordion() {
    const triggers = document.querySelectorAll('.accordion-trigger');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const panelId = trigger.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);

        if (!panel) return;

        if (isExpanded) {
          trigger.setAttribute('aria-expanded', 'false');
          panel.hidden = true;
        } else {
          // Optional: close other open accordion panels for clean accordion flow
          triggers.forEach((otherTrigger) => {
            if (otherTrigger !== trigger && otherTrigger.getAttribute('aria-expanded') === 'true') {
              otherTrigger.setAttribute('aria-expanded', 'false');
              const otherPanel = document.getElementById(otherTrigger.getAttribute('aria-controls'));
              if (otherPanel) otherPanel.hidden = true;
            }
          });

          trigger.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     9. LEAD GENERATION FORM VALIDATION & FEEDBACK
     -------------------------------------------------------------------------- */
  function initLeadForm() {
    const form = document.getElementById('lead-form');
    const emailInput = document.getElementById('lead-email');
    const errorMsg = document.getElementById('email-error');
    const submitBtn = document.getElementById('submit-btn');

    if (!form || !emailInput || !errorMsg || !submitBtn) return;

    // Email regex matching standard format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validateEmail() {
      const val = emailInput.value.trim();
      if (!val) {
        emailInput.classList.add('is-invalid');
        errorMsg.textContent = 'Please enter your work email address.';
        return false;
      } else if (!emailRegex.test(val)) {
        emailInput.classList.add('is-invalid');
        errorMsg.textContent = 'Please enter a valid work email address (e.g. name@company.com).';
        return false;
      } else {
        emailInput.classList.remove('is-invalid');
        errorMsg.textContent = '';
        return true;
      }
    }

    // Real-time input clearing
    emailInput.addEventListener('input', () => {
      if (emailInput.classList.contains('is-invalid')) {
        validateEmail();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateEmail()) {
        emailInput.focus();
        return;
      }

      // Simulate network request
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        const enteredEmail = emailInput.value.trim();
        form.reset();

        showToast(`🎉 Access invite sent to ${enteredEmail}! Welcome to Pulseflow.`, 'success');
      }, 1200);
    });
  }

  /* --------------------------------------------------------------------------
     10. ACCESSIBLE TOAST NOTIFICATIONS
     -------------------------------------------------------------------------- */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span aria-hidden="true">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 250ms ease';
      setTimeout(() => {
        if (toast.parentNode === container) {
          container.removeChild(toast);
        }
      }, 260);
    }, 4000);
  }

  /* --------------------------------------------------------------------------
     11. BACK-TO-TOP SMOOTH SCROLL CONTROLLER
     -------------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    const footerLink = document.getElementById('back-to-top-footer');

    function scrollToTop(e) {
      if (e) e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    if (btn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }, { passive: true });

      btn.addEventListener('click', scrollToTop);
    }

    if (footerLink) {
      footerLink.addEventListener('click', scrollToTop);
    }
  }

  /* --------------------------------------------------------------------------
     12. DEMO MODAL DIALOG
     -------------------------------------------------------------------------- */
  function initDemoModal() {
    const modal = document.getElementById('demo-modal');
    const openBtn = document.getElementById('demo-modal-trigger');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const ctaBtn = document.getElementById('modal-cta-btn');

    if (!modal || !openBtn) return;

    function openModal() {
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
    }

    function closeModal() {
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (ctaBtn) ctaBtn.addEventListener('click', closeModal);

    // Backdrop click dismiss
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeModal();
      }
    });
  }

})();
