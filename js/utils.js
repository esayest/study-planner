/**
 * ابزارهای کمکی زبان فارسی و فرمت‌بندی تاریخ جلالی
 * Persian Language & Jalali Formatting Utilities
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * تبدیل ارقام انگلیسی به فارسی
 * @param {string|number} input 
 * @returns {string}
 */
export function toPersianDigits(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/&#[0-9]+;|&#x[0-9a-fA-F]+;|&[a-zA-Z]+;|[0-9]/g, (match) => {
    if (match.startsWith('&')) return match;
    return PERSIAN_DIGITS[+match];
  });
}

/**
 * تبدیل ارقام فارسی و عربی به انگلیسی
 * @param {string|number} input 
 * @returns {string}
 */
export function toLatinDigits(input) {
  if (input === null || input === undefined) return '';
  let str = String(input);
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), i.toString());
    str = str.replace(new RegExp(ARABIC_DIGITS[i], 'g'), i.toString());
  }
  return str;
}

/**
 * تبدیل تاریخ میلادی به رشته تاریخ شمسی
 * @param {Date} [date] 
 * @returns {string} e.g. "۱۴۰۳/۰۸/۱۷"
 */
export function formatJalaliDate(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch (e) {
    // بازگشت فرمت استاندارد در صورت عدم پشتیبانی مرورگر قدیمی
    return toPersianDigits('۱۴۰۳/۰۸/۱۷');
  }
}

/**
 * ایجاد بازه زمانی پیش‌فرض یک هفته‌ای به تاریخ شمسی
 * @returns {string}
 */
export function getDefaultJalaliRange() {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 6);
  return `${formatJalaliDate(start)} تا ${formatJalaliDate(end)}`;
}

/**
 * تعیین سال تحصیلی پیش‌فرض بر اساس تاریخ روز شمسی
 * @param {Date} date
 * @returns {string} e.g. "۱۴۰۵ - ۱۴۰۶"
 */
export function getDefaultAcademicYear(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: 'numeric' }).formatToParts(date);
    const yearPart = parts.find(p => p.type === 'year');
    const monthPart = parts.find(p => p.type === 'month');
    if (yearPart && monthPart) {
      const jYear = parseInt(yearPart.value, 10);
      const jMonth = parseInt(monthPart.value, 10);
      const startYear = jMonth >= 7 ? jYear : (jYear - 1);
      return `${toPersianDigits(startYear)} - ${toPersianDigits(startYear + 1)}`;
    }
  } catch (e) {}
  return '۱۴۰۵ - ۱۴۰۶';
}

/**
 * پاک‌سازی ورودی‌ها از تگ‌های خطرناک HTML برای امنیت پیش‌نمایش
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * نمایش پیام اعلان (Toast Notification) به زبان فارسی
 * @param {string} message 
 * @param {'success'|'error'|'warning'|'info'} [type='info'] 
 * @param {number} [duration]
 */
export function showToast(message, type = 'info', duration) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-in flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-200 pointer-events-auto cursor-pointer select-none`;

  let bgClass = 'bg-slate-800 border border-slate-700';
  let iconSvg = '';

  switch (type) {
    case 'success':
      bgClass = 'bg-emerald-700 border border-emerald-600';
      iconSvg = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
      break;
    case 'error':
      bgClass = 'bg-rose-700 border border-rose-600';
      iconSvg = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
      break;
    case 'warning':
      bgClass = 'bg-amber-600 border border-amber-500';
      iconSvg = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
      break;
    default:
      bgClass = 'bg-sky-700 border border-sky-600';
      iconSvg = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  toast.className += ` ${bgClass}`;
  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message flex-1 text-right"></span>
    <button class="opacity-70 hover:opacity-100 transition-opacity mr-2 p-0.5" aria-label="بستن">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  const messageSpan = typeof toast.querySelector === 'function' ? toast.querySelector('.toast-message') : null;
  if (messageSpan) {
    messageSpan.textContent = String(message || '');
  }

  let isDismissed = false;
  let autoHideTimer = null;
  const dismiss = () => {
    if (isDismissed) return;
    isDismissed = true;
    if (autoHideTimer) clearTimeout(autoHideTimer);
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => {
      if (typeof toast.remove === 'function') {
        toast.remove();
      } else if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  };

  toast.addEventListener('click', dismiss);

  if (container && typeof container.appendChild === 'function') {
    while (container.children && container.children.length >= 3) {
      const oldest = container.firstElementChild;
      if (typeof oldest.remove === 'function') oldest.remove();
      else if (oldest.parentNode) oldest.parentNode.removeChild(oldest);
    }
    container.appendChild(toast);
  }

  const autoHideMs = (typeof duration === 'number' && duration > 0)
    ? duration
    : (type === 'error' ? 3000 : (type === 'warning' ? 2500 : 1800));

  autoHideTimer = setTimeout(dismiss, autoHideMs);
}
