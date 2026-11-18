/**
 * سامانه هوشمند برنامه‌ریزی تحصیلی آکادمی دکتر فروتن کیا
 * اسکریپت تعاملی وب‌سایت رسمی
 * پدیدآورنده: محمد شکیبا (Mohammad Shakiba)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. تعویض تب‌های بازرسی برگه نمونه A4 ---
  const specimenTabs = document.querySelectorAll('.specimen-tab, .tab-btn');
  const specimenPanes = document.querySelectorAll('.pane-item, .tab-content');

  specimenTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-pane') || btn.getAttribute('data-tab');

      specimenTabs.forEach(b => b.classList.remove('active'));
      specimenPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // --- 2. آکاردئون سوالات متداول (FAQ) ---
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // بستن سایر سوالات برای انضباط بصری
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

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // --- 4. اسکرول نرم برای پیوندهای داخلی ---
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

  // --- 5. درج سال معتبر در فوتر ---
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
