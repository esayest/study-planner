/**
 * سامانه هوشمند برنامه‌ریزی تحصیلی آکادمی دکتر فروتن کیا
 * اسکریپت تعاملی صفحه وب‌سایت و پرتال دانلود
 * پدیدآورنده: محمد شکیبا (Mohammad Shakiba)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. تعویض تب‌های پیش‌نمایش دفترچه ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // --- 2. آکاردئون سوالات متداول (FAQ) ---
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // بستن سایر سوالات برای نظم بیشتر
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
      } else {
        item.classList.add('open');
      }
    });
  });

  // --- 3. منوی موبایل (Mobile Hamburger) ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    // بستن منو با کلیک روی هر لینک
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // --- 4. تشخیص خودکار سیستم‌عامل کاربر (OS Detection) ---
  const userAgent = navigator.userAgent.toLowerCase();
  const winBtn = document.getElementById('hero-download-win');
  const androidBtn = document.getElementById('hero-download-android');

  if (/android/.test(userAgent)) {
    if (androidBtn && winBtn) {
      androidBtn.classList.remove('btn-outline');
      androidBtn.classList.add('btn-emerald');
      winBtn.classList.remove('btn-primary');
      winBtn.classList.add('btn-outline');
    }
  }

  // --- 5. اسکرول نرم برای لینک‌های داخلی ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href !== '#' && href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // --- 6. به‌روزرسانی سال در فوتر ---
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
