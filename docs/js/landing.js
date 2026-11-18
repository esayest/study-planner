/**
 * سامانه هوشمند برنامه‌ریزی تحصیلی آکادمی دکتر فروتن کیا
 * اسکریپت تعاملی پرتال معرفی سامانه (Landing Page)
 * پدیدآورنده: محمد شکیبا (Mohammad Shakiba)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- ۱. کنترل و تعویض تب‌های ماکاپ ۴ صفحه‌ای A4 ---
  const mockupTabs = document.querySelectorAll('.mockup-tab');
  const sheetPanes = document.querySelectorAll('.sheet-pane');

  mockupTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-pane');
      if (!targetId) return;

      mockupTabs.forEach(t => t.classList.remove('active'));
      sheetPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // --- ۲. آکاردئون پرسش‌های متداول (FAQ Accordion) ---
  const faqCards = document.querySelectorAll('.faq-card');

  faqCards.forEach(card => {
    const header = card.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');

      // بستن سایر آیتم‌ها برای نظم بصری
      faqCards.forEach(c => {
        if (c !== card) c.classList.remove('open');
      });

      if (isOpen) {
        card.classList.remove('open');
      } else {
        card.classList.add('open');
      }
    });
  });

  // --- ۳. منوی همبرگری موبایل (Mobile Navigation Toggle) ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // --- ۴. اسکرول نرم برای پیوندهای لنگری ---
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

  // --- ۵. تنظیم سال جاری میلادی / شمسی در فوتر ---
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
