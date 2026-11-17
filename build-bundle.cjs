const fs = require('fs');
const path = require('path');
process.chdir(__dirname);

const originalLogoDataUri = fs.readFileSync('assets/logo-base64.txt', 'utf8').trim();
const darkLogoDataUri = 'data:image/png;base64,' + fs.readFileSync('assets/academy-logo-dark-transparent.png').toString('base64');

const code = `/**
 * سامانه هوشمند برنامه‌ریزی تحصیلی آکادمی دکتر فروتن کیا
 * طراح و پدیدآورنده (Author): Mohammad Shakiba (محمد شکیبا)
 * نسخه استاندارد A4 (ابعاد: 297mm در 210mm)
 * با چیدمان جابجا شده (Transposed Grid): پارت‌ها در سرفصل ستون‌ها و روزهای هفته در سطرها
 */
(function () {
  'use strict';

  // ==========================================
  // ۱. آرم رسمی و اصلی آکادمی با رنگ‌های دقیق و شفافیت ۱۰۰٪
  // ==========================================
  function getOfficialLogoUri() {
    if (typeof document !== 'undefined') {
      const favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel~="icon"]');
      return (favicon && (favicon.getAttribute('href') || favicon.href)) || '';
    }
    return '';
  }
  const EMBEDDED_DARK_LOGO = "${darkLogoDataUri}";

  const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  function toPersianDigits(input, preserveUrls = true) {
    if (input === null || input === undefined) return '';
    if (!preserveUrls) {
      return String(input).replace(/&#[0-9]+;|&#x[0-9a-fA-F]+;|&[a-zA-Z]+;|[0-9]/g, (match) => {
        if (match.startsWith('&')) return match;
        return PERSIAN_DIGITS[+match];
      });
    }

    const pattern = /(?:https?:\\/\\/|ftp:\\/\\/|www\\.|t\\.me\\/)[^\\s<>"'\\u0060]+|\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b|&#[0-9]+;|&#x[0-9a-fA-F]+;|&[a-zA-Z]+;|[0-9]/gi;
    return String(input).replace(pattern, (match) => {
      if (match.length > 1 || match.startsWith('&')) {
        const urlTrailingMatch = match.match(/^((?:https?:\\/\\/|ftp:\\/\\/|www\\.|t\\.me\\/)[^\\s<>"'\\u0060]+?)([.,،؛!?)]]+)$/i);
        if (urlTrailingMatch) {
          const urlPart = urlTrailingMatch[1];
          const trailingPunct = urlTrailingMatch[2];
          return urlPart + toPersianDigits(trailingPunct, false);
        }
        return match;
      }
      const code = match.charCodeAt(0);
      if (code >= 48 && code <= 57) {
        return PERSIAN_DIGITS[code - 48];
      }
      return match;
    });
  }

  function toLatinDigits(input) {
    if (input === null || input === undefined) return '';
    let str = String(input);
    for (let i = 0; i < 10; i++) {
      str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), i.toString());
      str = str.replace(new RegExp(ARABIC_DIGITS[i], 'g'), i.toString());
    }
    return str;
  }

  function getStudentFullName(student) {
    if (!student) return '';
    if (student.fullName !== undefined && student.fullName !== null && String(student.fullName).trim()) {
      return String(student.fullName).trim();
    }
    const fName = (student.firstName !== undefined && student.firstName !== null) ? String(student.firstName) : '';
    const lName = (student.lastName !== undefined && student.lastName !== null) ? String(student.lastName) : '';
    return \`\${fName} \${lName}\`.trim();
  }

  const PERSIAN_ORDINALS = {
    1: 'اول',
    2: 'دوم',
    3: 'سوم',
    4: 'چهارم',
    5: 'پنجم',
    6: 'ششم',
    7: 'هفتم',
    8: 'هشتم',
    9: 'نهم',
    10: 'دهم',
    11: 'یازدهم',
    12: 'دوازدهم',
    13: 'سیزدهم',
    14: 'چهاردهم',
    15: 'پانزدهم',
    16: 'شانزدهم',
    17: 'هفدهم',
    18: 'هجدهم',
    19: 'نوزدهم',
    20: 'بیستم',
    21: 'بیست و یکم',
    22: 'بیست و دوم',
    23: 'بیست و سوم',
    24: 'بیست و چهارم',
    25: 'بیست و پنجم',
    26: 'بیست و ششم',
    27: 'بیست و هفتم',
    28: 'بیست و هشتم',
    29: 'بیست و نهم',
    30: 'سی‌ام',
    31: 'سی و یکم',
    32: 'سی و دوم',
    33: 'سی و سوم',
    34: 'سی و چهارم',
    35: 'سی و پنجم',
    36: 'سی و ششم',
    37: 'سی و هفتم',
    38: 'سی و هشتم',
    39: 'سی و نهم',
    40: 'چهلم',
    41: 'چهل و یکم',
    42: 'چهل و دوم',
    43: 'چهل و سوم',
    44: 'چهل و چهارم',
    45: 'چهل و پنجم',
    46: 'چهل و ششم',
    47: 'چهل و هفتم',
    48: 'چهل و هشتم',
    49: 'چهل و نهم',
    50: 'پنجاهم',
    51: 'پنجاه و یکم',
    52: 'پنجاه و دوم',
  };

  function formatWeekDisplay(val) {
    if (val === null || val === undefined || String(val).trim() === '') {
      return 'هفته اول';
    }
    const cleanStr = String(val).trim();
    if (cleanStr.startsWith('هفته ')) {
      return cleanStr;
    }
    const latin = toLatinDigits(cleanStr);
    const num = parseInt(latin, 10);
    if (!isNaN(num) && num > 0) {
      if (PERSIAN_ORDINALS[num]) {
        return 'هفته ' + PERSIAN_ORDINALS[num];
      }
      return 'هفته ' + toPersianDigits(num);
    }
    return 'هفته ' + cleanStr;
  }

  function formatJalaliDate(date = new Date()) {
    try {
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date);
    } catch (e) {
      return toPersianDigits('۱۴۰۳/۰۸/۱۷');
    }
  }

  function getDefaultJalaliRange() {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 6);
    return \`\${formatJalaliDate(start)} تا \${formatJalaliDate(end)}\`;
  }

  function getDefaultAcademicYear(date = new Date()) {
    try {
      const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: 'numeric' }).formatToParts(date);
      const yearPart = parts.find(p => p.type === 'year');
      const monthPart = parts.find(p => p.type === 'month');
      if (yearPart && monthPart) {
        const jYear = parseInt(yearPart.value, 10);
        const jMonth = parseInt(monthPart.value, 10);
        const startYear = jMonth >= 7 ? jYear : (jYear - 1);
        return \`\${toPersianDigits(startYear)} - \${toPersianDigits(startYear + 1)}\`;
      }
    } catch (e) {}
    return '۱۴۰۵ - ۱۴۰۶';
  }

  function sanitizeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info', duration) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = \`toast toast-\${type} animate-slide-in flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-200 pointer-events-auto cursor-pointer select-none\`;

    let bgClass = 'bg-slate-800 border border-slate-700';
    let iconSvg = '';

    switch (type) {
      case 'success':
        bgClass = 'bg-emerald-700 border border-emerald-600';
        iconSvg = '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        break;
      case 'error':
        bgClass = 'bg-rose-700 border border-rose-600';
        iconSvg = '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
        break;
      case 'warning':
        bgClass = 'bg-amber-600 border border-amber-500';
        iconSvg = '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
        break;
      default:
        bgClass = 'bg-sky-700 border border-sky-600';
        iconSvg = '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    }

    toast.className += \` \${bgClass}\`;
    toast.innerHTML = \`
      \${iconSvg}
      <span class="toast-message flex-1 text-right"></span>
      <button class="opacity-70 hover:opacity-100 transition-opacity mr-2 p-0.5" aria-label="بستن">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    \`;

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
      toast.classList.remove('animate-slide-in');
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

  // روزهای هفته به ترتیب اصلی و استاندارد (شنبه تا جمعه)
  const DAYS_OF_WEEK = [
    { key: 'sat', label: 'شنبه' },
    { key: 'sun', label: 'یکشنبه' },
    { key: 'mon', label: 'دوشنبه' },
    { key: 'tue', label: 'سه‌شنبه' },
    { key: 'wed', label: 'چهارشنبه' },
    { key: 'thu', label: 'پنج‌شنبه' },
    { key: 'fri', label: 'جمعه' },
  ];

  // کلیه کلیدهای مجاز برای ایام در برنامه‌های تا ۱۴ روز
  const ALL_PLANNER_DAY_KEYS = [
    'sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri',
    'sat_2', 'sun_2', 'mon_2', 'tue_2', 'wed_2', 'thu_2', 'fri_2'
  ];

  // رشته‌های تحصیلی استاندارد
  const FIELDS_OF_STUDY = [
    'ریاضی و فیزیک',
    'علوم تجربی',
    'ادبیات و علوم انسانی',
    'علوم و معارف اسلامی',
    'منحصرا زبان',
    'هنر',
  ];

  // ماتریس دروس رشته ادبیات و علوم انسانی (صفحه ۴)
  const HUMANITIES_SUBJECTS = {
    grade10: [
      { id: 'fonoun', name: 'فنون ۱۰' },
      { id: 'arabi', name: 'عربی ۱۰' },
      { id: 'jameeh', name: 'جامعه ۱۰' },
      { id: 'tarikh', name: 'تاریخ ۱۰' },
      { id: 'joghrafa', name: 'جغرافیا ۱۰' },
      { id: 'mantegh', name: 'منطق' },
      { id: 'eghtesad', name: 'اقتصاد' },
      { id: 'riyazi', name: 'ریاضی ۱۰' },
      { id: 'zaban', name: 'زبان ۱۰' },
      { id: 'farsi', name: 'فارسی ۱۰' },
      { id: 'dini', name: 'دینی ۱۰' },
    ],
    grade11: [
      { id: 'fonoun', name: 'فنون ۱۱' },
      { id: 'arabi', name: 'عربی ۱۱' },
      { id: 'jameeh', name: 'جامعه ۱۱' },
      { id: 'tarikh', name: 'تاریخ ۱۱' },
      { id: 'joghrafa', name: 'جغرافیا ۱۱' },
      { id: 'falsafeh', name: 'فلسفه ۱۱' },
      { id: 'ravanshenasi', name: 'روانشناسی' },
      { id: 'riyazi', name: 'ریاضی ۱۱' },
      { id: 'zaban', name: 'زبان ۱۱' },
      { id: 'farsi', name: 'فارسی ۱۱' },
      { id: 'dini', name: 'دینی ۱۱' },
    ],
    grade12: [
      { id: 'fonoun', name: 'فنون ۱۲' },
      { id: 'arabi', name: 'عربی ۱۲' },
      { id: 'jameeh', name: 'جامعه ۱۲' },
      { id: 'tarikh', name: 'تاریخ ۱۲' },
      { id: 'joghrafa', name: 'جغرافیا ۱۲' },
      { id: 'falsafeh', name: 'فلسفه ۱۲' },
      { id: 'salamat', name: 'سلامت' },
      { id: 'riyazi', name: 'ریاضی ۱۲' },
      { id: 'zaban', name: 'زبان ۱۲' },
      { id: 'farsi', name: 'فارسی ۱۲' },
      { id: 'dini', name: 'دینی ۱۲' },
    ],
    farhangian: [
      { id: 'hoosh', name: 'هوش' },
      { id: 'maharat', name: 'مهارت' },
      { id: 'dini10', name: 'دینی دهم' },
      { id: 'dini11', name: 'دینی یازدهم' },
    ],
  };

  const PROGRESS_ROWS = [
    { key: 'status', label: 'وضعیت' },
    { key: 'r1', label: 'مرور ۱' },
    { key: 'r2', label: 'مرور ۲' },
    { key: 'r3', label: 'مرور ۳' },
  ];

  function getInitialHumanitiesProgress() {
    const progress = {};
    Object.keys(HUMANITIES_SUBJECTS).forEach(gradeKey => {
      progress[gradeKey] = {};
      HUMANITIES_SUBJECTS[gradeKey].forEach(subj => {
        progress[gradeKey][subj.id] = {
          status: '',
          r1: '',
          r2: '',
          r3: '',
        };
      });
    });
    return progress;
  }

  function isHumanitiesField(state) {
    const field = (state && state.student && state.student.fieldOfStudy) ? String(state.student.fieldOfStudy).trim() : '';
    return field === 'ادبیات و علوم انسانی' || field.includes('انسانی');
  }

  function getOrderedDays(startDayKey = 'sat', dayCount = 7) {
    const key = startDayKey || 'sat';
    const count = Math.max(2, Math.min(14, parseInt(dayCount, 10) || 7));
    const startIndex = DAYS_OF_WEEK.findIndex(d => d.key === key);
    const validStartIndex = startIndex >= 0 ? startIndex : 0;

    const result = [];
    for (let i = 0; i < count; i++) {
      const dayIndex = (validStartIndex + i) % 7;
      const baseDay = DAYS_OF_WEEK[dayIndex];
      const cycle = Math.floor(i / 7) + 1; // ۱ برای روزهای اول تا هفتم، ۲ برای روزهای هشتم تا چهاردهم
      const dayKey = cycle === 1 ? baseDay.key : (baseDay.key + '_2');
      const dayLabel = baseDay.label;

      result.push({
        key: dayKey,
        dayOfWeekKey: baseDay.key,
        label: dayLabel,
        baseLabel: baseDay.label,
        dayIndex: i,
        dayNumber: i + 1,
        cycle: cycle,
      });
    }
    return result;
  }

  // پالت رنگارنگ، متنوع و زنده ایام هفته با رنگ‌های خالص و باکنتراست (بدون گرادینت تارکننده)
  const DAY_THEMES = {
    sat: {
      key: 'sat',
      label: 'شنبه',
      badge: 'bg-blue-600 text-white font-bold shadow-xs',
      rowBg: 'bg-blue-50/45',
      cardBg: 'bg-white/95 hover:bg-blue-50/60',
      border: 'border-blue-200/90',
      testBadge: 'bg-blue-100 text-blue-900 border-blue-300',
      editorBadge: 'bg-blue-600 text-white font-bold',
    },
    sun: {
      key: 'sun',
      label: 'یکشنبه',
      badge: 'bg-purple-600 text-white font-bold shadow-xs',
      rowBg: 'bg-purple-50/45',
      cardBg: 'bg-white/95 hover:bg-purple-50/60',
      border: 'border-purple-200/90',
      testBadge: 'bg-purple-100 text-purple-900 border-purple-300',
      editorBadge: 'bg-purple-600 text-white font-bold',
    },
    mon: {
      key: 'mon',
      label: 'دوشنبه',
      badge: 'bg-emerald-600 text-white font-bold shadow-xs',
      rowBg: 'bg-emerald-50/45',
      cardBg: 'bg-white/95 hover:bg-emerald-50/60',
      border: 'border-emerald-300/80',
      testBadge: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold',
      editorBadge: 'bg-emerald-600 text-white font-bold',
    },
    tue: {
      key: 'tue',
      label: 'سه‌شنبه',
      badge: 'bg-amber-600 text-white font-bold shadow-xs',
      rowBg: 'bg-amber-50/45',
      cardBg: 'bg-white/95 hover:bg-amber-50/60',
      border: 'border-amber-200/90',
      testBadge: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
      editorBadge: 'bg-amber-600 text-white font-bold',
    },
    wed: {
      key: 'wed',
      label: 'چهارشنبه',
      badge: 'bg-sky-600 text-white font-bold shadow-xs',
      rowBg: 'bg-sky-50/50',
      cardBg: 'bg-white/95 hover:bg-sky-50/65',
      border: 'border-sky-300/80',
      testBadge: 'bg-sky-100 text-sky-950 border-sky-300 font-bold',
      editorBadge: 'bg-sky-600 text-white font-bold',
    },
    thu: {
      key: 'thu',
      label: 'پنج‌شنبه',
      badge: 'bg-fuchsia-600 text-white font-bold shadow-xs',
      rowBg: 'bg-fuchsia-50/45',
      cardBg: 'bg-white/95 hover:bg-fuchsia-50/60',
      border: 'border-fuchsia-200/90',
      testBadge: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
      editorBadge: 'bg-fuchsia-600 text-white font-bold',
    },
    fri: {
      key: 'fri',
      label: 'جمعه',
      badge: 'bg-rose-600 text-white font-bold shadow-xs',
      rowBg: 'bg-rose-50/55',
      cardBg: 'bg-white/95 hover:bg-rose-50/70',
      border: 'border-rose-200/90',
      testBadge: 'bg-rose-100 text-rose-950 border-rose-300 font-bold',
      editorBadge: 'bg-rose-600 text-white font-bold',
    },
  };

  // نگاشت خودکار تم‌های روزهای هفته دوم به همان رنگ‌های پایه
  ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'].forEach(k => {
    DAY_THEMES[k + '_2'] = DAY_THEMES[k];
  });

  function getDayTheme(keyOrDay) {
    if (!keyOrDay) return DAY_THEMES.sat;
    if (typeof keyOrDay === 'object') {
      const k = keyOrDay.dayOfWeekKey || keyOrDay.key || 'sat';
      const baseKey = String(k).replace(/_2$/, '');
      return DAY_THEMES[baseKey] || DAY_THEMES.sat;
    }
    const baseKey = String(keyOrDay).replace(/_2$/, '');
    return DAY_THEMES[baseKey] || DAY_THEMES.sat;
  }

  const PART_HEADER_COLORS = [
    'text-sky-300',
    'text-purple-300',
    'text-emerald-300',
    'text-amber-300',
    'text-teal-300',
    'text-fuchsia-300',
    'text-rose-300',
    'text-cyan-300',
    'text-yellow-300',
  ];

  function getThemeConfig(theme) {
    const isPink = theme === 'pink';
    return {
      name: isPink ? 'pink' : 'navy',
      isPink: isPink,
      // Page 1 (Cover)
      coverBg: isPink
        ? 'bg-gradient-to-br from-[#270c1d] via-[#3a112a] to-[#1c0614]'
        : 'bg-gradient-to-br from-[#020617] via-[#0b1a3d] to-[#1c1236]',
      coverBorder: isPink
        ? 'border-pink-400/40 shadow-[0_0_25px_rgba(244,114,182,0.15)_inset]'
        : 'border-amber-400/30',
      coverTitle: isPink
        ? 'text-[#fce7f3] drop-shadow-[0_2px_12px_rgba(244,114,182,0.45)]'
        : 'text-amber-400 drop-shadow-xs',
      coverSubtitle: isPink
        ? 'text-[#f472b6]'
        : 'text-sky-300',
      coverDivider: isPink
        ? 'bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500'
        : 'bg-amber-400',
      coverPill: isPink
        ? 'border-pink-400/50 bg-pink-500/20 text-pink-200'
        : 'border-amber-400/50 bg-amber-400/15 text-amber-300',
      coverCardBg: isPink
        ? 'bg-[#3b1229]/90 border border-pink-400/40 shadow-2xl'
        : 'bg-[#121f3f] border border-amber-400/40 shadow-xl',
      coverCardSubtitle: isPink
        ? 'text-[#f9a8d4]'
        : 'text-amber-300',
      coverCardDiamond: isPink
        ? 'text-[#fb7185]'
        : 'text-amber-400',
      coverCardBrand: isPink
        ? 'text-[#f472b6]'
        : 'text-sky-300',
      coverNameBorder: isPink
        ? 'border-[#fb7185]'
        : 'border-amber-400',
      coverBottomBar: isPink
        ? 'background: #fb7185; background: linear-gradient(90deg, #f43f5e, #fb7185, #f472b6);'
        : 'background: #1e70bf; background: linear-gradient(90deg, #1e70bf, #f59e0b, #1e70bf);',
      // Cover mini cards
      coverFieldCard: isPink
        ? 'bg-[#500724]/80 border-rose-400/50 text-rose-300'
        : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
      coverFieldText: isPink ? 'text-rose-100' : 'text-emerald-100',
      coverCounselorCard: isPink
        ? 'bg-[#4c0519]/80 border-pink-400/50 text-pink-300'
        : 'bg-amber-950/70 border-amber-500/50 text-amber-300',
      coverCounselorText: isPink ? 'text-pink-100' : 'text-amber-100',
      coverTimeframeCard: isPink
        ? 'bg-[#480c27]/85 border-pink-400/45 text-pink-300'
        : 'bg-sky-950/70 border-sky-500/50 text-sky-300',
      coverTimeframeText: isPink ? 'text-pink-100' : 'text-sky-100',
      coverSchoolCard: isPink
        ? 'bg-[#380e28]/90 border-pink-400/45 text-pink-300'
        : 'bg-purple-950/70 border-purple-500/50 text-purple-300',
      coverSchoolText: isPink ? 'text-pink-100' : 'text-purple-100',

      // Page 2 (Planner Table)
      plannerTheadRow: isPink
        ? 'bg-[#4c0519] text-white font-bold text-center divide-x divide-x-reverse divide-[#831843]'
        : 'bg-indigo-950 text-white font-bold text-center divide-x divide-x-reverse divide-indigo-800',
      plannerDayColTh: isPink
        ? 'py-2 bg-[#4c0519] text-white text-xs font-bold'
        : 'py-2 bg-indigo-950 text-white text-xs font-bold',
      plannerNormalTh: isPink
        ? 'py-2 px-1 text-center bg-[#4c0519] text-white font-bold'
        : 'py-2 px-1 text-center bg-indigo-950 text-white font-bold',
      plannerNightTh: isPink
        ? 'py-2 px-1 text-center bg-[#330411] text-white font-bold'
        : 'py-2 px-1 text-center bg-[#131d3b] text-white font-bold',
      plannerNightCard: isPink
        ? 'bg-rose-50/80 border border-rose-300/90 shadow-2xs'
        : 'bg-indigo-50/70 border border-indigo-300/90 shadow-2xs',
      plannerNightTestBadge: isPink
        ? 'bg-rose-100/90 text-rose-950 border border-rose-300 font-bold'
        : 'bg-indigo-100/90 text-indigo-950 border border-indigo-300 font-bold',

      // Page 3 & Page 4 Headings
      pageHeaderBorder: isPink
        ? 'border-b-2 border-[#831843]'
        : 'border-b-2 border-indigo-950',
      pageBadge: isPink
        ? 'bg-[#831843] text-white'
        : 'bg-indigo-950 text-white',
      pageTitleText: isPink
        ? 'text-[#831843]'
        : 'text-indigo-950',
      pagePillText: isPink
        ? 'text-[#831843]'
        : 'text-indigo-950',

      // Page 3 Counselor Notes
      notesBoxBorder: isPink
        ? 'border border-rose-200 rounded-xl p-3 bg-rose-50/25 shadow-2xs flex-1 flex flex-col justify-start'
        : 'border border-indigo-200 rounded-xl p-3 bg-indigo-50/30 shadow-2xs flex-1 flex flex-col justify-start',
      notesBoxBorderContinuation: isPink
        ? 'border border-rose-200 rounded-xl p-3.5 bg-rose-50/25 shadow-2xs flex-1 flex flex-col justify-start'
        : 'border border-indigo-200 rounded-xl p-3.5 bg-indigo-50/30 shadow-2xs flex-1 flex flex-col justify-start',
      notesHeaderBorder: isPink
        ? 'border-b border-rose-200'
        : 'border-b border-indigo-200',
      notesDiamond: isPink
        ? 'bg-[#831843] text-pink-300'
        : 'bg-indigo-950 text-amber-400',
      noteCardBorder: isPink
        ? 'border-rose-100 hover:border-rose-300'
        : 'border-indigo-100 hover:border-indigo-300',
      noteCardNum: isPink
        ? 'bg-pink-50 border-pink-200 text-pink-900'
        : 'bg-indigo-50 border-indigo-200 text-indigo-900',

      // Page 4 Report
      reportTableBorder: isPink
        ? 'border border-[#831843]/70'
        : 'border border-indigo-950/70',
      reportThead: isPink
        ? 'bg-[#831843] text-white font-bold divide-x divide-x-reverse divide-[#9d174d] text-[11px]'
        : 'bg-indigo-950 text-white font-bold divide-x divide-x-reverse divide-indigo-800 text-[11px]',
      reportTheadThText: isPink ? 'text-pink-100' : 'text-indigo-100',
      reportBookName: isPink ? 'text-[#831843]' : 'text-indigo-950',

      // Page 4 Humanities
      humanitiesG10Thead: isPink
        ? 'bg-[#831843] text-white font-bold divide-x divide-x-reverse divide-[#9d174d] text-[11px]'
        : 'bg-indigo-950 text-white font-bold divide-x divide-x-reverse divide-indigo-800 text-[11px]',
      humanitiesG10ThText: isPink ? 'text-pink-100' : 'text-indigo-100',
      humanitiesG11Thead: isPink
        ? 'bg-[#701a75] text-white font-bold divide-x divide-x-reverse divide-[#86198f] text-[11px] border-t-2 border-[#831843]'
        : 'bg-indigo-900 text-white font-bold divide-x divide-x-reverse divide-indigo-800 text-[11px] border-t-2 border-indigo-950',
      humanitiesG11ThText: isPink ? 'text-purple-100' : 'text-purple-100',
      humanitiesG12Thead: isPink
        ? 'bg-[#500724] text-white font-bold divide-x divide-x-reverse divide-[#831843] text-[11px] border-t-2 border-[#831843]'
        : 'bg-indigo-950 text-white font-bold divide-x divide-x-reverse divide-indigo-800 text-[11px] border-t-2 border-indigo-950',
      humanitiesG12ThText: isPink ? 'text-rose-100' : 'text-sky-100',
      humanitiesStatusRow: isPink ? 'bg-rose-50/45' : 'bg-indigo-50/45',
      humanitiesStatusHeader: isPink ? 'bg-rose-100/85 text-rose-950' : 'bg-indigo-100/85 text-indigo-950',
      humanitiesStatusCell: isPink ? 'text-rose-950' : 'text-indigo-950',
      humanitiesG12StatusRow: isPink ? 'bg-pink-50/45' : 'bg-sky-50/40',
      humanitiesG12StatusHeader: isPink ? 'bg-pink-100/85 text-pink-950' : 'bg-sky-100/85 text-sky-950',
      humanitiesG12StatusCell: isPink ? 'text-pink-950' : 'text-sky-950',
      humanitiesFarhangianBorder: isPink ? 'border border-[#701a75]/70' : 'border border-emerald-950/70',
      humanitiesFarhangianThead: isPink
        ? 'bg-[#701a75] text-white font-bold divide-x divide-x-reverse divide-[#86198f] text-[11px]'
        : 'bg-emerald-950 text-white font-bold divide-x divide-x-reverse divide-emerald-800 text-[11px]',
      humanitiesFarhangianThText: isPink ? 'text-fuchsia-100' : 'text-emerald-100',
      humanitiesFarhangianTbodyDivide: isPink ? 'divide-fuchsia-100' : 'divide-emerald-100',
      humanitiesFarhangianRowDivide: isPink ? 'divide-fuchsia-100' : 'divide-emerald-100',
      humanitiesFarhangianStatusRow: isPink ? 'bg-fuchsia-50/60' : 'bg-emerald-50/70',
      humanitiesFarhangianRowAlt: isPink ? 'bg-fuchsia-50/25' : 'bg-emerald-50/30',
      humanitiesFarhangianStatusHeader: isPink ? 'bg-fuchsia-100/90 text-fuchsia-950' : 'bg-emerald-100/90 text-emerald-950',
      humanitiesFarhangianCellActive: isPink ? 'text-fuchsia-950 bg-fuchsia-100/70' : 'text-emerald-950 bg-emerald-100/70',
    };
  }

  function createEmptyBlock() {
    const block = {};
    ALL_PLANNER_DAY_KEYS.forEach(key => {
      block[key] = { topic: '', tests: '' };
    });
    return block;
  }

  // ==========================================
  // مدیریت نسخه‌های ساختار داده (Schema Versioning & Migration)
  // ==========================================
  const isPlainObject = (v) => Boolean(v && typeof v === 'object' && !Array.isArray(v));
  const hasProgressData = (entry) =>
    isPlainObject(entry) && ['status', 'r1', 'r2', 'r3'].some(k => String(entry[k] ?? '').trim() !== '');

  const CURRENT_SCHEMA_VERSION = 1;

  const MIGRATIONS = {
    // ارتقای داده‌های نسخه‌های قدیمی (بدون schemaVersion یا نسخه ۰) به نسخه ۱
    0: (data) => {
      const next = isPlainObject(data) ? JSON.parse(JSON.stringify(data)) : {};
      next.meta = isPlainObject(next.meta) ? { ...next.meta, schemaVersion: 1 } : { schemaVersion: 1 };

      // ۱. استانداردسازی نام دانش‌آموز (تفکیک نام و نام خانوادگی <-> نام کامل)
      if (isPlainObject(next.student)) {
        if (!next.student.fullName && (next.student.firstName || next.student.lastName)) {
          next.student.fullName = \`\${next.student.firstName || ''} \${next.student.lastName || ''}\`.trim();
        }
        if (!next.student.firstName && !next.student.lastName && next.student.fullName && typeof next.student.fullName === 'string') {
          const parts = next.student.fullName.trim().split(/\\s+/);
          next.student.firstName = parts[0] || '';
          next.student.lastName = parts.slice(1).join(' ') || '';
        }
      }

      // ۲. مهاجرت کلیدهای قدیمی فارسی یا دارای فاصله پایانی در ماتریس انسانی به شناسه استاندارد (subj.id)
      if (isPlainObject(next.report) && isPlainObject(next.report.humanitiesProgress)) {
        ['grade10', 'grade11', 'grade12', 'farhangian'].forEach((gradeKey) => {
          const oldGrade = isPlainObject(next.report.humanitiesProgress[gradeKey])
            ? next.report.humanitiesProgress[gradeKey]
            : {};
          const migratedGrade = {};
          (HUMANITIES_SUBJECTS[gradeKey] || []).forEach((subj) => {
            const baseName = subj.name.replace(/\\s*(?:۱۰|۱۱|۱۲|دهم|یازدهم|دوازدهم)\\s*$/, '');
            const trimmedKeys = Object.keys(oldGrade);

            const candidateKeys = [
              subj.id,
              subj.name,
              subj.name + ' ',
              baseName,
              baseName ? baseName + ' ' : null,
            ];
            trimmedKeys.forEach(k => {
              if (k.trim() === subj.name || k.trim() === subj.id || (baseName && k.trim() === baseName)) {
                if (!candidateKeys.includes(k)) {
                  candidateKeys.push(k);
                }
              }
            });

            const candidates = candidateKeys
              .filter(Boolean)
              .map(k => oldGrade[k])
              .filter(isPlainObject);

            const chosen = candidates.find(c => hasProgressData(c)) || candidates[0] || null;

            if (chosen) {
              migratedGrade[subj.id] = {
                status: (chosen.status !== undefined && chosen.status !== null) ? String(chosen.status) : '',
                r1: (chosen.r1 !== undefined && chosen.r1 !== null) ? String(chosen.r1) : '',
                r2: (chosen.r2 !== undefined && chosen.r2 !== null) ? String(chosen.r2) : '',
                r3: (chosen.r3 !== undefined && chosen.r3 !== null) ? String(chosen.r3) : '',
              };
            }
          });
          next.report.humanitiesProgress[gradeKey] = migratedGrade;
        });
      }

      // ۳. حذف فیلدهای منسوخ گزارش
      if (isPlainObject(next.report)) {
        delete next.report.bannerText;
        delete next.report.counselorOverallAnalysis;
        delete next.report.prioritiesForNextCycle;
      }

      return next;
    },
  };

  function migrateState(raw) {
    if (!isPlainObject(raw)) return getInitialState();

    let current = raw;
    let version = Number(current.meta && current.meta.schemaVersion) || 0;

    // هشدار در صورت باز شدن فایل ساخته‌شده با نسخه جدیدتر سامانه
    if (version > CURRENT_SCHEMA_VERSION) {
      if (typeof showToast === 'function') {
        showToast('این فایل با نسخه جدیدتری از سامانه ساخته شده است و ممکن است برخی بخش‌ها نمایش داده نشوند.', 'warning');
      }
      return current;
    }

    while (version < CURRENT_SCHEMA_VERSION) {
      const migrateFn = MIGRATIONS[version];
      if (!migrateFn) break;
      current = migrateFn(current);
      version = Number(current.meta && current.meta.schemaVersion) || (version + 1);
    }

    return current;
  }

  function getInitialState() {
    const rowCount = 6;
    const blocks = [];
    for (let i = 0; i < rowCount; i++) {
      blocks.push(createEmptyBlock());
    }

    return {
      meta: {
        id: \`plan_\${Date.now()}\`,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        academicYear: getDefaultAcademicYear(),
        theme: 'navy',
      },
      student: {
        fullName: '',
        firstName: '',
        lastName: '',
        schoolName: '',
        exams: 'قلم‌چی و ماز',
        phone: '',
        supervisorCounselor: 'دکتر فروتن کیا',
        counselorName: 'دکتر فروتن کیا',
        fieldOfStudy: 'علوم تجربی',
        weeksPassed: '۱',
        timeframe: getDefaultJalaliRange(),
        extraNotes: '۱. مطالعه دقیق کتاب درسی و درسنامه پیش از شروع تست‌زنی الزامی است.\\n۲. تحلیل آزمون‌ها در روزهای جمعه بلافاصله پس از دریافت کارنامه انجام شود.\\n۳. تست‌های نشان‌دار هفته‌های گذشته در روز پنج‌شنبه مرور گردند.',
      },
      planner: {
        rowCount: rowCount, // تعداد پارت‌های مطالعاتی (ستون‌ها) بین ۳ تا ۹
        startDay: 'sat', // روز شروع در جدول برنامه‌ریزی
        dayCount: 7, // تعداد روزهای برنامه (بین ۲ تا ۱۴ روز - پیش‌فرض: ۷ روز)
        hasNightRoutine: false, // تبدیل پارت آخر به روتین شبانه
        blocks: blocks,
      },
      report: {
        humanitiesProgress: getInitialHumanitiesProgress(),
        books: [
          {
            id: 'b1',
            name: 'زیست‌شناسی جامع (خیلی سبز)',
            topicsCovered: 'فصل ۱ و ۲ دوازدهم کامل',
            notes: 'تسلط ۸۰٪، نیازمند مرور شکل‌ها و قیدها',
          },
          {
            id: 'b2',
            name: 'فیزیک دوازدهم (میکرو گاج)',
            topicsCovered: 'حرکت بر خط راست تا انتهای شتاب ثابت',
            notes: 'مسائل نمودار سرعت-زمان نیاز به تست بیشتر دارد',
          },
          {
            id: 'b3',
            name: 'شیمی جامع (مبتکران)',
            topicsCovered: 'ساختار اتم و جدول تناوبی + اسید و باز',
            notes: 'وضعیت تسلط بسیار مطلوب، بازدهی عالی',
          },
          {
            id: 'b4',
            name: 'ریاضیات تجربی (نشر الگو)',
            topicsCovered: 'تابع و معادلات مثلثاتی',
            notes: 'فرمول‌های مثلثاتی مرور شوند',
          },
        ],
      },
    };
  }

  function getSampleState() {
    const sample = {
        "meta": {
            "id": "plan_1794089894761",
            "schemaVersion": 1,
            "updatedAt": "2026-11-10T20:56:36.542Z",
            "academicYear": "۱۴۰۵ - ۱۴۰۶",
            "theme": "navy"
        },
        "student": {
            "fullName": "علیرضا محمدی",
            "firstName": "علیرضا",
            "lastName": "محمدی",
            "schoolName": "شیخ انصاری (تیزهوشان) - دزفول",
            "exams": "قلم‌چی، آکادمی",
            "phone": "09160174812",
            "supervisorCounselor": "دکتر شهروز فروتن کیا",
            "counselorName": "محمد شکیبا",
            "fieldOfStudy": "ادبیات و علوم انسانی",
            "weeksPassed": "1",
            "timeframe": "۱۷ آبان تا ۲۳ آبان",
            "extraNotes": "لطفا گزارش کار خود را هر شب برای مشاور خود ارسال کنید.\\nزدن حاضری صبح فراموش نشود.\\nگزارش هفتگی خود را در روز اتمام برنامه ارسال کنید.\\nتست‌های آموزشی را بلافاصله بعد از مطالعه درس بزنید.\\nدر تست‌های مروری ابتدا تست بزنید و تحلیل کنید، سپس کتاب درسی را مرور کنید.\\nسوالات و ابهامات خود را به مشاور منتقل کنید."
        },
        "planner": {
            "rowCount": 6,
            "startDay": "sun",
            "dayCount": 7,
            "hasNightRoutine": true,
            "blocks": [
                {
                    "sat": {
                        "topic": "عربی",
                        "tests": "فلاح جلسه ۲"
                    },
                    "sun": {
                        "topic": "علوم و فنون",
                        "tests": "جلسه ۱ عطری"
                    },
                    "mon": {
                        "topic": "علوم و فنون",
                        "tests": "مرور ج۱ + ۱۵ تست مروری"
                    },
                    "tue": {
                        "topic": "عربی",
                        "tests": "فلاح جلسه ۱"
                    },
                    "wed": {
                        "topic": "عربی",
                        "tests": "مرور ج۱ + ۱۵ تست مروری"
                    },
                    "thu": {
                        "topic": "علوم و فنون",
                        "tests": "عطری جلسه ۲"
                    },
                    "fri": {
                        "topic": "علوم و فنون",
                        "tests": "مرور ج۲ + ۱۵ تست مروری"
                    }
                },
                {
                    "sat": {
                        "topic": "عربی",
                        "tests": "ادامه جلسه ۲"
                    },
                    "sun": {
                        "topic": "علوم و فنون",
                        "tests": "ادامه جلسه ۱"
                    },
                    "mon": {
                        "topic": "ریاضی",
                        "tests": "کرمی جلسه ۱"
                    },
                    "tue": {
                        "topic": "عربی",
                        "tests": "ادامه جلسه ۱"
                    },
                    "wed": {
                        "topic": "ریاضی",
                        "tests": "مرور ج۱ + ۱۰ تست مروری"
                    },
                    "thu": {
                        "topic": "علوم و فنون",
                        "tests": "ادامه جلسه ۲"
                    },
                    "fri": {
                        "topic": "ریاضی",
                        "tests": "کرمی جلسه ۲"
                    }
                },
                {
                    "sat": {
                        "topic": "جامعه دوازدهم",
                        "tests": "درس ۱ + ۱۵ تست آموزشی"
                    },
                    "sun": {
                        "topic": "جامعه دهم درس ۱",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "mon": {
                        "topic": "منطق درس ۱",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "tue": {
                        "topic": "جامعه دهم درس ۲",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "wed": {
                        "topic": "منطق درس ۱",
                        "tests": "۲۰ تست مروری"
                    },
                    "thu": {
                        "topic": "جامعه دهم مرور ۱و۲",
                        "tests": "۳۰ تست مروری"
                    },
                    "fri": {
                        "topic": "منطق درس ۲",
                        "tests": "۱۵ تست آموزشی"
                    }
                },
                {
                    "sat": {
                        "topic": "تاریخ دوازدهم درس ۱",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "sun": {
                        "topic": "تاریخ دهم درس ۱",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "mon": {
                        "topic": "جغرافیا دهم درس ۱",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "tue": {
                        "topic": "تاریخ دهم درس ۱",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "wed": {
                        "topic": "جغرافیا دهم درس ۱",
                        "tests": "۲۰ تست مروری"
                    },
                    "thu": {
                        "topic": "تاریخ دهم مرور ۱و۲",
                        "tests": "۳۰ تست مروری"
                    },
                    "fri": {
                        "topic": "جغرافیا دهم درس ۲",
                        "tests": "۱۵ تست آموزشی"
                    }
                },
                {
                    "sat": {
                        "topic": "اقتصاد درس ۳",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "sun": {
                        "topic": "اقتصاد درس ۱",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "mon": {
                        "topic": "روانشناسی درس ۱",
                        "tests": "مطالعه درس ۱ تا نیمه"
                    },
                    "tue": {
                        "topic": "اقتصاد درس ۲",
                        "tests": "۱۵ تست آموزشی"
                    },
                    "wed": {
                        "topic": "روانشناسی درس ۱",
                        "tests": "تکمیل ۱ + ۱۵ تست آ"
                    },
                    "thu": {
                        "topic": "اقتصاد مرور ۱و۲",
                        "tests": "۳۰ تست مروری"
                    },
                    "fri": {
                        "topic": "روانشناسی مرور ۱",
                        "tests": "۳۰ تست مروری"
                    }
                },
                {
                    "sat": {
                        "topic": "تست قرابت",
                        "tests": "۵ تست + تحلیل"
                    },
                    "sun": {
                        "topic": "تست قرابت",
                        "tests": "۵ تست + تحلیل"
                    },
                    "mon": {
                        "topic": "لغات عربی",
                        "tests": "درس ۱ دهم"
                    },
                    "tue": {
                        "topic": "تست قرابت",
                        "tests": "۵ تست + تحلیل"
                    },
                    "wed": {
                        "topic": "لغات عربی",
                        "tests": "درس ۲ دهم"
                    },
                    "thu": {
                        "topic": "تست قرابت",
                        "tests": "۵ تست + تحلیل"
                    },
                    "fri": {
                        "topic": "لغات عربی",
                        "tests": "مرور لغات سخت"
                    }
                }
            ]
        },
        "report": {
            "humanitiesProgress": getInitialHumanitiesProgress(),
            "books": [
                {
                    "id": "b1",
                    "name": "زیست‌شناسی جامع (خیلی سبز)",
                    "topicsCovered": "فصل ۱ و ۲ دوازدهم کامل",
                    "notes": "تسلط ۸۰٪، نیازمند مرور شکل‌ها و قیدها"
                },
                {
                    "id": "b2",
                    "name": "فیزیک دوازدهم (میکرو گاج)",
                    "topicsCovered": "حرکت بر خط راست تا انتهای شتاب ثابت",
                    "notes": "مسائل نمودار سرعت-زمان نیاز به تست بیشتر دارد"
                },
                {
                    "id": "b3",
                    "name": "شیمی جامع (مبتکران)",
                    "topicsCovered": "ساختار اتم و جدول تناوبی + اسید و باز",
                    "notes": "وضعیت تسلط بسیار مطلوب، بازدهی عالی"
                },
                {
                    "id": "b4",
                    "name": "ریاضیات تجربی (نشر الگو)",
                    "topicsCovered": "تابع و معادلات مثلثاتی",
                    "notes": "فرمول‌های مثلثاتی مرور شوند"
                }
            ]
        }
    };
    if (sample && sample.planner && Array.isArray(sample.planner.blocks)) {
      sample.planner.blocks.forEach(block => {
        ALL_PLANNER_DAY_KEYS.forEach(key => {
          if (!block[key]) {
            block[key] = { topic: '', tests: '' };
          }
        });
      });
    }
    return sample;
  }

  const STORAGE_KEY_CURRENT = 'forootan_kia_current_plan';
  const STORAGE_KEY_MEASURED_HEIGHTS = 'forootan_kia_measured_heights';
  const STORAGE_KEY_MOBILE_VIEW = 'forootan_kia_mobile_view';
  const STORAGE_KEY_CORRUPT_BACKUP_PREFIX = 'forootan_kia_corrupt_backup_';

  let corruptStorageBackupInfo = null;
  let lastQuotaWarningTime = 0;

  function pruneStorageBackups(keepCount = 2) {
    try {
      const backupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_KEY_CORRUPT_BACKUP_PREFIX)) {
          backupKeys.push(k);
        }
      }
      if (backupKeys.length > keepCount) {
        backupKeys.sort();
        const toRemove = backupKeys.slice(0, backupKeys.length - keepCount);
        toRemove.forEach(k => {
          try { localStorage.removeItem(k); } catch (e) {}
        });
      }
    } catch (e) {}
  }

  function saveCurrentToLocalStorage(state) {
    if (!state) return false;
    try {
      if (state.meta) {
        state.meta.updatedAt = new Date().toISOString();
      }
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY_CURRENT, serialized);
      return true;
    } catch (err) {
      console.warn('خطا در ذخیره‌سازی اولیه محلی:', err);
      // تلاش اول برای جبران خطا: پاکسازی کش موقت ارتفاع‌ها و کاهش بکاپ‌های قدیمی
      try {
        localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS);
        pruneStorageBackups(1);
        const serialized = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY_CURRENT, serialized);
        console.info('پس از آزادسازی حافظه کش موقت، ذخیره‌سازی محلی با موفقیت انجام شد.');
        return true;
      } catch (retryErr) {
        console.error('خطای بحرانی پر شدن حافظه محلی (Quota Exceeded):', retryErr);
        const now = Date.now();
        if (now - lastQuotaWarningTime > 15000) {
          lastQuotaWarningTime = now;
          if (typeof showToast === 'function') {
            showToast('خطای ذخیره‌سازی: حافظه محلی مرورگر پر است! لطفاً از بخش «خروجی JSON» برنامه را ذخیره کنید.', 'error', 8000);
          }
        }
        return false;
      }
    }
  }

  let saveStorageTimeout = null;

  function cancelPendingSave() {
    if (saveStorageTimeout) {
      clearTimeout(saveStorageTimeout);
      saveStorageTimeout = null;
    }
  }

  function debouncedSaveToLocalStorage(state, delay = 400) {
    cancelPendingSave();
    saveStorageTimeout = setTimeout(() => {
      saveStorageTimeout = null;
      saveCurrentToLocalStorage(appState);
    }, delay);
  }

  function flushPendingSave() {
    cancelPendingSave();
    saveCurrentToLocalStorage(appState);
  }

  function loadCurrentFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (!raw || !raw.trim()) return null;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
        throw new Error('محتوای ذخیره‌شده شیء معتبر برنامه نیست.');
      } catch (parseErr) {
        // داده‌ها آسیب‌دیده‌اند - پشتیبان‌گیری اضطراری فوری
        const timestamp = Date.now();
        const backupKey = STORAGE_KEY_CORRUPT_BACKUP_PREFIX + timestamp;
        try {
          localStorage.setItem(backupKey, raw);
        } catch (backupErr) {
          console.warn('امکان ثبت نسخه پشتیبان در localStorage نبود:', backupErr);
        }
        corruptStorageBackupInfo = {
          backupKey,
          rawString: raw,
          errorMessage: parseErr.message,
          timestamp: new Date().toISOString()
        };
        console.error('داده‌های آسیب‌دیده شناسایی شدند و پشتیبان اضطراری ایجاد شد:', corruptStorageBackupInfo);
        return null;
      }
    } catch (err) {
      console.warn('خطا در دسترسی به localStorage:', err);
      return null;
    }
  }

  // ==========================================
  // ۲. اعتبارسنجی (Validation)
  // ==========================================
  function validateState(state) {
    const errors = [];
    const warnings = [];

    if (!state || typeof state !== 'object') {
      return { isValid: false, errors: ['داده‌های برنامه معتبر نیستند.'], warnings: [] };
    }

    const student = state.student || {};
    const fullName = getStudentFullName(student);
    if (!fullName) {
      errors.push('لطفاً «نام و نام خانوادگی دانش‌آموز» را وارد نمایید.');
    }
    if (!student.counselorName || !student.counselorName.trim()) {
      errors.push('لطفاً «نام مشاور» را وارد نمایید.');
    }
    if (!student.supervisorCounselor || !student.supervisorCounselor.trim()) {
      errors.push('لطفاً «مشاور ناظر» را وارد نمایید.');
    }
    if (!student.fieldOfStudy || !student.fieldOfStudy.trim()) {
      errors.push('لطفاً «رشته تحصیلی» را مشخص کنید.');
    }

    const planner = state.planner || {};
    const rowCount = planner.rowCount;
    if (rowCount < 3 || rowCount > 9) {
      errors.push('تعداد پارت‌های مطالعه در روز باید بین ۳ تا ۹ پارت باشد.');
    }

    const dayCount = planner.dayCount || 7;
    if (dayCount < 2 || dayCount > 14) {
      errors.push('تعداد روزهای برنامه باید بین ۲ تا ۱۴ روز باشد.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ==========================================
  // ۳. محاسبات برنامه هفتگی (Planner Calculations)
  // ==========================================
  function setPlannerRowCount(state, newCount) {
    cachedMeasuredHeights = {};
    try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
    const count = Math.min(9, Math.max(3, parseInt(newCount, 10) || 6));
    state.planner.rowCount = count;
    while (state.planner.blocks.length < count) {
      state.planner.blocks.push(createEmptyBlock());
    }
    while (state.planner.blocks.length > count) {
      state.planner.blocks.pop();
    }
    resetPlannerCopying();
  }

  function setPlannerDayCount(state, newDayCount) {
    cachedMeasuredHeights = {};
    try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
    const count = Math.min(14, Math.max(2, parseInt(newDayCount, 10) || 7));
    state.planner.dayCount = count;
    if (Array.isArray(state.planner.blocks)) {
      state.planner.blocks.forEach(block => {
        ALL_PLANNER_DAY_KEYS.forEach(key => {
          if (!block[key]) {
            block[key] = { topic: '', tests: '' };
          }
        });
      });
    }
    resetPlannerCopying();
    saveCurrentToLocalStorage(state);
  }

  function setPlannerStartDay(state, dayKey) {
    cachedMeasuredHeights = {};
    try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
    resetPlannerCopying();

    const valid = DAYS_OF_WEEK.some(d => d.key === dayKey);
    if (!valid || !state || !state.planner) return;

    const oldStartDay = state.planner.startDay || 'sat';
    if (oldStartDay === dayKey) return;

    // نگاشت مجدد تمام ۱۴ جایگاه چرخه به‌گونه‌ای که روزهای پنهان نیز حفظ و به‌درستی جابجا شوند
    const oldAll14 = getOrderedDays(oldStartDay, 14);
    const newAll14 = getOrderedDays(dayKey, 14);

    if (Array.isArray(state.planner.blocks)) {
      state.planner.blocks.forEach(block => {
        const allRowData = oldAll14.map(d => {
          const item = block[d.key];
          return {
            topic: (item && item.topic !== undefined) ? item.topic : '',
            tests: (item && item.tests !== undefined) ? item.tests : ''
          };
        });

        newAll14.forEach((newDay, idx) => {
          block[newDay.key] = allRowData[idx] || { topic: '', tests: '' };
        });
      });
    }

    state.planner.startDay = dayKey;
    saveCurrentToLocalStorage(state);
  }

  function setPlannerNightRoutine(state, enabled) {
    if (state.planner) {
      cachedMeasuredHeights = {};
      try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
      state.planner.hasNightRoutine = Boolean(enabled);
      resetPlannerCopying();
      saveCurrentToLocalStorage(state);
    }
  }

  // ==========================================
  // ۴. مدیریت گزارش وضعیت (Report Logic)
  // ==========================================
  const MAX_REPORT_BOOKS = 30;
  let bookIdCounter = 0;
  function generateUniqueBookId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return 'book_' + crypto.randomUUID();
    }
    return 'book_' + Date.now() + '_' + (++bookIdCounter);
  }

  function addBookToReport(state) {
    if (state.report.books.length >= MAX_REPORT_BOOKS) {
      showToast(\`برای حفظ نظم استاندارد، حداکثر \${toPersianDigits(MAX_REPORT_BOOKS)} منبع مجاز است.\`, 'warning');
      return;
    }
    state.report.books.push({
      id: generateUniqueBookId(),
      name: '',
      topicsCovered: '',
      notes: '',
    });
  }

  function removeBookFromReport(state, bookId) {
    if (state.report.books.length <= 1) {
      showToast('حداقل وجود یک منبع مطالعاتی در گزارش الزامی است.', 'warning');
      return;
    }
    state.report.books = state.report.books.filter(b => b.id !== bookId);
  }

  // ==========================================
  // ۵. کنترلر اصلی واسط کاربری (UI Controller)
  // ==========================================
  let appState = null;
  let activeTab = 'cover';
  let mobileView = 'editor';
  let currentZoom = 0.68;
  let isZoomManuallyLocked = false;
  let cachedMeasuredHeights = {};
  let isCopyMode = false;
  let isMultiSelectMode = false;
  let hasPushedCopyHistory = false;

  function enterCopyMode() {
    if (!isCopyMode) {
      isCopyMode = true;
      isMultiSelectMode = true;
      if (typeof window !== 'undefined' && window.history && typeof window.history.pushState === 'function') {
        try {
          window.history.pushState({ plannerCopyMode: true }, '');
          hasPushedCopyHistory = true;
        } catch (e) {}
      }
    }
  }
  let selectedParts = new Set();
  let lastSelectedCoord = null;
  let partClipboard = null;
  let lastActivePlannerInput = null;
  let lastActiveInputInfo = {
    row: null,
    day: null,
    field: null
  };

  function registerActiveInput(input) {
    if (!input) return;
    lastActivePlannerInput = input;
    const row = input.getAttribute('data-row');
    const day = input.getAttribute('data-day');
    const field = input.getAttribute('data-field');
    if (row !== null && day !== null && field !== null) {
      lastActiveInputInfo = {
        row: parseInt(row, 10),
        day: day,
        field: field
      };
    }
  }

  function getAutoFitZoom() {
    if (typeof window === 'undefined') return 0.68;
    const scrollEl = document.getElementById('pdf-preview-scroll');
    const isDesktop = typeof window.innerWidth === 'number' && window.innerWidth >= 1024;
    const availW = (scrollEl && scrollEl.clientWidth > 0)
      ? scrollEl.clientWidth - (isDesktop ? 48 : 24)
      : Math.max(300, (typeof window.innerWidth === 'number' ? window.innerWidth : 1200) - (isDesktop ? 520 : 24));
    const fit = Math.round((availW / 1122.5) * 100) / 100;
    return Math.max(0.24, Math.min(0.68, fit));
  }

  function setMobileView(view) {
    mobileView = view;
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY_MOBILE_VIEW, view);
      } catch (e) {}
    }
    if (typeof document === 'undefined') return;
    const editor = document.getElementById('editor-panel-wrapper');
    const preview = document.getElementById('preview-panel-wrapper');
    const tabEditor = document.getElementById('mobile-tab-editor');
    const tabPreview = document.getElementById('mobile-tab-preview');

    if (!editor || !preview) return;

    const isMobile = typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024;

    if (isMobile) {
      if (view === 'editor') {
        editor.style.display = 'flex';
        preview.style.display = 'none';

        if (tabEditor && tabPreview) {
          tabEditor.className = 'flex-1 py-2 px-3 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition';
          tabPreview.className = 'flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition';
        }
      } else {
        editor.style.display = 'none';
        preview.style.display = 'flex';

        if (tabEditor && tabPreview) {
          tabEditor.className = 'flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition';
          tabPreview.className = 'flex-1 py-2 px-3 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition';
        }

        if (previewIsDirty || pendingPatchPages.size > 0) {
          renderPreviewPages();
          previewIsDirty = false;
          pendingPatchPages.clear();
        }

        if (!isZoomManuallyLocked) {
          setZoom(getAutoFitZoom());
        }

        // تضمین اندازه‌گیری دقیق و رفع سرریز بر روی انواع گوشی‌ها با رندر گام‌به‌گام
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            if (checkAndFixAllDomOverflow()) {
              setZoom(currentZoom);
            }
          });
        }
        setTimeout(() => {
          if (checkAndFixAllDomOverflow()) {
            setZoom(currentZoom);
          }
        }, 60);
        setTimeout(() => {
          if (checkAndFixAllDomOverflow()) {
            setZoom(currentZoom);
          }
        }, 200);
        setTimeout(() => {
          if (checkAndFixAllDomOverflow()) {
            setZoom(currentZoom);
          }
        }, 500);
      }
    } else {
      editor.style.display = '';
      preview.style.display = '';
    }
  }

  function normalizeState(raw) {
    const defaults = getInitialState();
    if (!isPlainObject(raw)) {
      return defaults;
    }

    const migrated = migrateState(raw);

    const normalized = {
      meta: {
        ...defaults.meta,
        ...(isPlainObject(migrated.meta) ? migrated.meta : {}),
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      student: {
        ...defaults.student,
        ...(isPlainObject(migrated.student) ? migrated.student : {}),
      },
      planner: {
        ...defaults.planner,
        ...(isPlainObject(migrated.planner) ? migrated.planner : {}),
      },
      report: {
        ...defaults.report,
        ...(isPlainObject(migrated.report) ? migrated.report : {}),
      },
    };

    if (isPlainObject(normalized.report)) {
      delete normalized.report.bannerText;
      delete normalized.report.counselorOverallAnalysis;
      delete normalized.report.prioritiesForNextCycle;
    }

    normalized.meta.theme = (isPlainObject(migrated.meta) && migrated.meta.theme === 'pink') ? 'pink' : 'navy';
    normalized.meta.schemaVersion = CURRENT_SCHEMA_VERSION;

    if (!normalized.student.fullName) {
      normalized.student.fullName = getStudentFullName(normalized.student);
    }
    if (normalized.student.fullName && (!normalized.student.firstName && !normalized.student.lastName)) {
      const parts = normalized.student.fullName.trim().split(/\\s+/);
      normalized.student.firstName = parts[0] || '';
      normalized.student.lastName = parts.slice(1).join(' ') || '';
    }

    if (isPlainObject(normalized.student)) {
      const s = normalized.student;
      s.fullName = String(s.fullName ?? '').slice(0, 100);
      s.firstName = String(s.firstName ?? '').slice(0, 50);
      s.lastName = String(s.lastName ?? '').slice(0, 50);
      s.schoolName = String(s.schoolName ?? '').slice(0, 100);
      s.counselorName = String(s.counselorName ?? '').slice(0, 100);
      s.supervisorCounselor = String(s.supervisorCounselor ?? '').slice(0, 100);
      s.fieldOfStudy = String(s.fieldOfStudy ?? '').slice(0, 100);
      s.phone = String(s.phone ?? '').slice(0, 30);
      s.timeframe = String(s.timeframe ?? '').slice(0, 100);
      s.exams = String(s.exams ?? '').slice(0, 100);
      s.weeksPassed = String(s.weeksPassed ?? '').slice(0, 50);
      s.extraNotes = String(s.extraNotes ?? '').slice(0, 15000);
    }

    if (!normalized.planner.startDay) {
      normalized.planner.startDay = 'sat';
    }
    if (normalized.planner.dayCount === undefined || !normalized.planner.dayCount) {
      normalized.planner.dayCount = 7;
    } else {
      normalized.planner.dayCount = Math.max(2, Math.min(14, parseInt(normalized.planner.dayCount, 10) || 7));
    }
    if (normalized.planner.hasNightRoutine === undefined) {
      normalized.planner.hasNightRoutine = false;
    }

    if (!Array.isArray(normalized.planner.blocks) || normalized.planner.blocks.length === 0) {
      normalized.planner.blocks = defaults.planner.blocks;
    } else {
      normalized.planner.blocks = normalized.planner.blocks.map(block => {
        const cleanBlock = {};
        ALL_PLANNER_DAY_KEYS.forEach(day => {
          cleanBlock[day] = {
            topic: (block && block[day] && block[day].topic !== undefined && block[day].topic !== null) ? String(block[day].topic).slice(0, 500) : '',
            tests: (block && block[day] && block[day].tests !== undefined && block[day].tests !== null) ? String(block[day].tests).slice(0, 200) : '',
          };
        });
        return cleanBlock;
      });
    }

    const targetRowCount = Math.max(
      3,
      Math.min(
        9,
        parseInt(raw.planner && raw.planner.rowCount, 10) || normalized.planner.blocks.length || 6
      )
    );
    normalized.planner.rowCount = targetRowCount;

    while (normalized.planner.blocks.length < targetRowCount) {
      normalized.planner.blocks.push(createEmptyBlock());
    }
    while (normalized.planner.blocks.length > targetRowCount) {
      normalized.planner.blocks.pop();
    }

    const seenBookIds = new Set();
    const normalizeBook = (b) => {
      const isObj = isPlainObject(b);
      let bookId = (isObj && b.id !== undefined && b.id !== null) ? String(b.id).trim() : '';
      if (!bookId || seenBookIds.has(bookId)) {
        bookId = generateUniqueBookId();
      }
      seenBookIds.add(bookId);

      return {
        id: bookId,
        name: (isObj && b.name !== undefined && b.name !== null) ? String(b.name).slice(0, 200) : '',
        topicsCovered: (isObj && b.topicsCovered !== undefined && b.topicsCovered !== null) ? String(b.topicsCovered).slice(0, 1000) : '',
        notes: (isObj && b.notes !== undefined && b.notes !== null) ? String(b.notes).slice(0, 500) : '',
      };
    };

    if (!Array.isArray(normalized.report.books) || normalized.report.books.length === 0) {
      normalized.report.books = defaults.report.books.map(normalizeBook);
    } else {
      normalized.report.books = normalized.report.books.slice(0, MAX_REPORT_BOOKS).map(normalizeBook);
    }

    const defaultHum = getInitialHumanitiesProgress();
    if (!isPlainObject(normalized.report.humanitiesProgress)) {
      normalized.report.humanitiesProgress = defaultHum;
    } else {
      ['grade10', 'grade11', 'grade12', 'farhangian'].forEach(gradeKey => {
        const gradeObj = normalized.report.humanitiesProgress[gradeKey];
        if (!isPlainObject(gradeObj)) {
          normalized.report.humanitiesProgress[gradeKey] = defaultHum[gradeKey] || {};
        } else {
          const cleanGrade = {};
          const subjects = HUMANITIES_SUBJECTS[gradeKey] || [];
          subjects.forEach(subj => {
            const baseName = subj.name.replace(/\\s*(?:۱۰|۱۱|۱۲|دهم|یازدهم|دوازدهم)\\s*$/, '');
            const trimmedKeys = Object.keys(gradeObj);

            const candidateKeys = [
              subj.id,
              subj.name,
              subj.name + ' ',
              baseName,
              baseName ? baseName + ' ' : null,
            ];
            trimmedKeys.forEach(k => {
              if (k.trim() === subj.name || k.trim() === subj.id || (baseName && k.trim() === baseName)) {
                if (!candidateKeys.includes(k)) {
                  candidateKeys.push(k);
                }
              }
            });

            const candidates = candidateKeys
              .filter(Boolean)
              .map(k => gradeObj[k])
              .filter(isPlainObject);

            const chosen = candidates.find(c => hasProgressData(c)) || candidates[0] || {};

            cleanGrade[subj.id] = {
              status: (chosen.status !== undefined && chosen.status !== null) ? String(chosen.status).slice(0, 200) : '',
              r1: (chosen.r1 !== undefined && chosen.r1 !== null) ? String(chosen.r1).slice(0, 200) : '',
              r2: (chosen.r2 !== undefined && chosen.r2 !== null) ? String(chosen.r2).slice(0, 200) : '',
              r3: (chosen.r3 !== undefined && chosen.r3 !== null) ? String(chosen.r3).slice(0, 200) : '',
            };
          });
          normalized.report.humanitiesProgress[gradeKey] = cleanGrade;
        }
      });
    }

    resetStudentBudgets();
    resetReportBudgets();

    return normalized;
  }

  function initApp() {
    try {
      try {
        const savedHeights = localStorage.getItem(STORAGE_KEY_MEASURED_HEIGHTS);
        if (savedHeights) {
          cachedMeasuredHeights = JSON.parse(savedHeights) || {};
        }
      } catch (e) {}

      const saved = loadCurrentFromLocalStorage();
      const hadCorruptData = Boolean(corruptStorageBackupInfo);
      if (hadCorruptData) {
        appState = getInitialState();
      } else {
        appState = normalizeState(saved || getSampleState());
      }

      bindGlobalEvents();
      switchTab('cover');
      renderAll();

      if (hadCorruptData && corruptStorageBackupInfo) {
        const backupData = corruptStorageBackupInfo;
        showConfirmModal({
          title: 'هشدار: آسیب‌دیدگی اطلاعات ذخیره‌شده قبلی',
          message: 'اطلاعات ذخیره‌شده قبلی در مرورگر به دلیل نقص ساختاری قابل بازیابی نبود.',
          subMessage: 'یک نسخه پشتیبان اضطراری از داده‌های خام ذخیره شد. برای جلوگیری از دست رفتن اطلاعات، می‌توانید محتوای خام را دریافت کنید.',
          subMessageType: 'danger',
          confirmText: 'دانلود فایل خام پشتیبان',
          cancelText: 'متوجه شدم (شروع برنامه خام)',
          type: 'danger',
          icon: '⚠️',
          onConfirm: () => {
            try {
              const blob = new Blob(['\\uFEFF' + backupData.rawString], { type: 'text/plain;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = \`emergency_corrupt_backup_\${Date.now()}.txt\`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              showToast('فایل پشتیبان اضطراری با موفقیت ذخیره شد.', 'success');
            } catch (err) {
              showToast('خطا در دانلود فایل: ' + err.message, 'error');
            }
          }
        });
      }

      // اطمینان از تنظیم فاوآیکون رسمی برنامه
      try {
        let favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel~="icon"]');
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          favicon.type = 'image/png';
          document.head.appendChild(favicon);
        }
      } catch (e) {}

      const initialZoom = getAutoFitZoom();
      isZoomManuallyLocked = false;
      setZoom(initialZoom);

      if (typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024) {
        const savedMobileView = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEY_MOBILE_VIEW)) || 'editor';
        setMobileView(savedMobileView);
      }

      // اطمینان از تنظیم دقیق ابعاد و چندصفحه‌ای بودن پس از بارگذاری کامل فونت‌های فارسی وب
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (checkAndFixAllDomOverflow()) {
            setZoom(currentZoom);
          }
        });
      }
      setTimeout(() => {
        if (checkAndFixAllDomOverflow()) {
          setZoom(currentZoom);
        }
      }, 150);
    } catch (e) {
      console.error('Error during initApp:', e);
      try {
        appState = normalizeState(getSampleState());
        renderEditorPanel();
        renderPreviewPages();
      } catch (err2) {
        console.error('Fallback render error:', err2);
      }
    }
  }

  function bindGlobalEvents() {
    document.getElementById('btn-new-plan')?.addEventListener('click', handleNewPlan);
    document.getElementById('btn-load-sample')?.addEventListener('click', handleLoadSample);
    document.getElementById('btn-export-json')?.addEventListener('click', handleExportJson);
    document.getElementById('btn-import-json')?.addEventListener('click', () => {
      document.getElementById('file-input-json')?.click();
    });
    document.getElementById('file-input-json')?.addEventListener('change', handleImportJson);

    // دکمه چاپ و ذخیره PDF
    document.getElementById('btn-print-pdf')?.addEventListener('click', handlePrintPdf);

    // کنترل زوم
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      isZoomManuallyLocked = true;
      zoomCenter(0.05);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      isZoomManuallyLocked = true;
      zoomCenter(-0.05);
    });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      isZoomManuallyLocked = false;
      zoomCenter(getAutoFitZoom(), true);
    });

    // زوم لمسی (Pinch-to-zoom) در صفحات لمسی
    setupPinchZoom();

    // سوییچ حالت در موبایل
    document.getElementById('mobile-tab-editor')?.addEventListener('click', () => setMobileView('editor'));
    document.getElementById('mobile-tab-preview')?.addEventListener('click', () => setMobileView('preview'));

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handleResizeOrOrientation = () => {
        const isDesktop = typeof window.innerWidth === 'number' && window.innerWidth >= 1024;
        if (isDesktop) {
          const editor = document.getElementById('editor-panel-wrapper');
          const preview = document.getElementById('preview-panel-wrapper');
          if (editor) editor.style.display = '';
          if (preview) preview.style.display = '';
          if (previewIsDirty || pendingPatchPages.size > 0) {
            renderPreviewPages();
            previewIsDirty = false;
            pendingPatchPages.clear();
          }
          if (!isZoomManuallyLocked) {
            setZoom(getAutoFitZoom());
          }
        } else {
          setMobileView(mobileView);
          if (!isZoomManuallyLocked) {
            setZoom(getAutoFitZoom());
          }
        }
      };

      window.addEventListener('resize', handleResizeOrOrientation);
      window.addEventListener('orientationchange', () => {
        setTimeout(handleResizeOrOrientation, 100);
      });

      // ذخیره فوری در هنگام خروج، تغییر تب یا معلق شدن مرورگر (پشتیبانی کامل موبایل)
      const handleLifecycleFlush = () => {
        flushPendingSave();
      };

      window.addEventListener('beforeunload', handleLifecycleFlush);
      window.addEventListener('pagehide', handleLifecycleFlush);
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            flushPendingSave();
          }
        });
      }

      // همگام‌سازی بلادرنگ بین چند تب باز در مرورگر (Cross-Tab Synchronization)
      window.addEventListener('storage', (e) => {
        if (e.key !== STORAGE_KEY_CURRENT || !e.newValue) return;
        try {
          cancelPendingSave();
          const remoteData = JSON.parse(e.newValue);
          if (!remoteData || typeof remoteData !== 'object') return;

          const localUpdated = appState?.meta?.updatedAt || '';
          const remoteUpdated = remoteData?.meta?.updatedAt || '';
          if (remoteUpdated && remoteUpdated === localUpdated) return;

          resetPlannerCopying();
          resetStudentBudgets();
          resetReportBudgets();
          cachedMeasuredHeights = {};
          try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
          appState = normalizeState(remoteData);
          renderEditorPanel(true);
          renderPreviewPages();
          showToast('برنامه با تغییرات اعمال‌شده در تب دیگر همگام شد.', 'info', 3000);
        } catch (err) {
          console.warn('خطا در همگام‌سازی بین تب‌ها:', err);
        }
      });

      // خروج از حالت کپی با فشردن کلید Escape (Escape key listener to exit copy mode)
      window.addEventListener('keydown', (e) => {
        // رهگیری میانبر چاپ مرورگر (Ctrl+P / Cmd+P) و هدایت مستقیم به handlePrintPdf
        if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
          e.preventDefault();
          handlePrintPdf();
          return;
        }

        if (e.key === 'Escape') {
          const hasOpenModal = document.querySelector('#app-confirm-modal-overlay');
          if (hasOpenModal) return;

          if (isCopyMode || isMultiSelectMode) {
            e.preventDefault();
            resetPlannerCopying();
            showToast('حالت کپی لغو شد.', 'info', 2000);
          }
        }
      });

      // خروج از حالت کپی در صورت لمس دکمه یا ژست بازگشت در موبایل (Back gesture / Back button on mobile)
      window.addEventListener('popstate', (e) => {
        if (isCopyMode || isMultiSelectMode) {
          hasPushedCopyHistory = false;
          resetPlannerCopying();
          showToast('حالت کپی لغو شد.', 'info', 2000);
        }

        // بازگردانی محتوای کپی‌شده با میانبر Ctrl+Z / Cmd+Z
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
          const activeEl = document.activeElement;
          const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
          if (!isInputFocused && lastPastedUndoAction && !isCopyMode) {
            e.preventDefault();
            undoPastedContent();
          }
        }
      });
    }

    // تب‌ها
    document.querySelectorAll('.editor-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // ناوبری به صفحات با اسکرول هماهنگ با مقیاس زوم
    document.querySelectorAll('.page-jump-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pageId = btn.getAttribute('data-page-target') || e.currentTarget?.getAttribute('data-page-target');
        jumpToPreviewPage(pageId);
      });
    });
  }

  function zoomAtPoint(focalClientX, focalClientY, newZoom) {
    const previewScroll = document.getElementById('pdf-preview-scroll');
    const previewContainer = document.getElementById('pdf-preview-container');
    const pagesWrapper = document.getElementById('pdf-pages-wrapper');
    if (!previewScroll || !previewContainer || !pagesWrapper) {
      setZoom(newZoom);
      return;
    }

    const clampedZoom = Math.min(1.4, Math.max(0.20, Math.round(newZoom * 100) / 100));
    if (Math.abs(clampedZoom - currentZoom) < 0.001) return;

    // موقعیت نقطه کانونی نسبت به کانتینر اسکرول و برگه
    const scRect = previewScroll.getBoundingClientRect();
    const pcRect = previewContainer.getBoundingClientRect();
    const focalViewportX = focalClientX - scRect.left;
    const focalViewportY = focalClientY - scRect.top;

    // مختصات نقطه روی سند مقیاس‌بندی‌نشده در لحظه قبل از تغییر مقیاس
    const unscaledX = currentZoom > 0 ? (focalClientX - pcRect.left) / currentZoom : 0;
    const unscaledY = currentZoom > 0 ? (focalClientY - pcRect.top) / currentZoom : 0;

    // غیرفعال‌سازی موقت انیمیشن و ترنزیشن
    pagesWrapper.style.transition = 'none';
    previewScroll.style.scrollBehavior = 'auto';

    // اعمال مقیاس جدید
    setZoom(clampedZoom);

    // محاسبه دقیق موقعیت اسکرول با احتساب پدینگ محفظه اسکرول
    const cs = window.getComputedStyle(previewScroll);
    const padL = parseFloat(cs.paddingLeft) || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const padT = parseFloat(cs.paddingTop) || 0;
    const padB = parseFloat(cs.paddingBottom) || 0;
    const availableW = Math.max(0, previewScroll.clientWidth - padL - padR);
    const availableH = Math.max(0, previewScroll.clientHeight - padT - padB);

    const totalWidth = Math.round(1122.5 * currentZoom);
    const pageCount = (pagesWrapper && pagesWrapper.querySelectorAll && pagesWrapper.querySelectorAll('.a4-page').length) || 4;
    const isMobile = typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024;
    const pageGap = isMobile ? 20 : 40;
    const totalHeight = Math.round((pageCount * 794 + (pageCount - 1) * pageGap) * currentZoom);

    if (totalWidth > availableW) {
      previewScroll.scrollLeft = padL + (unscaledX * currentZoom) - focalViewportX;
    } else {
      previewScroll.scrollLeft = 0;
    }

    if (totalHeight > availableH) {
      previewScroll.scrollTop = padT + (unscaledY * currentZoom) - focalViewportY;
    } else {
      previewScroll.scrollTop = 0;
    }

    // بازگردانی ترنزیشن در فریم بعدی جهت جلوگیری از غیرفعال ماندن دائمی انیمیشن
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        pagesWrapper.style.transition = '';
        previewScroll.style.scrollBehavior = '';
      });
    } else {
      pagesWrapper.style.transition = '';
      previewScroll.style.scrollBehavior = '';
    }
  }

  function zoomCenter(deltaOrTarget, isAbsolute = false) {
    const previewScroll = document.getElementById('pdf-preview-scroll');
    const targetZoom = isAbsolute ? deltaOrTarget : currentZoom + deltaOrTarget;
    if (!previewScroll) {
      setZoom(targetZoom);
      return;
    }
    const rect = previewScroll.getBoundingClientRect();
    zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, targetZoom);
  }

  function updateZoom(delta) {
    isZoomManuallyLocked = true;
    zoomCenter(delta, false);
  }

  function setZoom(val) {
    currentZoom = Math.round(val * 100) / 100;
    const container = document.getElementById('pdf-pages-wrapper');
    const parent = document.getElementById('pdf-preview-container');
    const isMobile = typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024;
    const pageCount = (container && typeof container.querySelectorAll === 'function' && container.querySelectorAll('.a4-page').length) || 4;
    const pageGap = isMobile ? 20 : 40;
    const unscaledHeight = pageCount * 794 + (pageCount - 1) * pageGap;

    if (container) {
      container.style.width = '1122.5px';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.transform = \`scale(\${currentZoom})\`;
      container.style.transformOrigin = 'top left';

      if (parent) {
        parent.style.width = \`\${Math.round(1122.5 * currentZoom)}px\`;
        parent.style.height = \`\${Math.round(unscaledHeight * currentZoom)}px\`;
        parent.style.position = 'relative';
        parent.style.margin = isMobile ? '0 auto 6rem auto' : '0 auto 3rem auto';
        parent.style.flexShrink = '0';
      }
    }
    const zoomText = document.getElementById('zoom-percentage');
    if (zoomText) {
      zoomText.textContent = \`\${toPersianDigits(Math.round(currentZoom * 100))}٪\`;
    }
  }

  function setupPinchZoom() {
    const previewScroll = document.getElementById('pdf-preview-scroll');
    const previewContainer = document.getElementById('pdf-preview-container');
    const pagesWrapper = document.getElementById('pdf-pages-wrapper');
    if (!previewScroll || !previewContainer) return;

    let isPinching = false;
    let pinchStartDist = 0;
    let pinchStartZoom = currentZoom;
    let pinchUnscaledX = 0;
    let pinchUnscaledY = 0;

    function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    function getMidpoint(touches) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    }

    function startPinch(e) {
      if (!e.touches || e.touches.length !== 2) return;
      isPinching = true;
      pinchStartDist = getDistance(e.touches);
      pinchStartZoom = currentZoom;

      const mid = getMidpoint(e.touches);
      const pcRect = previewContainer.getBoundingClientRect();
      pinchUnscaledX = currentZoom > 0 ? (mid.x - pcRect.left) / currentZoom : 0;
      pinchUnscaledY = currentZoom > 0 ? (mid.y - pcRect.top) / currentZoom : 0;

      if (pagesWrapper) pagesWrapper.style.transition = 'none';
      previewScroll.style.scrollBehavior = 'auto';
      if (e.cancelable) e.preventDefault();
    }

    previewScroll.addEventListener('touchstart', startPinch, { passive: false });

    previewScroll.addEventListener('touchmove', (e) => {
      if (!e.touches) return;
      if (!isPinching && e.touches.length === 2) {
        startPinch(e);
      }
      if (isPinching && e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        const curDist = getDistance(e.touches);
        if (pinchStartDist > 10) {
          isZoomManuallyLocked = true;
          const scale = curDist / pinchStartDist;
          const targetZoom = Math.min(1.4, Math.max(0.20, Math.round(pinchStartZoom * scale * 100) / 100));
          const mid = getMidpoint(e.touches);

          // اعمال مقیاس جدید و حفظ دقیق نقطه اولیه زیر مکان انگشتان (Zoom + Pan همزمان بدون لغزش)
          if (pagesWrapper) pagesWrapper.style.transition = 'none';
          previewScroll.style.scrollBehavior = 'auto';
          setZoom(targetZoom);

          const cs = window.getComputedStyle(previewScroll);
          const padL = parseFloat(cs.paddingLeft) || 0;
          const padR = parseFloat(cs.paddingRight) || 0;
          const padT = parseFloat(cs.paddingTop) || 0;
          const padB = parseFloat(cs.paddingBottom) || 0;
          const availableW = Math.max(0, previewScroll.clientWidth - padL - padR);
          const availableH = Math.max(0, previewScroll.clientHeight - padT - padB);

          const scRect = previewScroll.getBoundingClientRect();
          const focalViewportX = mid.x - scRect.left;
          const focalViewportY = mid.y - scRect.top;

          const totalWidth = Math.round(1122.5 * currentZoom);
          const pageCount = (pagesWrapper && pagesWrapper.querySelectorAll && pagesWrapper.querySelectorAll('.a4-page').length) || 4;
          const isMobile = typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024;
          const pageGap = isMobile ? 20 : 40;
          const totalHeight = Math.round((pageCount * 794 + (pageCount - 1) * pageGap) * currentZoom);

          if (totalWidth > availableW) {
            previewScroll.scrollLeft = padL + (pinchUnscaledX * currentZoom) - focalViewportX;
          } else {
            previewScroll.scrollLeft = 0;
          }

          if (totalHeight > availableH) {
            previewScroll.scrollTop = padT + (pinchUnscaledY * currentZoom) - focalViewportY;
          } else {
            previewScroll.scrollTop = 0;
          }
        }
      } else if (isPinching && e.touches.length !== 2) {
        endPinch();
      }
    }, { passive: false });

    function endPinch() {
      if (isPinching) {
        isPinching = false;
        pinchStartDist = 0;
        if (pagesWrapper) pagesWrapper.style.transition = '';
        previewScroll.style.scrollBehavior = '';
      }
    }

    previewScroll.addEventListener('touchend', (e) => {
      if (e.touches && e.touches.length < 2) endPinch();
    });
    previewScroll.addEventListener('touchcancel', endPinch);

    if (typeof window !== 'undefined') {
      window.addEventListener('touchend', (e) => {
        if (isPinching && e.touches && e.touches.length < 2) endPinch();
      });
      window.addEventListener('touchcancel', () => {
        if (isPinching) endPinch();
      });
    }

    // پشتیبانی تکمیلی از زوم با ژست‌های حرکتی ترک‌پد (Touchpad gestures / Ctrl + Wheel) متمرکز بر مکان کرسر
    let wheelZoomTimer = null;
    previewScroll.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        isZoomManuallyLocked = true;
        const delta = -e.deltaY * 0.002;
        zoomAtPoint(e.clientX, e.clientY, currentZoom + delta);

        if (wheelZoomTimer) clearTimeout(wheelZoomTimer);
        wheelZoomTimer = setTimeout(() => {
          if (pagesWrapper) pagesWrapper.style.transition = '';
          previewScroll.style.scrollBehavior = '';
        }, 150);
      }
    }, { passive: false });

    // مهار رویدادهای ناسازگار ژست در سافاری iOS جهت استفاده از ژست استاندارد لمسی
    previewScroll.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    }, { passive: false });
    previewScroll.addEventListener('gesturechange', (e) => {
      e.preventDefault();
    }, { passive: false });
    previewScroll.addEventListener('gestureend', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  function switchTab(tabName) {
    flushPendingSave();
    activeTab = tabName;
    const tabThemeClasses = {
      cover: ['bg-blue-600', 'text-white', 'shadow-xs', 'font-bold'],
      planner: ['bg-purple-600', 'text-white', 'shadow-xs', 'font-bold'],
      student: ['bg-emerald-600', 'text-white', 'shadow-xs', 'font-bold'],
      report: ['bg-amber-500', 'text-slate-950', 'font-bold', 'shadow-xs'],
    };

    const allActiveClasses = [
      'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-500',
      'bg-indigo-700', 'bg-gradient-to-r', 'from-blue-600', 'to-indigo-600',
      'from-purple-600', 'to-violet-600', 'from-emerald-600', 'to-teal-600',
      'from-amber-500', 'to-orange-500', 'text-white', 'text-slate-950', 'shadow-sm', 'shadow-xs', 'font-bold'
    ];

    document.querySelectorAll('.editor-tab-btn').forEach(btn => {
      const btnTab = btn.getAttribute('data-tab');
      const isCurrent = btnTab === tabName;
      btn.classList.remove(...allActiveClasses);
      if (isCurrent) {
        const theme = tabThemeClasses[btnTab] || tabThemeClasses.cover;
        btn.classList.add(...theme);
        btn.classList.remove('text-slate-600', 'hover:bg-slate-200');
      } else {
        btn.classList.add('text-slate-600', 'hover:bg-slate-200');
      }
    });
    if (tabName !== 'planner' && (isCopyMode || isMultiSelectMode)) {
      resetPlannerCopying();
    }
    renderEditorPanel();

    if (previewIsDirty || pendingPatchPages.size > 0) {
      renderPreviewPages();
      previewIsDirty = false;
      pendingPatchPages.clear();
    } else if (tabName) {
      patchPreviewPage(tabName);
    }

    // اسکرول نرم پیش‌نمایش به صفحه مرتبط با تب انتخابی
    const tabToPage = {
      cover: 'pdf-page-1',
      planner: 'pdf-page-2',
      student: 'pdf-page-3',
      report: 'pdf-page-4'
    };
    if (tabToPage[tabName]) {
      if (typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth >= 1024) {
        jumpToPreviewPage(tabToPage[tabName]);
      }
    }
  }

  function jumpToPreviewPage(targetId) {
    if (!targetId) return;

    if (typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024) {
      setMobileView('preview');
    }

    const executeJump = () => {
      const scrollContainer = document.getElementById('pdf-preview-scroll');
      if (!scrollContainer) return;

      if (targetId === 'all' || targetId === 'pdf-page-1') {
        try {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
          scrollContainer.scrollTop = 0;
        }
        return;
      }

      const pageElem = document.getElementById(targetId);
      if (!pageElem) return;

      if (typeof pageElem.getBoundingClientRect === 'function' && typeof scrollContainer.getBoundingClientRect === 'function') {
        const containerRect = scrollContainer.getBoundingClientRect();
        const pageRect = pageElem.getBoundingClientRect();
        const targetTop = Math.max(0, Math.round(pageRect.top - containerRect.top + (scrollContainer.scrollTop || 0) - 8));

        try {
          scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
        } catch (e) {
          scrollContainer.scrollTop = targetTop;
        }
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setTimeout(executeJump, 25));
    } else {
      setTimeout(executeJump, 25);
    }
  }

  function renderAll() {
    resetStudentBudgets();
    resetReportBudgets();
    resetPlannerCopying();
    renderEditorPanel();
    renderPreviewPages();
    saveCurrentToLocalStorage(appState);
  }

  let renderedTab = null;

  function renderEditorPanel(preserveScroll = true) {
    const panel = document.getElementById('editor-content-panel');
    if (!panel) return;

    // ثبت دقیق موقعیت اسکرول‌های عمودی و افقی پنل و کانتینرهای درونی جدول پیش از بازسازی DOM
    const sameTab = (renderedTab === activeTab);
    const shouldPreserve = preserveScroll && sameTab;

    let prevPanelScrollTop = 0;
    let prevPanelScrollLeft = 0;
    const innerScrolls = [];

    if (shouldPreserve) {
      prevPanelScrollTop = panel.scrollTop;
      prevPanelScrollLeft = panel.scrollLeft;

      const scrollables = panel.querySelectorAll('.overflow-x-auto, .overflow-y-auto, .overflow-auto');
      scrollables.forEach((el, idx) => {
        if (el.scrollLeft !== 0 || el.scrollTop !== 0) {
          innerScrolls.push({
            index: idx,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop
          });
        }
      });
    }

    renderedTab = activeTab;

    switch (activeTab) {
      case 'cover':
        panel.innerHTML = renderCoverEditorHtml();
        bindCoverEditorEvents();
        break;
      case 'planner':
        panel.innerHTML = renderPlannerEditorHtml();
        bindPlannerEditorEvents();
        break;
      case 'student':
        panel.innerHTML = renderStudentEditorHtml();
        bindStudentEditorEvents();
        break;
      case 'report':
        panel.innerHTML = renderReportEditorHtml();
        bindReportEditorEvents();
        break;
      default:
        panel.innerHTML = renderCoverEditorHtml();
    }

    // بازگردانی بی‌درنگ موقعیت اسکرول‌ها پس از درج HTML جدید
    if (shouldPreserve) {
      panel.scrollTop = prevPanelScrollTop;
      panel.scrollLeft = prevPanelScrollLeft;

      const restoreInner = () => {
        if (innerScrolls.length > 0) {
          const newScrollables = panel.querySelectorAll('.overflow-x-auto, .overflow-y-auto, .overflow-auto');
          innerScrolls.forEach(item => {
            if (newScrollables[item.index]) {
              newScrollables[item.index].scrollLeft = item.scrollLeft;
              newScrollables[item.index].scrollTop = item.scrollTop;
            }
          });
        }
      };

      restoreInner();
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          panel.scrollTop = prevPanelScrollTop;
          panel.scrollLeft = prevPanelScrollLeft;
          restoreInner();
        });
      }
    }
  }

  // ==================== فرم صفحه ۱: جلد ====================
  function renderCoverEditorHtml() {
    const currentTheme = (appState.meta && appState.meta.theme === 'pink') ? 'pink' : 'navy';

    return \`
      <div class="space-y-5">
        <div class="p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed flex items-center gap-2.5 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
          <span>
            اطلاعات درج‌شده روی جلد (نام، رشته، مشاور، مدرسه، هفته و بازه زمانی) از تب <strong>«مشخصات»</strong> بارگذاری و همگام‌سازی می‌شوند.
          </span>
        </div>

        <!-- انتخاب تم رنگی قالب پی‌دی‌اف -->
        <div class="space-y-2">
          <label class="block font-bold text-slate-700 text-xs">تم رنگی قالب پی‌دی‌اف:</label>
          <div class="grid grid-cols-2 gap-3">
            <!-- گزینه ۱: سرمه‌ای -->
            <button 
              type="button" 
              class="theme-picker-btn relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center \${currentTheme === 'navy' ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}"
              data-theme="navy"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#020617] via-[#0b1a3d] to-[#1c1236] border border-amber-400 shadow-2xs shrink-0 inline-block"></span>
                <span class="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0 inline-block"></span>
              </div>
              <div class="font-bold text-xs text-slate-800">سرمه‌ای (کلاسیک)</div>
              \${currentTheme === 'navy' ? '<span class="absolute top-2 left-2 text-indigo-600 font-bold text-xs">✓</span>' : ''}
            </button>

            <!-- گزینه ۲: صورتی و سرخابی -->
            <button 
              type="button" 
              class="theme-picker-btn relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center \${currentTheme === 'pink' ? 'border-pink-600 bg-pink-50/70 shadow-sm ring-2 ring-pink-500/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}"
              data-theme="pink"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <span class="w-5 h-5 rounded-full bg-[#341228] border border-pink-400 shadow-2xs shrink-0 inline-block"></span>
                <span class="w-3.5 h-3.5 rounded-full bg-pink-400 shrink-0 inline-block"></span>
              </div>
              <div class="font-bold text-xs text-slate-800">صورتی و سرخابی</div>
              \${currentTheme === 'pink' ? '<span class="absolute top-2 left-2 text-pink-600 font-bold text-xs">✓</span>' : ''}
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label for="cover-academic-year-input" class="block font-bold text-slate-700 text-xs mb-1">سال تحصیلی دانش‌آموز:</label>
            <input 
              type="text" 
              id="cover-academic-year-input" 
              value="\${sanitizeHtml(appState.meta.academicYear)}" 
              placeholder="مثال: ۱۴۰۵ - ۱۴۰۶" 
              class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-bold text-indigo-950" 
            />
          </div>
        </div>
      </div>
    \`;
  }

  function bindCoverEditorEvents() {
    const yearInput = document.getElementById('cover-academic-year-input');
    if (yearInput) {
      yearInput.addEventListener('input', (e) => {
        const persian = toPersianDigits(e.target.value);
        if (e.target.value !== persian) {
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          e.target.value = persian;
          if (start !== null && end !== null) {
            e.target.setSelectionRange(start, end);
          }
        }
        appState.meta.academicYear = persian;
        requestPagePatch('cover');
        debouncedSaveToLocalStorage(appState);
      });
    }

    const themeButtons = document.querySelectorAll('.theme-picker-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme') || 'navy';
        if (appState.meta.theme !== selectedTheme) {
          appState.meta.theme = selectedTheme;
          saveCurrentToLocalStorage(appState);
          renderEditorPanel();
          renderPreviewPages();
          showToast(selectedTheme === 'pink' ? 'تم صورتی و سرخابی فعال شد.' : 'تم سرمه‌ای (کلاسیک) فعال شد.', 'info');
        }
      });
    });
  }

  // ==================== توابع مدیریت حافظه موقت (Clipboard)، انتخاب چندگانه و تاریخچه تغییرات پارت‌ها ====================
  function makePartKey(dayKey, r) {
    return dayKey + ':' + r;
  }

  function parsePartKey(key) {
    const parts = String(key).split(':');
    return {
      dayKey: parts[0],
      r: parseInt(parts[1], 10) || 0
    };
  }

  function getDayLabel(dayKey) {
    if (!dayKey) return '';
    if (typeof appState !== 'undefined' && appState.planner) {
      const ordered = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
      const found = ordered.find(d => d.key === dayKey);
      if (found && found.label) return found.label;
    }
    const isWeek2 = String(dayKey).endsWith('_2');
    const baseKey = String(dayKey).replace(/_2$/, '');
    const baseDay = DAYS_OF_WEEK.find(d => d.key === baseKey);
    if (!baseDay) return String(dayKey);
    return baseDay.label;
  }

  function refreshPlannerEditorPreservingScroll() {
    if (activeTab === 'planner') {
      renderEditorPanel(true);
    }
  }

  function getSelectedPartsPayload() {
    if (selectedParts.size === 0) return [];
    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
    const rowCount = appState.planner.rowCount;

    const list = [];
    let minDayIdx = Infinity;
    let minRowIdx = Infinity;

    orderedDays.forEach((d, dayIdx) => {
      for (let r = 0; r < rowCount; r++) {
        const key = makePartKey(d.key, r);
        if (selectedParts.has(key)) {
          const block = appState.planner.blocks[r] || {};
          const item = block[d.key] || { topic: '', tests: '' };
          if (dayIdx < minDayIdx) minDayIdx = dayIdx;
          if (r < minRowIdx) minRowIdx = r;
          list.push({
            dayIdx,
            dayKey: d.key,
            r,
            topic: item.topic || '',
            tests: item.tests || ''
          });
        }
      }
    });

    if (list.length === 0) return [];

    return list.map(item => ({
      dayOffset: item.dayIdx - minDayIdx,
      rowOffset: item.r - minRowIdx,
      topic: item.topic,
      tests: item.tests
    }));
  }

  function startCopySinglePart(dayKey, partIdx) {
    enterCopyMode();
    selectedParts.clear();
    const initKey = makePartKey(dayKey, partIdx);
    lastPastedUndoAction = null;
    selectedParts.add(initKey);

    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
    const dayIdx = orderedDays.findIndex(d => d.key === dayKey);
    lastSelectedCoord = { dayIndex: dayIdx, rowIndex: partIdx, dayKey, dayIdx, r: partIdx };

    const targetInput = document.querySelector(\`.planner-input-topic[data-row="\${partIdx}"][data-day="\${dayKey}"]\`) ||
                        document.querySelector(\`.planner-input-tests[data-row="\${partIdx}"][data-day="\${dayKey}"]\`);
    if (targetInput) {
      registerActiveInput(targetInput);
    } else {
      lastActiveInputInfo = { row: partIdx, day: dayKey, field: 'topic' };
    }

    updatePlannerInteractionModeVisuals();
  }

  const copySinglePart = startCopySinglePart;

  function copySelectedParts(keys) {
    if (Array.isArray(keys) && keys.length > 0) {
      selectedParts.clear();
      keys.forEach(k => selectedParts.add(k));
    }
    if (selectedParts.size === 0) return [];
    enterCopyMode();
    lastPastedUndoAction = null;
    if (typeof document !== 'undefined') {
      updatePlannerInteractionModeVisuals();
    }
    return getSelectedPartsPayload();
  }

  function pasteSelectedPartsAt(targetDayKey, targetPartIdx) {
    if (selectedParts.size === 0) {
      showToast('ابتدا حداقل یک پارت را برای کپی انتخاب کنید.', 'warning');
      return;
    }

    const payload = getSelectedPartsPayload();
    if (payload.length === 0) return;

    const rowCount = appState.planner.rowCount;
    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
    const targetDayIdx = orderedDays.findIndex(d => d.key === targetDayKey);

    if (targetDayIdx === -1) return;

    let pastedCount = 0;
    const totalItems = payload.length;
    const touchedDays = new Set();
    let lastPastedInput = null;
    const previousCells = [];

    payload.forEach(item => {
      const destDayIdx = targetDayIdx + item.dayOffset;
      const destRow = targetPartIdx + item.rowOffset;

      if (destDayIdx >= 0 && destDayIdx < orderedDays.length && destRow >= 0 && destRow < rowCount) {
        const destDayKey = orderedDays[destDayIdx].key;
        const currentBlock = appState.planner.blocks[destRow] || {};
        const currentCell = currentBlock[destDayKey] || {};
        previousCells.push({
          destRow,
          destDayKey,
          prevTopic: currentCell.topic || '',
          prevTests: currentCell.tests || '',
          newTopic: item.topic || '',
          newTests: item.tests || ''
        });
        if (!appState.planner.blocks[destRow]) {
          appState.planner.blocks[destRow] = createEmptyBlock();
        }
        if (!appState.planner.blocks[destRow][destDayKey]) {
          appState.planner.blocks[destRow][destDayKey] = { topic: '', tests: '' };
        }
        appState.planner.blocks[destRow][destDayKey].topic = item.topic || '';
        appState.planner.blocks[destRow][destDayKey].tests = item.tests || '';
        touchedDays.add(destDayKey);
        pastedCount++;

        // به‌روزرسانی جراحی و مستقیم مقادیر اینپوت‌ها بدون بازسازی DOM
        const topicInp = document.querySelector(\`.planner-input-topic[data-row="\${destRow}"][data-day="\${destDayKey}"]\`);
        if (topicInp) {
          topicInp.value = item.topic || '';
          lastPastedInput = topicInp;
        }
        const testsInp = document.querySelector(\`.planner-input-tests[data-row="\${destRow}"][data-day="\${destDayKey}"]\`);
        if (testsInp) {
          testsInp.value = item.tests || '';
          lastPastedInput = testsInp;
        }
      }
    });

    if (lastPastedInput) {
      registerActiveInput(lastPastedInput);
    } else {
      lastActiveInputInfo = { row: targetPartIdx, day: targetDayKey, field: 'topic' };
    }

    touchedDays.forEach(dayKey => {
      if (cachedMeasuredHeights[appState.planner.rowCount]) {
        delete cachedMeasuredHeights[appState.planner.rowCount][dayKey];
      }
    });

    if (pastedCount > 0) {
      lastPastedUndoAction = {
        cells: previousCells,
        pastedCount: pastedCount,
        timestamp: Date.now()
      };
    } else {
      lastPastedUndoAction = null;
    }

    // ریست کردن فرآیند کپی پس از جای‌گذاری و حفظ امکان بازگردانی محتوا
    resetPlannerCopying(true);
    patchPreviewPage('planner');
    debouncedSaveToLocalStorage(appState);

    const droppedCount = totalItems - pastedCount;
    if (droppedCount > 0) {
      if (pastedCount === 0) {
        showToast('هیچ پارتی جای‌گذاری نشد؛ تمامی پارت‌های انتخابی خارج از محدوده جدول قرار می‌گیرند.', 'warning');
      } else {
        showToast('هشدار: از مجموع ' + toPersianDigits(totalItems) + ' پارت، ' + toPersianDigits(pastedCount) + ' پارت جای‌گذاری شد و ' + toPersianDigits(droppedCount) + ' پارت به دلیل قرارگیری در لبه جدول جای‌گذاری نشد.', 'warning');
      }
    } else {
      if (pastedCount === 1) {
        showToast('پارت با موفقیت جای‌گذاری شد.', 'success');
      } else {
        showToast(toPersianDigits(pastedCount) + ' پارت با موفقیت جای‌گذاری شد.', 'success');
      }
    }
  }

  const pasteClipboardAt = pasteSelectedPartsAt;
  const pasteToSelectedParts = pasteSelectedPartsAt;
  const pasteSinglePartToSelected = pasteSelectedPartsAt;

  function togglePartSelection(dayKey, partIdx, isShift) {
    if (!isCopyMode) {
      startCopySinglePart(dayKey, partIdx);
      return;
    }

    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
    const dayIdx = orderedDays.findIndex(d => d.key === dayKey);
    if (dayIdx === -1) return;

    if (isShift && lastSelectedCoord) {
      const prevDayIdx = (lastSelectedCoord.dayIndex !== undefined) ? lastSelectedCoord.dayIndex : (lastSelectedCoord.dayIdx !== undefined ? lastSelectedCoord.dayIdx : 0);
      const prevRowIdx = (lastSelectedCoord.rowIndex !== undefined) ? lastSelectedCoord.rowIndex : (lastSelectedCoord.r !== undefined ? lastSelectedCoord.r : 0);
      const minDay = Math.min(prevDayIdx, dayIdx);
      const maxDay = Math.max(prevDayIdx, dayIdx);
      const minRow = Math.min(prevRowIdx, partIdx);
      const maxRow = Math.max(prevRowIdx, partIdx);

      for (let d = minDay; d <= maxDay; d++) {
        const dKey = orderedDays[d].key;
        for (let r = minRow; r <= maxRow; r++) {
          selectedParts.add(makePartKey(dKey, r));
        }
      }
    } else {
      const key = makePartKey(dayKey, partIdx);
      if (selectedParts.has(key)) {
        selectedParts.delete(key);
      } else {
        selectedParts.add(key);
      }
      lastSelectedCoord = { dayIndex: dayIdx, rowIndex: partIdx, dayKey, dayIdx, r: partIdx };
    }

    // اگر تعداد پارت‌های انتخابی صفر شد، خودکار از حالت انتخاب خارج شو
    if (selectedParts.size === 0) {
      resetPlannerCopying();
      return;
    }

    updatePlannerInteractionModeVisuals();
  }

  function toggleDaySelection(dayKey) {
    const rowCount = appState.planner.rowCount;
    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
    const dayIdx = orderedDays.findIndex(d => d.key === dayKey);

    let allSelected = true;
    for (let r = 0; r < rowCount; r++) {
      if (!selectedParts.has(makePartKey(dayKey, r))) {
        allSelected = false;
        break;
      }
    }

    if (!isCopyMode) {
      enterCopyMode();
    }

    for (let r = 0; r < rowCount; r++) {
      const key = makePartKey(dayKey, r);
      if (allSelected) {
        selectedParts.delete(key);
      } else {
        selectedParts.add(key);
      }
    }

    if (!allSelected && dayIdx !== -1) {
      lastSelectedCoord = { dayIndex: dayIdx, rowIndex: 0, dayKey, dayIdx, r: 0 };
    }

    // اگر تعداد پارت‌های انتخابی صفر شد، خودکار از حالت انتخاب خارج شو
    if (selectedParts.size === 0) {
      resetPlannerCopying();
      return;
    }

    updatePlannerInteractionModeVisuals();
  }

  function togglePartColumnSelection(partIdx) {
    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);

    let allSelected = true;
    for (const d of orderedDays) {
      if (!selectedParts.has(makePartKey(d.key, partIdx))) {
        allSelected = false;
        break;
      }
    }

    if (!isCopyMode) {
      enterCopyMode();
    }

    for (const d of orderedDays) {
      const key = makePartKey(d.key, partIdx);
      if (allSelected) {
        selectedParts.delete(key);
      } else {
        selectedParts.add(key);
      }
    }

    if (!allSelected && orderedDays.length > 0) {
      lastSelectedCoord = { dayIndex: 0, rowIndex: partIdx, dayKey: orderedDays[0].key, dayIdx: 0, r: partIdx };
    }

    // اگر تعداد پارت‌های انتخابی صفر شد، خودکار از حالت انتخاب خارج شو
    if (selectedParts.size === 0) {
      resetPlannerCopying();
      return;
    }

    updatePlannerInteractionModeVisuals();
  }

  function updatePlannerSelectionVisuals() {
    document.querySelectorAll('.planner-editor-card').forEach(card => {
      const dayKey = card.getAttribute('data-day');
      const partIdx = parseInt(card.getAttribute('data-row'), 10);
      const isSelected = isCopyMode && selectedParts.has(makePartKey(dayKey, partIdx));
      const defaultClasses = (card.getAttribute('data-default-classes') || '').trim();

      if (isSelected) {
        card.className = 'planner-editor-card bg-indigo-50/95 border-2 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md rounded-xl p-2 space-y-1.5 transition';
      } else {
        card.className = ('planner-editor-card ' + defaultClasses + ' rounded-xl p-2 space-y-1.5 transition shadow-sm hover:border-indigo-300').trim();
      }
    });

    updateClipboardBar();
  }

  function updateCardInputLockStates() {
    const isLocked = isCopyMode;
    const tableContainer = document.getElementById('planner-editor-table-scroll');
    if (tableContainer) {
      if (isLocked) {
        tableContainer.classList.add('mode-interactive-locked');
      } else {
        tableContainer.classList.remove('mode-interactive-locked');
      }
    }

    document.querySelectorAll('.planner-editor-card').forEach(card => {
      const inputs = card.querySelectorAll('.planner-input-topic, .planner-input-tests');
      inputs.forEach(inp => {
        if (isLocked) {
          inp.classList.add('pointer-events-none');
          inp.setAttribute('tabindex', '-1');
          inp.setAttribute('readonly', 'true');
        } else {
          inp.classList.remove('pointer-events-none');
          inp.removeAttribute('tabindex');
          inp.removeAttribute('readonly');
        }
      });
    });
  }

  function updatePlannerInteractionModeVisuals() {
    updateCardInputLockStates();
    updateAllCardHeaders();
    updatePlannerSelectionVisuals();
    updateAllDayActionSlots();
    updateAllColumnActionSlots();
    updateClipboardBar();
  }

  function renderPartCardHeaderHtml(dayKey, r, isNight, isSelected, copyMode, count) {
    const isCopy = (typeof copyMode === 'boolean') ? copyMode : isCopyMode;
    const selCount = (typeof count === 'number') ? count : selectedParts.size;
    const isSel = (typeof isSelected === 'boolean') ? isSelected : (isCopy && selectedParts.has(makePartKey(dayKey, r)));

    if (isCopy) {
      if (isSel) {
        // پارت انتخاب‌شده برای کپی (تیک پر - ✔ filled)
        return \`
          <div class="flex items-center justify-center pb-0.5 min-h-[28px]">
            <button
              type="button"
              class="btn-toggle-part-tick w-full h-7 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
              data-day="\${dayKey}"
              data-row="\${r}"
              title="لغو انتخاب این پارت"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>انتخاب شد</span>
            </button>
          </div>
        \`;
      }

      // سایر پارت‌ها (تیک خالی - ☐ unchecked + دکمه جای‌گذاری)
      const canPaste = selCount > 0;
      return \`
        <div class="flex items-center gap-1.5 pb-0.5 min-h-[28px] w-full">
          <button
            type="button"
            class="btn-toggle-part-tick h-7 px-1.5 rounded-lg bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-300 text-[10px] font-bold inline-flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
            data-day="\${dayKey}"
            data-row="\${r}"
            title="انتخاب این پارت برای کپی گروهی"
          >
            <span class="w-3.5 h-3.5 rounded border border-slate-400 bg-slate-50 inline-block shrink-0"></span>
            <span>انتخاب</span>
          </button>
          <button
            type="button"
            \${canPaste ? '' : 'disabled'}
            class="btn-paste-part flex-1 min-w-0 h-7 px-1.5 rounded-lg text-[10px] font-bold inline-flex items-center justify-center gap-1 transition active:scale-95 \${
              canPaste
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-40 pointer-events-none'
            }"
            data-day="\${dayKey}"
            data-row="\${r}"
            title="\${canPaste ? 'جای‌گذاری در این پارت' : 'پارتی برای جای‌گذاری انتخاب نشده است'}"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span class="truncate">جای‌گذاری</span>
          </button>
        </div>
      \`;
    }

    // حالت عادی (پیش از کپی): دکمه «کپی» و دکمه «حذف» در کنار هم
    return \`
      <div class="flex items-center gap-1.5 pb-0.5 min-h-[28px] w-full" dir="rtl">
        <button
          type="button"
          class="btn-copy-single-part flex-1 min-w-0 h-7 px-1.5 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-300 text-xs font-bold inline-flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs overflow-visible"
          data-day="\${dayKey}"
          data-row="\${r}"
          title="کپی این پارت"
          aria-label="کپی پارت"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          <span class="whitespace-nowrap overflow-visible">کپی</span>
        </button>
        <button
          type="button"
          class="btn-clear-single-part flex-1 min-w-0 h-7 px-1.5 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-slate-700 hover:border-rose-600 border border-slate-300 text-xs font-bold inline-flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs overflow-visible"
          data-day="\${dayKey}"
          data-row="\${r}"
          title="حذف محتوای این پارت"
          aria-label="حذف پارت"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          <span class="whitespace-nowrap overflow-visible">حذف</span>
        </button>
      </div>
    \`;
  }

  function renderDayActionsSlotHtml(dayKey, dayLabel, allDaySelected) {
    const isSel = Boolean(allDaySelected);
    return \`
      <div class="flex flex-col items-center gap-1 w-full px-1">
        <button
          type="button"
          class="btn-copy-day-row btn-toggle-select-day w-full py-0.5 px-1.5 rounded-md border text-[10px] font-bold text-center inline-flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer \${
            isSel
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-xs'
              : 'bg-white hover:bg-indigo-600 hover:text-white text-slate-500 border-slate-300'
          }"
          data-day="\${dayKey}"
          data-day-label="\${dayLabel}"
          title="کپی / انتخاب کل روز \${dayLabel}"
        >
          \${isSel ? '✓ کپی روز' : 'کپی روز'}
        </button>
        <button 
          type="button" 
          class="btn-clear-day w-full py-0.5 px-1.5 rounded-md bg-white hover:bg-rose-600 hover:text-white text-slate-500 border border-slate-300 text-[10px] font-bold text-center inline-flex items-center justify-center shadow-2xs transition active:scale-95 cursor-pointer" 
          data-day="\${dayKey}" 
          data-day-label="\${dayLabel}" 
          title="پاک‌سازی کامل روز \${dayLabel}"
        >
          پاکسازی
        </button>
      </div>
    \`;
  }

  function renderColActionsSlotHtml(partIdx, partTitle, allColSelected) {
    const isSel = Boolean(allColSelected);
    return \`
      <button
        type="button"
        class="btn-copy-part-col btn-toggle-part-col-copy px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer shrink-0 active:scale-95 border \${
          isSel
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-400 shadow-xs'
            : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border-white/20'
        }"
        data-row="\${partIdx}"
        data-part-title="\${partTitle}"
        title="کپی / انتخاب کل ستون \${partTitle} در تمام روزها"
      >
        \${isSel ? '✓ کپی پارت' : 'کپی پارت'}
      </button>
      <button
        type="button"
        class="btn-clear-column px-1.5 py-0.5 rounded bg-white/10 hover:bg-rose-600 text-white/80 hover:text-white border border-white/20 hover:border-rose-500 text-[10px] font-bold transition cursor-pointer shrink-0 active:scale-95"
        data-row="\${partIdx}"
        data-part-title="\${partTitle}"
        title="پاک‌سازی کامل ستون \${partTitle} در تمام روزها"
      >
        پاکسازی
      </button>
    \`;
  }

  function updateAllCardHeaders() {
    const rowCount = appState.planner.rowCount;
    const hasNight = Boolean(appState.planner && appState.planner.hasNightRoutine);
    const selectedCount = selectedParts.size;

    document.querySelectorAll('.planner-editor-card').forEach(card => {
      const dayKey = card.getAttribute('data-day');
      const r = parseInt(card.getAttribute('data-row'), 10);
      const isNight = Boolean(hasNight && r === rowCount - 1);
      const isSelected = isCopyMode && selectedParts.has(makePartKey(dayKey, r));
      const slot = card.querySelector('.planner-card-header-slot');
      if (slot) {
        slot.innerHTML = renderPartCardHeaderHtml(dayKey, r, isNight, isSelected, isCopyMode, selectedCount);
      }
    });
  }

  function updateAllDayActionSlots() {
    const rowCount = appState.planner.rowCount;
    document.querySelectorAll('.planner-day-actions-slot').forEach(slot => {
      const dayKey = slot.getAttribute('data-day');
      const dayLabel = slot.getAttribute('data-day-label') || getDayLabel(dayKey) || dayKey;
      let count = 0;
      if (isCopyMode) {
        for (let r = 0; r < rowCount; r++) {
          if (selectedParts.has(makePartKey(dayKey, r))) count++;
        }
      }
      const allSelected = isCopyMode && count === rowCount;
      slot.innerHTML = renderDayActionsSlotHtml(dayKey, dayLabel, allSelected);
    });
  }

  function updateAllColumnActionSlots() {
    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
    document.querySelectorAll('.planner-col-actions-slot').forEach(slot => {
      const r = parseInt(slot.getAttribute('data-row'), 10);
      const title = slot.getAttribute('data-part-title') || ('پارت ' + toPersianDigits(r + 1));
      let count = 0;
      if (isCopyMode) {
        for (const d of orderedDays) {
          if (selectedParts.has(makePartKey(d.key, r))) count++;
        }
      }
      const allSelected = isCopyMode && count === orderedDays.length;
      slot.innerHTML = renderColActionsSlotHtml(r, title, allSelected);
    });
  }

  let lastPastedUndoAction = null;

  function undoPastedContent() {
    if (!lastPastedUndoAction || !Array.isArray(lastPastedUndoAction.cells) || lastPastedUndoAction.cells.length === 0) {
      showToast('عملیات جای‌گذاری اخیری برای بازگردانی وجود ندارد.', 'info');
      return false;
    }

    const action = lastPastedUndoAction;
    lastPastedUndoAction = null;
    const touchedDays = new Set();
    let lastRestoredInput = null;

    action.cells.forEach(item => {
      const { destRow, destDayKey, prevTopic, prevTests } = item;
      if (!appState.planner.blocks[destRow]) {
        appState.planner.blocks[destRow] = createEmptyBlock();
      }
      if (!appState.planner.blocks[destRow][destDayKey]) {
        appState.planner.blocks[destRow][destDayKey] = { topic: '', tests: '' };
      }
      appState.planner.blocks[destRow][destDayKey].topic = prevTopic || '';
      appState.planner.blocks[destRow][destDayKey].tests = prevTests || '';
      touchedDays.add(destDayKey);

      // به‌روزرسانی جراحی و مستقیم مقادیر اینپوت‌ها بدون بازسازی DOM
      const topicInp = document.querySelector(\`.planner-input-topic[data-row="\${destRow}"][data-day="\${destDayKey}"]\`);
      if (topicInp) {
        topicInp.value = prevTopic || '';
        lastRestoredInput = topicInp;
      }
      const testsInp = document.querySelector(\`.planner-input-tests[data-row="\${destRow}"][data-day="\${destDayKey}"]\`);
      if (testsInp) {
        testsInp.value = prevTests || '';
        lastRestoredInput = testsInp;
      }
    });

    if (lastRestoredInput) {
      registerActiveInput(lastRestoredInput);
    }

    touchedDays.forEach(dayKey => {
      if (cachedMeasuredHeights[appState.planner.rowCount]) {
        delete cachedMeasuredHeights[appState.planner.rowCount][dayKey];
      }
    });

    updateClipboardBar();
    patchPreviewPage('planner');
    debouncedSaveToLocalStorage(appState);
    showToast('محتوای جای‌گذاری‌شده بازگردانده شد (Undo).', 'info', 2500);
    return true;
  }

  function bindClipboardBarEvents() {
    const bar = document.getElementById('planner-clipboard-bar-container');
    if (!bar) return;
    const btnClose = bar.querySelector('#btn-clipboard-close');
    if (btnClose) {
      btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetPlannerCopying();
        showToast('حالت کپی لغو شد.', 'info', 2000);
      });
    }
    const btnUndo = bar.querySelector('#btn-clipboard-undo');
    if (btnUndo) {
      btnUndo.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        undoPastedContent();
      });
    }
    const btnDismiss = bar.querySelector('#btn-dismiss-undo-bar');
    if (btnDismiss) {
      btnDismiss.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        lastPastedUndoAction = null;
        updateClipboardBar();
      });
    }
  }

  function renderPlannerClipboardBarHtml() {
    // ۱. در حالت کپی و انتخاب پارت‌ها: ساختار فشرده، استاندارد و شکیل مطابق طراحی سیستم
    if (isCopyMode && selectedParts.size > 0) {
      const count = selectedParts.size;
      return \`
        <div id="planner-clipboard-bar" class="w-full bg-indigo-50/90 border border-indigo-200/90 text-indigo-950 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs flex items-center justify-between gap-2 sm:gap-3 animate-fade-in mb-2 select-none" dir="rtl">
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-600 animate-pulse shrink-0"></span>
            <span id="clipboard-selected-counter" class="text-[10.5px] sm:text-xs font-bold text-indigo-950 whitespace-nowrap">\${toPersianDigits(count)} پارت انتخاب شده</span>
            <span class="text-[11px] text-indigo-600/80 font-medium hidden sm:inline truncate">(روی «جای‌گذاری» در پارت مقصد کلیک کنید)</span>
          </div>

          <button 
            type="button" 
            id="btn-clipboard-close" 
            class="h-6 px-2 sm:px-2.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-300/80 hover:border-rose-300 text-xs font-bold inline-flex items-center gap-1 sm:gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs shrink-0" 
            title="لغو کپی و بازگشت به ویرایش (Esc)"
            aria-label="لغو کپی"
          >
            <span class="text-xs font-bold leading-none">✕</span>
            <span class="text-[10px] sm:text-[11px]">لغو کپی</span>
          </button>
        </div>
      \`;
    }

    // ۲. پس از پایان فرآیند کپی و جای‌گذاری: نوار فشرده و استاندارد بازگردانی محتوای کپی‌شده (Undo)
    if (!isCopyMode && lastPastedUndoAction && Array.isArray(lastPastedUndoAction.cells) && lastPastedUndoAction.cells.length > 0) {
      const count = lastPastedUndoAction.pastedCount || lastPastedUndoAction.cells.length;
      return \`
        <div id="planner-clipboard-bar" class="w-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs flex items-center justify-between gap-1.5 sm:gap-3 animate-fade-in mb-2 select-none" dir="rtl">
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
            <span class="text-[10px] sm:text-xs font-bold text-emerald-950 whitespace-nowrap">✓ \${toPersianDigits(count)} پارت با موفقیت جای‌گذاری شد.</span>
          </div>

          <div class="flex items-center gap-1 sm:gap-1.5 shrink-0" dir="ltr">
            <button 
              type="button" 
              id="btn-dismiss-undo-bar" 
              class="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-300 text-xs font-bold inline-flex items-center justify-center transition active:scale-95 cursor-pointer shadow-2xs" 
              title="بستن این پیام"
              aria-label="بستن"
            >
              ✕
            </button>
            <button 
              type="button" 
              id="btn-clipboard-undo" 
              class="h-6 px-2 sm:px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1 sm:gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer" 
              title="بازگردانی محتوای کپی‌شده (Undo / Ctrl+Z)"
            >
              <svg class="w-3.5 h-3.5 text-slate-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h10a5 5 0 015 5v2m-15-7l4-4m-4 4l4 4"></path></svg>
              <span class="text-[10px] sm:text-[11px] whitespace-nowrap">بازگردانی (Undo)</span>
            </button>
          </div>
        </div>
      \`;
    }

    return '';
  }

  function updateClipboardBar() {
    const container = document.getElementById('planner-clipboard-bar-container');
    if (!container) return;
    container.innerHTML = renderPlannerClipboardBarHtml();
    bindClipboardBarEvents();
  }

  function handleClearSinglePart(dayKey, r) {
    if (!appState.planner.blocks || !appState.planner.blocks[r]) {
      return;
    }
    const current = appState.planner.blocks[r][dayKey] || {};
    const hadContent = Boolean((current.topic && current.topic.trim()) || (current.tests && current.tests.trim()));

    appState.planner.blocks[r][dayKey] = { topic: '', tests: '' };

    if (cachedMeasuredHeights[appState.planner.rowCount]) {
      delete cachedMeasuredHeights[appState.planner.rowCount][dayKey];
    }

    const topicInp = document.querySelector(\`.planner-input-topic[data-row="\${r}"][data-day="\${dayKey}"]\`);
    const testsInp = document.querySelector(\`.planner-input-tests[data-row="\${r}"][data-day="\${dayKey}"]\`);
    if (topicInp) topicInp.value = '';
    if (testsInp) testsInp.value = '';

    patchPreviewPage('planner');
    debouncedSaveToLocalStorage(appState);
    if (hadContent) {
      showToast('محتوای پارت با موفقیت حذف شد.', 'info');
    }
  }

  function handleClearDay(dayKey, dayLabel) {
    const formattedDayLabel = getDayLabel(dayKey) || dayLabel || dayKey;
    let hasContent = false;
    for (let r = 0; r < appState.planner.rowCount; r++) {
      const item = (appState.planner.blocks[r] && appState.planner.blocks[r][dayKey]) || {};
      if ((item.topic && item.topic.trim()) || (item.tests && item.tests.trim())) {
        hasContent = true;
        break;
      }
    }

    if (!hasContent) {
      showToast('پارت‌های روز «' + formattedDayLabel + '» از قبل خالی است.', 'info');
      return;
    }

    showConfirmModal({
      title: 'پاک‌سازی برنامه روز «' + formattedDayLabel + '»',
      message: [
        'آیا از پاک‌سازی تمامی پارت‌های روز ',
        { strong: '«' + formattedDayLabel + '»' },
        ' اطمینان دارید؟ تمامی مباحث و تست‌های ثبت‌شده برای این روز خالی خواهند شد.'
      ],
      confirmText: 'بله، پاک‌سازی شود',
      cancelText: 'انصراف',
      type: 'danger',
      icon: '🗑️',
      onConfirm: () => {
        for (let r = 0; r < appState.planner.rowCount; r++) {
          if (appState.planner.blocks[r] && appState.planner.blocks[r][dayKey]) {
            appState.planner.blocks[r][dayKey] = { topic: '', tests: '' };
          }
        }
        if (cachedMeasuredHeights[appState.planner.rowCount]) {
          delete cachedMeasuredHeights[appState.planner.rowCount][dayKey];
        }
        document.querySelectorAll('.planner-input-topic[data-day="' + dayKey + '"]').forEach(inp => { inp.value = ''; });
        document.querySelectorAll('.planner-input-tests[data-day="' + dayKey + '"]').forEach(inp => { inp.value = ''; });
        updateClipboardBar();
        patchPreviewPage('planner');
        debouncedSaveToLocalStorage(appState);
        showToast('برنامه روز «' + formattedDayLabel + '» با موفقیت پاک‌سازی شد.', 'info');
      }
    });
  }

  function handleClearPartColumn(partIdx, partTitle) {
    const formattedTitle = partTitle || ('پارت ' + toPersianDigits(partIdx + 1));
    const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
    let hasContent = false;
    const block = appState.planner.blocks[partIdx] || {};
    for (let i = 0; i < orderedDays.length; i++) {
      const dayKey = orderedDays[i].key;
      const item = block[dayKey] || {};
      if ((item.topic && item.topic.trim()) || (item.tests && item.tests.trim())) {
        hasContent = true;
        break;
      }
    }

    if (!hasContent) {
      showToast('ستون «' + formattedTitle + '» از قبل خالی است.', 'info');
      return;
    }

    showConfirmModal({
      title: 'پاک‌سازی ستون «' + formattedTitle + '»',
      message: [
        'آیا از پاک‌سازی کامل ',
        { strong: '«' + formattedTitle + '»' },
        ' در تمامی روزهای برنامه اطمینان دارید؟ تمامی مباحث و تست‌های ثبت‌شده برای این ستون خالی خواهند شد.'
      ],
      confirmText: 'بله، پاک‌سازی شود',
      cancelText: 'انصراف',
      type: 'danger',
      icon: '🗑️',
      onConfirm: () => {
        if (appState.planner.blocks[partIdx]) {
          orderedDays.forEach(d => {
            appState.planner.blocks[partIdx][d.key] = { topic: '', tests: '' };
          });
        }
        cachedMeasuredHeights = {};
        document.querySelectorAll('.planner-input-topic[data-row="' + partIdx + '"]').forEach(inp => { inp.value = ''; });
        document.querySelectorAll('.planner-input-tests[data-row="' + partIdx + '"]').forEach(inp => { inp.value = ''; });
        updateClipboardBar();
        patchPreviewPage('planner');
        debouncedSaveToLocalStorage(appState);
        showToast('ستون «' + formattedTitle + '» در تمامی روزها با موفقیت پاک‌سازی شد.', 'info');
      }
    });
  }

  function resetPlannerCopying(keepUndo) {
    isCopyMode = false;
    isMultiSelectMode = false;
    selectedParts.clear();
    lastSelectedCoord = null;
    partClipboard = null;
    if (!keepUndo) {
      lastPastedUndoAction = null;
    }
    if (typeof document !== 'undefined') {
      updatePlannerInteractionModeVisuals();
    }
    if (hasPushedCopyHistory) {
      hasPushedCopyHistory = false;
      if (typeof window !== 'undefined' && window.history && typeof window.history.back === 'function') {
        try {
          window.history.back();
        } catch (e) {}
      }
    }
  }

  // ==================== فرم صفحه ۲: برنامه هفتگی (چیدمان جابجاشده: پارت‌ها در ستون و روزها در سطر) ====================
  function renderPlannerEditorHtml() {
    if ((isCopyMode || isMultiSelectMode) && selectedParts.size === 0) {
      isCopyMode = false;
      isMultiSelectMode = false;
      partClipboard = null;
      lastSelectedCoord = null;
    }
    const rowCount = appState.planner.rowCount;
    const startDayKey = appState.planner.startDay || 'sat';
    const dayCount = appState.planner.dayCount || 7;
    const hasNightRoutine = Boolean(appState.planner && appState.planner.hasNightRoutine);
    const orderedDays = getOrderedDays(startDayKey, dayCount);
    const hasClipboard = Boolean(partClipboard && Array.isArray(partClipboard.items) && partClipboard.items.length > 0);
    const dayColWidth = 92;
    const partColWidth = 172;
    const tableWidth = dayColWidth + rowCount * partColWidth;

    let html = \`
      <div class="space-y-4">
        <!-- تنظیمات فشرده و صیقلی برنامه مطالعاتی -->
        <div class="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div class="grid grid-cols-2 gap-2">
            <!-- ۱. تعداد روزها -->
            <div class="planner-setting-card space-y-1 flex flex-col justify-between">
              <label for="planner-day-count-select" class="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                <span>تعداد روزها</span>
              </label>
              <select 
                id="planner-day-count-select" 
                class="planner-setting-select w-full"
              >
                \${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(num => \`
                  <option value="\${num}" \${num === dayCount ? 'selected' : ''}>\${toPersianDigits(num)} روزه</option>
                \`).join('')}
              </select>
            </div>

            <!-- ۲. تعداد پارت‌ها -->
            <div class="planner-setting-card space-y-1 flex flex-col justify-between">
              <label for="planner-row-select" class="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                <span>تعداد پارت‌ها</span>
              </label>
              <select 
                id="planner-row-select" 
                class="planner-setting-select w-full"
              >
                \${[3, 4, 5, 6, 7, 8, 9].map(num => \`
                  <option value="\${num}" \${num === rowCount ? 'selected' : ''}>\${toPersianDigits(num)} پارت</option>
                \`).join('')}
              </select>
            </div>

            <!-- ۳. روز شروع -->
            <div class="planner-setting-card space-y-1 flex flex-col justify-between">
              <label for="planner-start-day-select" class="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                <span>روز شروع</span>
              </label>
              <select 
                id="planner-start-day-select" 
                class="planner-setting-select w-full"
              >
                \${DAYS_OF_WEEK.map(d => \`
                  <option value="\${d.key}" \${d.key === startDayKey ? 'selected' : ''}>\${d.label}</option>
                \`).join('')}
              </select>
            </div>

            <!-- ۴. روتین شبانه -->
            <div class="planner-setting-card space-y-1 flex flex-col justify-between">
              <span class="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0"></span>
                <span>روتین شبانه</span>
              </span>
              <label class="flex items-center justify-between px-2.5 h-[34px] rounded-lg bg-purple-50/50 hover:bg-purple-100/60 border border-purple-200/80 transition cursor-pointer select-none">
                <span class="text-[11px] font-bold text-purple-950 flex items-center gap-1">
                  <span>🌙</span>
                  <span>پارت آخر</span>
                </span>
                <input 
                  type="checkbox" 
                  id="planner-night-routine-toggle" 
                  \${hasNightRoutine ? 'checked' : ''} 
                  class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 transition cursor-pointer accent-purple-600"
                />
              </label>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs bg-amber-50/70 border border-amber-200/80 px-3.5 py-2 rounded-xl shadow-2xs">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-200/70 text-amber-900 font-bold text-xs shrink-0">↔</span>
          <span class="font-bold text-amber-950">
            برای دسترسی و ویرایش پارت‌های دیگر، جدول را به چپ یا راست اسکرول کنید.
          </span>
        </div>

        <!-- جدول برنامه هفتگی (چیدمان جابجاشده) -->
        <div class="space-y-2 relative">
          <div id="planner-clipboard-bar-container">
            \${renderPlannerClipboardBarHtml()}
          </div>
          <div id="planner-editor-table-scroll" class="overflow-x-auto pb-4 custom-scrollbar rounded-xl border border-slate-300 shadow-sm bg-white \${isMultiSelectMode ? 'mode-interactive-locked' : ''}">
            <table class="text-right border-collapse" style="width: \${tableWidth}px; min-width: \${tableWidth}px; table-layout: fixed;">
              <colgroup>
                <col style="width: \${dayColWidth}px; min-width: \${dayColWidth}px; max-width: \${dayColWidth}px;" />
                \${Array.from({ length: rowCount }).map(() => \`<col style="width: \${partColWidth}px; min-width: \${partColWidth}px; max-width: \${partColWidth}px;" />\`).join('')}
              </colgroup>
              <thead>
                <tr class="bg-indigo-950 text-white text-xs font-bold divide-x divide-x-reverse divide-indigo-800">
                  <th class="py-3 px-2 text-center bg-indigo-950 text-white font-bold" style="width: \${dayColWidth}px; min-width: \${dayColWidth}px; max-width: \${dayColWidth}px;">روزهای هفته</th>
                  \${Array.from({ length: rowCount }).map((_, r) => {
                    const isLast = r === rowCount - 1;
                    const isNight = Boolean(hasNightRoutine && isLast);
                    const title = isNight ? 'روتین شبانه' : ('پارت ' + toPersianDigits(r + 1));
                    const thClass = isNight
                      ? 'py-2 px-2 text-center bg-[#131d3b] text-white font-bold'
                      : 'py-2 px-2 text-center bg-indigo-950 text-white font-bold';
                    let colSelectedCount = 0;
                    if (isCopyMode) {
                      for (const d of orderedDays) {
                        if (selectedParts.has(makePartKey(d.key, r))) colSelectedCount++;
                      }
                    }
                    const allColSelected = isCopyMode && colSelectedCount === orderedDays.length;

                    return \`
                      <th class="\${thClass}" style="width: \${partColWidth}px; min-width: \${partColWidth}px; max-width: \${partColWidth}px;">
                        <div class="flex flex-col items-center justify-center gap-1.5 px-1 py-0.5">
                          <div class="text-xs font-bold text-white flex items-center justify-center gap-1 truncate w-full">
                            \${isNight ? '<span class="text-amber-300 text-xs shrink-0">🌙</span>' : ''}
                            <span class="text-white">\${title}</span>
                          </div>
                          <div class="planner-col-actions-slot flex items-center justify-center gap-1.5 w-full" data-row="\${r}" data-part-title="\${title}">
                            \${renderColActionsSlotHtml(r, title, allColSelected)}
                          </div>
                        </div>
                      </th>
                    \`;
                  }).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-xs">
    \`;

    orderedDays.forEach((d, dIdx) => {
      const theme = getDayTheme(d);
      let daySelectedCount = 0;
      if (isCopyMode) {
        for (let r = 0; r < rowCount; r++) {
          if (selectedParts.has(makePartKey(d.key, r))) daySelectedCount++;
        }
      }
      const allDaySelected = isCopyMode && daySelectedCount === rowCount;

      html += \`
        <tr class="\${theme.rowBg} divide-x divide-x-reverse divide-slate-200 transition-colors">
          <td class="text-center font-bold bg-slate-100 py-2 px-1 align-middle" style="width: \${dayColWidth}px; min-width: \${dayColWidth}px; max-width: \${dayColWidth}px;">
            <div class="flex flex-col items-center gap-1.5">
              <span class="day-badge-pill inline-block px-3.5 py-1.5 rounded-xl \${theme.badge} font-bold text-xs shadow-xs tracking-wide">
                \${d.label}
              </span>
              <div class="planner-day-actions-slot flex items-center justify-center w-full" data-day="\${d.key}" data-day-label="\${d.label}">
                \${renderDayActionsSlotHtml(d.key, d.label, allDaySelected)}
              </div>
            </div>
          </td>
          \${Array.from({ length: rowCount }).map((_, r) => {
            const block = appState.planner.blocks[r] || createEmptyBlock();
            if (!appState.planner.blocks[r]) appState.planner.blocks[r] = block;
            if (!block[d.key]) block[d.key] = { topic: '', tests: '' };
            const item = block[d.key];
            const isNight = Boolean(hasNightRoutine && r === rowCount - 1);
            const defaultCardClasses = isNight
              ? 'bg-indigo-50/70 border border-indigo-300 ring-1 ring-indigo-400/20'
              : (theme.cardBg + ' border ' + theme.border);
            const isSelected = isCopyMode && selectedParts.has(makePartKey(d.key, r));
            const cardStateClasses = isSelected
              ? 'bg-indigo-50/95 border-2 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
              : defaultCardClasses;
            const topicPlaceholder = 'مبحث / کتاب...';
            const partLabelText = isNight ? 'روتین شبانه' : ('پارت ' + toPersianDigits(r + 1));
            const isLocked = isMultiSelectMode;
            const lockAttrs = isLocked ? 'tabindex="-1" readonly' : '';
            const lockClass = isLocked ? 'pointer-events-none' : '';
            const isLastCard = (dIdx === orderedDays.length - 1) && (r === rowCount - 1);
            const testsEnterHint = isLastCard ? 'done' : 'next';

            return \`
              <td class="p-1.5 align-middle h-full" style="width: \${partColWidth}px; min-width: \${partColWidth}px; max-width: \${partColWidth}px;">
                <div
                  class="planner-editor-card \${cardStateClasses} rounded-xl p-2 space-y-1.5 transition shadow-sm hover:border-indigo-300 h-full flex flex-col justify-between"
                  data-day="\${d.key}"
                  data-row="\${r}"
                  data-default-classes="\${defaultCardClasses}"
                >
                  <div class="planner-card-header-slot">
                    \${renderPartCardHeaderHtml(d.key, r, isNight, isSelected, isCopyMode, selectedParts.size)}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      data-row="\${r}" 
                      data-day="\${d.key}" 
                      data-field="topic" 
                      enterkeyhint="next"
                      \${lockAttrs}
                      aria-label="\${d.label} - \${partLabelText} - مبحث"
                      placeholder="\${topicPlaceholder}" 
                      value="\${sanitizeHtml(item.topic)}" 
                      style="text-align: center !important; -webkit-appearance: none;" 
                      class="planner-input-topic \${lockClass} w-full text-xs text-center px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition bg-white font-medium shadow-2xs placeholder:text-slate-400" 
                    />
                  </div>
                  <div class="flex items-center gap-1.5 bg-white/95 px-2 py-1 rounded-lg border border-slate-200/90 shadow-2xs">
                    <span class="editor-test-label text-slate-500 font-bold text-[10.5px] shrink-0">تست:</span>
                    <input 
                      type="text" 
                      data-row="\${r}" 
                      data-day="\${d.key}" 
                      data-field="tests" 
                      enterkeyhint="\${testsEnterHint}"
                      \${lockAttrs}
                      aria-label="\${d.label} - \${partLabelText} - تست"
                      placeholder="توضیحات..." 
                      value="\${sanitizeHtml(item.tests)}" 
                      style="text-align: center !important; -webkit-appearance: none;" 
                      class="planner-input-tests \${lockClass} flex-1 min-w-0 text-xs text-center py-0.5 px-1.5 rounded-md border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 focus:outline-none transition font-bold bg-amber-50 text-amber-950 placeholder:text-slate-300" 
                    />
                  </div>
                </div>
              </td>
            \`;
          }).join('')}
        </tr>
      \`;
    });

    html += \`
              </tbody>
            </table>
          </div>
        </div>
      </div>
    \`;

    return html;
  }

  function syncPlannerDayRowHeights() {
    const table = document.getElementById('planner-editor-table-scroll');
    if (!table) return;
    table.querySelectorAll('tbody tr').forEach(tr => {
      const cards = Array.from(tr.querySelectorAll('.planner-editor-card'));
      if (cards.length === 0) return;
      cards.forEach(c => { c.style.height = 'auto'; });
      let maxH = 0;
      cards.forEach(c => {
        if (c.offsetHeight > maxH) maxH = c.offsetHeight;
      });
      if (maxH > 0) {
        cards.forEach(c => { c.style.height = maxH + 'px'; });
      }
    });
  }

  function bindPlannerEditorEvents() {
    syncPlannerDayRowHeights();
    const tableContainer = document.getElementById('planner-editor-table-scroll');
    if (tableContainer) {
      tableContainer.addEventListener('click', (e) => {
        // ۱. دکمه کپی پارت (شروع حالت کپی و انتخاب این پارت)
        const copyBtn = e.target.closest('.btn-copy-single-part');
        if (copyBtn) {
          e.stopPropagation();
          const dayKey = copyBtn.getAttribute('data-day');
          const partIdx = parseInt(copyBtn.getAttribute('data-row'), 10);
          startCopySinglePart(dayKey, partIdx);
          return;
        }

        // دکمه پاک‌سازی تک‌پارت (بدون نیاز به مودال تایید)
        const clearPartBtn = e.target.closest('.btn-clear-single-part');
        if (clearPartBtn) {
          e.stopPropagation();
          const dayKey = clearPartBtn.getAttribute('data-day');
          const partIdx = parseInt(clearPartBtn.getAttribute('data-row'), 10);
          handleClearSinglePart(dayKey, partIdx);
          return;
        }

        // ۲. دکمه جای‌گذاری پارت در محل مقصد
        const pasteBtn = e.target.closest('.btn-paste-part');
        if (pasteBtn) {
          e.stopPropagation();
          if (pasteBtn.hasAttribute('disabled') || selectedParts.size === 0) {
            showToast('ابتدا حداقل یک پارت را برای کپی انتخاب کنید.', 'warning');
            return;
          }
          const dayKey = pasteBtn.getAttribute('data-day');
          const partIdx = parseInt(pasteBtn.getAttribute('data-row'), 10);
          pasteSelectedPartsAt(dayKey, partIdx);
          return;
        }

        // ۳. دکمه تیک انتخاب پارت
        const togglePartBtn = e.target.closest('.btn-toggle-part-tick, .btn-toggle-select-part');
        if (togglePartBtn) {
          e.stopPropagation();
          const dayKey = togglePartBtn.getAttribute('data-day');
          const partIdx = parseInt(togglePartBtn.getAttribute('data-row'), 10);
          togglePartSelection(dayKey, partIdx, Boolean(e.shiftKey));
          return;
        }

        // دکمه کپی / انتخاب کل روز
        const copyDayBtn = e.target.closest('.btn-copy-day-row, .btn-toggle-select-day');
        if (copyDayBtn) {
          e.stopPropagation();
          const dayKey = copyDayBtn.getAttribute('data-day');
          toggleDaySelection(dayKey);
          return;
        }

        // دکمه کپی / انتخاب کل ستون پارت
        const copyColBtn = e.target.closest('.btn-copy-part-col, .btn-toggle-part-col-copy');
        if (copyColBtn) {
          e.stopPropagation();
          const partIdx = parseInt(copyColBtn.getAttribute('data-row'), 10);
          togglePartColumnSelection(partIdx);
          return;
        }

        // ۴. دکمه پاک‌سازی روز
        const clearDayBtn = e.target.closest('.btn-clear-day');
        if (clearDayBtn) {
          e.stopPropagation();
          const dayKey = clearDayBtn.getAttribute('data-day');
          const dayLabel = clearDayBtn.getAttribute('data-day-label') || dayKey;
          handleClearDay(dayKey, dayLabel);
          return;
        }

        // ۵. دکمه پاک‌سازی ستون پارت
        const clearColBtn = e.target.closest('.btn-clear-column');
        if (clearColBtn) {
          e.stopPropagation();
          const partIdx = parseInt(clearColBtn.getAttribute('data-row'), 10);
          const partTitle = clearColBtn.getAttribute('data-part-title') || ('پارت ' + toPersianDigits(partIdx + 1));
          handleClearPartColumn(partIdx, partTitle);
          return;
        }

        // ۶. لمس یا کلیک روی بدنه کارت در حالت کپی (تاچ‌تارگت کل کارت برای فعال/غیرفعال کردن تیک)
        if (isCopyMode) {
          const card = e.target.closest('.planner-editor-card');
          if (card) {
            e.preventDefault();
            e.stopPropagation();
            const dayKey = card.getAttribute('data-day');
            const partIdx = parseInt(card.getAttribute('data-row'), 10);
            togglePartSelection(dayKey, partIdx, Boolean(e.shiftKey));
            return;
          }
        }
      });

      // جلوگیری از انتخاب ناخواسته متن با Shift+Click در جدول
      tableContainer.addEventListener('mousedown', (e) => {
        if (e.shiftKey && e.target.closest('.btn-toggle-select-part, .planner-editor-card')) {
          e.preventDefault();
        }
      });

      // پیمایش روان کیبورد مجازی موبایل با کلید Enter / Next (Virtual Keyboard enterkeyhint Flow)
      tableContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const topicInput = e.target.closest('.planner-input-topic');
          const testsInput = e.target.closest('.planner-input-tests');

          if (e.shiftKey) {
            // پیمایش رو به عقب با Shift+Enter
            if (testsInput) {
              e.preventDefault();
              const card = testsInput.closest('.planner-editor-card');
              const targetTopic = card?.querySelector('.planner-input-topic');
              if (targetTopic) {
                targetTopic.focus();
                targetTopic.select?.();
                targetTopic.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
              return;
            }
            if (topicInput) {
              e.preventDefault();
              const currentDay = topicInput.getAttribute('data-day');
              const currentRow = parseInt(topicInput.getAttribute('data-row'), 10);
              const rowCount = appState.planner.rowCount;
              const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
              const currentDayIdx = orderedDays.findIndex(d => d.key === currentDay);

              let prevDay = currentDay;
              let prevRow = currentRow - 1;
              if (prevRow < 0) {
                if (currentDayIdx > 0) {
                  prevDay = orderedDays[currentDayIdx - 1].key;
                  prevRow = rowCount - 1;
                } else {
                  return;
                }
              }
              const prevTests = document.querySelector('.planner-input-tests[data-day="' + prevDay + '"][data-row="' + prevRow + '"]');
              if (prevTests) {
                prevTests.focus();
                prevTests.select?.();
                prevTests.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
              return;
            }
          } else {
            // پیمایش رو به جلو با Enter / Next
            if (topicInput) {
              e.preventDefault();
              // پرش مستقیم به فیلد تست همان پارت
              const card = topicInput.closest('.planner-editor-card');
              const targetTests = card?.querySelector('.planner-input-tests');
              if (targetTests) {
                targetTests.focus();
                targetTests.select?.();
                targetTests.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
              return;
            }

            if (testsInput) {
              e.preventDefault();
              // پرش مستقیم به فیلد مبحث پارت بعدی
              const currentDay = testsInput.getAttribute('data-day');
              const currentRow = parseInt(testsInput.getAttribute('data-row'), 10);
              const rowCount = appState.planner.rowCount;
              const orderedDays = getOrderedDays(appState.planner.startDay, appState.planner.dayCount);
              const currentDayIdx = orderedDays.findIndex(d => d.key === currentDay);

              let nextDay = currentDay;
              let nextRow = currentRow + 1;

              if (nextRow >= rowCount) {
                if (currentDayIdx !== -1 && currentDayIdx + 1 < orderedDays.length) {
                  nextDay = orderedDays[currentDayIdx + 1].key;
                  nextRow = 0;
                } else {
                  // پایان جدول برنامه هفتگی
                  testsInput.blur();
                  return;
                }
              }

              const nextTopic = document.querySelector('.planner-input-topic[data-day="' + nextDay + '"][data-row="' + nextRow + '"]');
              if (nextTopic) {
                nextTopic.focus();
                nextTopic.select?.();
                nextTopic.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
              return;
            }
          }
        }
      });
    }

    const dayCountSelect = document.getElementById('planner-day-count-select');
    if (dayCountSelect) {
      dayCountSelect.addEventListener('change', (e) => {
        setPlannerDayCount(appState, parseInt(e.target.value, 10));
        renderEditorPanel();
        patchPreviewPage('planner');
        debouncedSaveToLocalStorage(appState);
      });
    }

    const rowSelect = document.getElementById('planner-row-select');
    if (rowSelect) {
      rowSelect.addEventListener('change', (e) => {
        setPlannerRowCount(appState, parseInt(e.target.value, 10));
        renderEditorPanel();
        patchPreviewPage('planner');
        debouncedSaveToLocalStorage(appState);
      });
    }

    const startDaySelect = document.getElementById('planner-start-day-select');
    if (startDaySelect) {
      startDaySelect.addEventListener('change', (e) => {
        setPlannerStartDay(appState, e.target.value);
        renderEditorPanel();
        patchPreviewPage('planner');
        debouncedSaveToLocalStorage(appState);
      });
    }

    const nightRoutineToggle = document.getElementById('planner-night-routine-toggle');
    if (nightRoutineToggle) {
      nightRoutineToggle.addEventListener('change', (e) => {
        setPlannerNightRoutine(appState, e.target.checked);
        renderEditorPanel();
        patchPreviewPage('planner');
        debouncedSaveToLocalStorage(appState);
      });
    }

    // رهگیری و همگام‌سازی بخش مبحث / کتاب
    document.querySelectorAll('.planner-input-topic').forEach(input => {
      input.addEventListener('focus', (e) => registerActiveInput(e.target));
      input.addEventListener('click', (e) => registerActiveInput(e.target));
      input.addEventListener('pointerdown', (e) => registerActiveInput(e.target));
      input.addEventListener('input', (e) => {
        registerActiveInput(e.target);
        const row = parseInt(e.target.getAttribute('data-row'), 10);
        const day = e.target.getAttribute('data-day');
        if (!appState.planner.blocks[row]) {
          appState.planner.blocks[row] = createEmptyBlock();
        }
        if (!appState.planner.blocks[row][day]) {
          appState.planner.blocks[row][day] = { topic: '', tests: '' };
        }
        appState.planner.blocks[row][day].topic = e.target.value;
        if (cachedMeasuredHeights[appState.planner.rowCount]) {
          delete cachedMeasuredHeights[appState.planner.rowCount][day];
        }
        requestPagePatch('planner');
        debouncedSaveToLocalStorage(appState);
      });
    });

    // رهگیری و همگام‌سازی بخش تست
    document.querySelectorAll('.planner-input-tests').forEach(input => {
      input.addEventListener('focus', (e) => registerActiveInput(e.target));
      input.addEventListener('click', (e) => registerActiveInput(e.target));
      input.addEventListener('pointerdown', (e) => registerActiveInput(e.target));
      input.addEventListener('input', (e) => {
        registerActiveInput(e.target);
        const row = parseInt(e.target.getAttribute('data-row'), 10);
        const day = e.target.getAttribute('data-day');
        if (!appState.planner.blocks[row]) {
          appState.planner.blocks[row] = createEmptyBlock();
        }
        if (!appState.planner.blocks[row][day]) {
          appState.planner.blocks[row][day] = { topic: '', tests: '' };
        }
        appState.planner.blocks[row][day].tests = e.target.value;
        if (cachedMeasuredHeights[appState.planner.rowCount]) {
          delete cachedMeasuredHeights[appState.planner.rowCount][day];
        }
        requestPagePatch('planner');
        debouncedSaveToLocalStorage(appState);
      });
    });

    bindClipboardBarEvents();
  }

  // مودال اختصاصی و شکیل تأیید عملیات (Confirm Modal)
  function showConfirmModal({
    title = 'تأیید عملیات',
    message = '',
    subMessage = '',
    subMessageType = '',
    confirmText = 'تأیید',
    cancelText = 'انصراف',
    type = 'danger',
    icon = '',
    onConfirm = () => {},
    onCancel = () => {},
  }) {
    let overlay = document.getElementById('app-confirm-modal-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'app-confirm-modal-overlay';
    overlay.className = 'fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[60] p-4 transition-opacity';

    let dotColor = 'bg-rose-600';
    let iconBg = 'bg-rose-100 text-rose-700';
    let confirmBtnClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs';
    let defaultIcon = '🗑️';

    if (type === 'warning') {
      dotColor = 'bg-amber-500';
      iconBg = 'bg-amber-100 text-amber-800';
      confirmBtnClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs';
      defaultIcon = '⚠️';
    } else if (type === 'info') {
      dotColor = 'bg-indigo-600';
      iconBg = 'bg-indigo-100 text-indigo-700';
      confirmBtnClass = 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs';
      defaultIcon = '✨';
    } else if (type === 'primary') {
      dotColor = 'bg-blue-600';
      iconBg = 'bg-blue-100 text-blue-700';
      confirmBtnClass = 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs';
      defaultIcon = '📋';
    }

    const modalIcon = icon || defaultIcon;

    overlay.innerHTML = \`
      <div class="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-sm w-full p-5 text-right space-y-4 animate-scale-up" dir="rtl">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full \${dotColor}"></span>
            <h3 id="app-confirm-modal-title" class="text-xs font-bold text-slate-900"></h3>
          </div>
          <button type="button" id="btn-modal-cancel-x" class="text-slate-400 hover:text-slate-700 text-lg font-bold leading-none cursor-pointer" aria-label="بستن">&times;</button>
        </div>

        <div class="flex items-start gap-3">
          <div id="app-confirm-modal-icon" class="w-10 h-10 rounded-xl \${iconBg} flex items-center justify-center text-lg shrink-0 select-none shadow-2xs"></div>
          <div id="app-confirm-modal-body" class="text-xs text-slate-600 font-medium leading-relaxed pt-1"></div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button 
            type="button" 
            id="btn-modal-cancel" 
            class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
          ></button>
          <button 
            type="button" 
            id="btn-modal-confirm" 
            class="px-4 py-2 rounded-xl \${confirmBtnClass} text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
          ></button>
        </div>
      </div>
    \`;

    const titleEl = overlay.querySelector('#app-confirm-modal-title');
    if (titleEl) titleEl.textContent = title;

    const iconEl = overlay.querySelector('#app-confirm-modal-icon');
    if (iconEl) {
      if (modalIcon instanceof Node) {
        iconEl.appendChild(modalIcon);
      } else {
        iconEl.textContent = modalIcon;
      }
    }

    const cancelBtn = overlay.querySelector('#btn-modal-cancel');
    if (cancelBtn) cancelBtn.textContent = cancelText;

    const confirmBtn = overlay.querySelector('#btn-modal-confirm');
    if (confirmBtn) confirmBtn.textContent = confirmText;

    const bodyEl = overlay.querySelector('#app-confirm-modal-body');
    if (bodyEl) {
      renderModalBody(bodyEl, message, subMessage, subMessageType);
    }

    document.body.appendChild(overlay);

    let isClosed = false;
    const closeModal = () => {
      if (isClosed) return;
      isClosed = true;
      document.removeEventListener('keydown', handleKeyDown);
      overlay.remove();
    };

    const handleKeyDown = (e) => {
      const overlays = document.querySelectorAll('#app-confirm-modal-overlay');
      if (overlays.length > 0 && overlays[overlays.length - 1] !== overlay) {
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        if (typeof onCancel === 'function') onCancel();
      } else if (e.key === 'Enter') {
        const cancelBtnEl = overlay.querySelector('#btn-modal-cancel');
        const cancelXBtnEl = overlay.querySelector('#btn-modal-cancel-x');
        if (
          document.activeElement === cancelBtnEl || 
          document.activeElement === cancelXBtnEl ||
          (cancelBtnEl && cancelBtnEl.contains(document.activeElement)) ||
          (cancelXBtnEl && cancelXBtnEl.contains(document.activeElement))
        ) {
          e.preventDefault();
          closeModal();
          if (typeof onCancel === 'function') onCancel();
          return;
        }
        if (type === 'danger' || type === 'warning') {
          const confirmBtnEl = overlay.querySelector('#btn-modal-confirm');
          if (document.activeElement !== confirmBtnEl && !(confirmBtnEl && confirmBtnEl.contains(document.activeElement))) {
            return;
          }
        }
        e.preventDefault();
        closeModal();
        if (typeof onConfirm === 'function') onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    overlay.querySelector('#btn-modal-cancel-x')?.addEventListener('click', () => {
      closeModal();
      if (typeof onCancel === 'function') onCancel();
    });

    overlay.querySelector('#btn-modal-cancel')?.addEventListener('click', () => {
      closeModal();
      if (typeof onCancel === 'function') onCancel();
    });

    overlay.querySelector('#btn-modal-confirm')?.addEventListener('click', () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
        if (typeof onCancel === 'function') onCancel();
      }
    });

    setTimeout(() => {
      if (type === 'danger' || type === 'warning') {
        (overlay.querySelector('#btn-modal-cancel') || overlay.querySelector('#btn-modal-confirm'))?.focus();
      } else {
        (overlay.querySelector('#btn-modal-confirm') || overlay.querySelector('#btn-modal-cancel'))?.focus();
      }
    }, 40);
  }

  function renderModalBody(container, message, subMessage, subMessageType) {
    container.replaceChildren();

    function appendItem(parent, item) {
      if (item === null || item === undefined) return;
      if (item instanceof Node) {
        parent.appendChild(item);
      } else if (typeof item === 'object') {
        if (item.strong || item.bold) {
          const strong = document.createElement('strong');
          strong.className = 'font-bold text-slate-900';
          strong.textContent = item.strong || item.bold;
          parent.appendChild(strong);
        } else if (item.text) {
          const span = document.createElement('span');
          span.textContent = item.text;
          if (item.className) span.className = item.className;
          parent.appendChild(span);
        }
      } else {
        const str = String(item);
        const lines = str.split(/<br\\s*\\/?>|\\n/gi);
        lines.forEach((line, idx) => {
          if (idx > 0) parent.appendChild(document.createElement('br'));
          const parts = line.split(/(<strong[^>]*>.*?<\\/strong>|<b[^>]*>.*?<\\/b>)/gi);
          parts.forEach(part => {
            if (/^<(?:strong|b)[^>]*>(.*?)<\\/(?:strong|b)>$/i.test(part)) {
              const innerText = part.replace(/^<(?:strong|b)[^>]*>|<\\/(?:strong|b)>$/gi, '').replace(/<[^>]*>/g, '');
              const strongEl = document.createElement('strong');
              strongEl.className = 'font-bold text-slate-900';
              strongEl.textContent = innerText;
              parent.appendChild(strongEl);
            } else {
              const cleanText = part.replace(/<[^>]*>/g, '');
              if (cleanText) {
                parent.appendChild(document.createTextNode(cleanText));
              }
            }
          });
        });
      }
    }

    if (Array.isArray(message)) {
      const p = document.createElement('div');
      p.className = 'leading-relaxed text-slate-600';
      message.forEach(item => appendItem(p, item));
      container.appendChild(p);
    } else if (message instanceof Node) {
      container.appendChild(message);
    } else if (typeof message === 'object' && message !== null) {
      const p = document.createElement('div');
      p.className = 'leading-relaxed text-slate-600';
      if (message.text) {
        appendItem(p, message.text);
      }
      container.appendChild(p);
      if (message.subText || message.note) {
        subMessage = subMessage || message.subText || message.note;
        subMessageType = subMessageType || message.subType || message.subMessageType;
      }
    } else if (message) {
      const p = document.createElement('div');
      p.className = 'leading-relaxed text-slate-600';
      appendItem(p, message);
      container.appendChild(p);
    }

    if (subMessage) {
      const subDiv = document.createElement('div');
      subDiv.id = 'app-confirm-modal-submessage';
      const colorCls = subMessageType === 'danger' ? 'text-rose-700' :
                       subMessageType === 'warning' ? 'text-amber-800' :
                       subMessageType === 'info' ? 'text-indigo-700' :
                       subMessageType === 'success' ? 'text-emerald-700' :
                       'text-slate-500';
      subDiv.className = \`\${colorCls} text-[11px] font-semibold mt-1.5 leading-normal\`;
      subDiv.textContent = typeof subMessage === 'string' ? subMessage.replace(/<[^>]*>/g, '') : String(subMessage);
      container.appendChild(subDiv);
    }
  }

  // ==================== فرم صفحه ۳: مشخصات دانش‌آموز ====================
  function renderStudentEditorHtml() {
    const s = appState.student;
    const currentField = (s.fieldOfStudy || '').trim();
    const fieldOptions = (!currentField || FIELDS_OF_STUDY.includes(currentField))
      ? FIELDS_OF_STUDY
      : [currentField, ...FIELDS_OF_STUDY];

    return \`
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- ۱. نام و نام خانوادگی -->
          <div class="md:col-span-2">
            <label class="block font-bold text-sky-900 mb-1">نام و نام خانوادگی دانش‌آموز <span class="text-rose-500">*</span>:</label>
            <input type="text" data-prop="fullName" value="\${sanitizeHtml(getStudentFullName(s))}" placeholder="مثال: علیرضا محمدی" class="student-field w-full p-2.5 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-sky-50/20 font-bold" />
          </div>

          <!-- ۲. رشته تحصیلی -->
          <div>
            <label class="block font-bold text-emerald-900 mb-1">رشته تحصیلی <span class="text-rose-500">*</span>:</label>
            <select data-prop="fieldOfStudy" class="student-field w-full p-2.5 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50/20 font-bold">
              \${fieldOptions.map(field => \`
                <option value="\${sanitizeHtml(field)}" \${currentField === field ? 'selected' : ''}>\${sanitizeHtml(field)}</option>
              \`).join('')}
            </select>
          </div>

          <!-- ۳. نام مدرسه -->
          <div>
            <label class="block font-bold text-purple-900 mb-1">نام مدرسه:</label>
            <input type="text" data-prop="schoolName" value="\${sanitizeHtml(s.schoolName)}" placeholder="مثال: دبیرستان علامه حلی / نمونه دولتی" class="student-field w-full p-2.5 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-purple-50/20" />
          </div>

          <!-- ۴. هفته -->
          <div>
            <label class="block font-bold text-orange-900 mb-1">هفته:</label>
            <input type="text" inputmode="numeric" data-prop="weeksPassed" value="\${sanitizeHtml(s.weeksPassed)}" placeholder="مثال: ۱ (نمایش: هفته اول)" class="student-field w-full p-2.5 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-orange-50/20 font-bold" />
          </div>

          <!-- ۵. شماره تماس -->
          <div>
            <label class="block font-bold text-cyan-900 mb-1">شماره تماس:</label>
            <input type="tel" data-prop="phone" dir="ltr" value="\${sanitizeHtml(s.phone)}" placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹" class="student-field w-full p-2.5 rounded-xl border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-cyan-50/20 font-bold text-left" />
          </div>

          <!-- ۶. مشاور ناظر -->
          <div>
            <label class="block font-bold text-indigo-900 mb-1">مشاور ناظر <span class="text-rose-500">*</span>:</label>
            <input type="text" data-prop="supervisorCounselor" value="\${sanitizeHtml(s.supervisorCounselor || '')}" placeholder="مثال: دکتر فروتن کیا" class="student-field w-full p-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-indigo-950 bg-indigo-50/20" />
          </div>

          <!-- ۷. مشاور -->
          <div>
            <label class="block font-bold text-amber-900 mb-1">مشاور <span class="text-rose-500">*</span>:</label>
            <input type="text" data-prop="counselorName" value="\${sanitizeHtml(s.counselorName)}" placeholder="مثال: دکتر فروتن کیا" class="student-field w-full p-2.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-amber-950 bg-amber-50/20" />
          </div>

          <!-- ۸. آزمون‌های آزمایشی -->
          <div>
            <label class="block font-bold text-rose-900 mb-1">آزمون‌های آزمایشی:</label>
            <input type="text" data-prop="exams" value="\${sanitizeHtml(s.exams)}" placeholder="مثال: قلم‌چی، ماز، سنجش" class="student-field w-full p-2.5 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-rose-50/20" />
          </div>

          <!-- ۹. بازه زمانی -->
          <div>
            <label class="block font-bold text-fuchsia-900 mb-1">بازه زمانی:</label>
            <input type="text" data-prop="timeframe" value="\${sanitizeHtml(s.timeframe)}" placeholder="مثال: ۱۷ آبان ۱۴۰۳ تا ۲۴ آبان ۱۴۰۳" class="student-field w-full p-2.5 rounded-xl border border-fuchsia-200 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none font-medium text-fuchsia-950 bg-fuchsia-50/20" />
          </div>

          <!-- ۱۰. توضیحات تکمیلی و نکات مهم -->
          <div class="md:col-span-2">
            <div class="flex items-center justify-between mb-1">
              <label class="block font-bold text-indigo-900">توضیحات تکمیلی و نکات مهم:</label>
              <span id="dossier-notes-counter" class="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200"></span>
            </div>
            <textarea data-prop="extraNotes" id="dossier-extra-notes-textarea" rows="5" placeholder="نکات راهبردی مشاور برای این هفته (هر نکته در یک سطر)..." class="student-field w-full p-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-xs bg-indigo-50/20 font-medium">\${sanitizeHtml(s.extraNotes)}</textarea>
          </div>
        </div>
      </div>
    \`;
  }

  function updateDossierNotesCounter() {
    const counter = document.getElementById('dossier-notes-counter');
    if (!counter || !appState || !appState.student) return;
    const text = appState.student.extraNotes || '';
    const rawLines = text.split(/\\r?\\n/).map(l => l.trim()).filter(Boolean);
    const pages = partitionStudentNotes(text, (pIdx) => getStudentPageBudget(pIdx));
    const domPages = (typeof document !== 'undefined') ? document.querySelectorAll('#pdf-pages-wrapper .page-student') : null;
    const pageCount = (domPages && domPages.length > 0) ? domPages.length : pages.length;
    const notesTextarea = document.getElementById('dossier-extra-notes-textarea');
    if (notesTextarea && document.activeElement !== notesTextarea && notesTextarea.value !== text) {
      notesTextarea.value = text;
    }
    if (rawLines.length === 0) {
      counter.textContent = 'بدون نکته';
      counter.className = 'text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200';
    } else {
      const pageInfo = pageCount > 1 ? \` (\${toPersianDigits(pageCount)} صفحه A4)\` : '';
      counter.textContent = \`\${toPersianDigits(rawLines.length)} نکته ثبت شده\${pageInfo}\`;
      counter.className = 'text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200';
    }
  }

  function bindStudentEditorEvents() {
    updateDossierNotesCounter();

    document.querySelectorAll('.student-field').forEach(input => {
      const updateField = (e) => {
        const prop = e.target.getAttribute('data-prop');
        if (prop === 'fullName') {
          appState.student.fullName = e.target.value;
          const parts = e.target.value.trim().split(/\\s+/);
          appState.student.firstName = parts[0] || '';
          appState.student.lastName = parts.slice(1).join(' ') || '';
        } else {
          appState.student[prop] = e.target.value;
        }
        if (prop === 'extraNotes') {
          resetStudentBudgets();
          updateDossierNotesCounter();
        }
        if (prop === 'fieldOfStudy') {
          resetReportBudgets();
          if (activeTab === 'report') {
            renderEditorPanel();
          }
        }
        if (prop === 'extraNotes') {
          requestPagePatch('student');
        } else {
          requestPagePatch('student');
          requestPagePatch('cover');
          requestPagePatch('planner');
          requestPagePatch('report');
        }
        debouncedSaveToLocalStorage(appState);
      };
      input.addEventListener('input', updateField);
      input.addEventListener('change', updateField);
    });
  }

  // ==================== فرم صفحه ۴: گزارش وضعیت ====================
  let humanitiesEditorActiveGrade = 'grade10';

  function renderReportEditorHtml() {
    if (isHumanitiesField(appState)) {
      return renderHumanitiesReportEditorHtml();
    }
    return renderGeneralReportEditorHtml();
  }

  function renderGeneralReportEditorHtml() {
    const books = appState.report.books;
    const canAddBook = books.length < MAX_REPORT_BOOKS;

    let html = \`
      <div class="space-y-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button type="button" id="btn-add-book" \${!canAddBook ? 'disabled' : ''} class="inline-flex items-center gap-2 px-4 py-2 rounded-lg \${canAddBook ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'} text-xs font-bold transition">
              + افزودن کتاب / منبع جدید
            </button>
            <span class="text-xs text-slate-500">(\${toPersianDigits(books.length)} منبع از حداکثر \${toPersianDigits(MAX_REPORT_BOOKS)})</span>
          </div>
        </div>

        <div class="space-y-3">
          \${books.map((book, idx) => {
            return \`
              <div class="p-4 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition shadow-2xs space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span class="book-source-badge text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2.5 py-1 rounded-lg">منبع شماره \${toPersianDigits(idx + 1)}</span>
                  \${books.length > 1 ? \`
                    <button type="button" class="btn-remove-book text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 transition" data-book-id="\${sanitizeHtml(book.id)}">حذف این منبع</button>
                  \` : \`
                    <span class="text-slate-400 text-[10px] font-normal">منبع پایه</span>
                  \`}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">نام کتاب / منبع:</label>
                    <input type="text" class="report-input-field w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" data-book-id="\${sanitizeHtml(book.id)}" data-field="name" value="\${sanitizeHtml(book.name)}" placeholder="مثال: زیست جامع خیلی سبز" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 mb-1">مباحث خوانده‌شده:</label>
                    <input type="text" class="report-input-field w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" data-book-id="\${sanitizeHtml(book.id)}" data-field="topicsCovered" value="\${sanitizeHtml(book.topicsCovered)}" placeholder="مثال: فصل ۱ و ۲ دوازدهم" />
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1 text-xs">یادداشت:</label>
                  <input type="text" class="report-input-field w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs" data-book-id="\${sanitizeHtml(book.id)}" data-field="notes" value="\${sanitizeHtml(book.notes)}" placeholder="مثال: تسلط مطلوب، مرور شکل‌ها لازم است" />
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      </div>
    \`;

    return html;
  }

  function renderHumanitiesGradeEditorTable(gradeKey, title, badgeColor) {
    const subjects = HUMANITIES_SUBJECTS[gradeKey] || [];
    const progress = (appState.report && appState.report.humanitiesProgress) || {};
    const gradeData = progress[gradeKey] || {};
    const isFarhangian = gradeKey === 'farhangian';
    const farhangianClass = isFarhangian ? 'is-farhangian' : '';
    const tableMinW = isFarhangian ? 'min-w-[540px]' : 'min-w-[1040px]';

    return \`
      <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div class="p-2.5 bg-indigo-950 text-white flex items-center justify-between text-xs font-bold border-b border-indigo-900">
          <div class="flex items-center gap-2">
            <span class="\${badgeColor} w-2 h-2 rounded-full shadow-2xs"></span>
            <span class="text-white text-xs font-bold">\${title}</span>
            <span class="text-indigo-200 text-[10.5px] font-normal">(\${toPersianDigits(subjects.length)} درس)</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="humanities-editor-table \${farhangianClass} w-full \${tableMinW} text-center text-xs divide-y divide-slate-200">
            <thead class="bg-slate-50 text-slate-800 font-bold">
              <tr class="divide-x divide-x-reverse divide-slate-200">
                <th class="py-2 px-2 w-24 min-w-[84px] bg-slate-100 text-slate-900 text-right pr-3 text-xs whitespace-nowrap font-bold">مرحله / درس</th>
                \${subjects.map(s => \`<th class="py-2 px-1 text-[11px] font-bold text-indigo-950 whitespace-nowrap min-w-[80px] sm:min-w-[88px]">\${s.name}</th>\`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 font-medium">
              \${PROGRESS_ROWS.map(row => \`
                <tr class="hover:bg-indigo-50/20 transition-colors divide-x divide-x-reverse divide-slate-200">
                  <td class="py-1.5 px-2 min-w-[84px] font-bold text-slate-700 bg-slate-50/90 text-right pr-3 text-[11px] whitespace-nowrap align-middle">\${row.label}:</td>
                  \${subjects.map(s => {
                    const val = (gradeData[s.id] && gradeData[s.id][row.key] !== undefined && gradeData[s.id][row.key] !== null) ? gradeData[s.id][row.key] : '';
                    return \`
                      <td class="p-1 min-w-[80px] sm:min-w-[88px] align-middle">
                        <textarea rows="1" style="text-align: center !important;" class="humanities-progress-input w-full p-1.5 text-center font-bold text-xs rounded-lg border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition bg-white text-indigo-950 resize-none overflow-hidden leading-snug block" data-grade="\${gradeKey}" data-subject="\${s.id}" data-row="\${row.key}" placeholder="-">\${sanitizeHtml(val)}</textarea>
                      </td>
                    \`;
                  }).join('')}
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    \`;
  }

  function renderHumanitiesReportEditorHtml() {
    let tablesHtml = '';
    if (humanitiesEditorActiveGrade === 'all') {
      tablesHtml = \`
        <div class="space-y-4">
          \${renderHumanitiesGradeEditorTable('grade10', 'پایه دهم', 'bg-amber-400')}
          \${renderHumanitiesGradeEditorTable('grade11', 'پایه یازدهم', 'bg-purple-400')}
          \${renderHumanitiesGradeEditorTable('grade12', 'پایه دوازدهم', 'bg-sky-400')}
          \${renderHumanitiesGradeEditorTable('farhangian', 'کنکور فرهنگیان', 'bg-emerald-400')}
        </div>
      \`;
    } else if (humanitiesEditorActiveGrade === 'grade11') {
      tablesHtml = renderHumanitiesGradeEditorTable('grade11', 'پایه یازدهم', 'bg-purple-400');
    } else if (humanitiesEditorActiveGrade === 'grade12') {
      tablesHtml = renderHumanitiesGradeEditorTable('grade12', 'پایه دوازدهم', 'bg-sky-400');
    } else if (humanitiesEditorActiveGrade === 'farhangian') {
      tablesHtml = renderHumanitiesGradeEditorTable('farhangian', 'کنکور فرهنگیان', 'bg-emerald-400');
    } else {
      tablesHtml = renderHumanitiesGradeEditorTable('grade10', 'پایه دهم', 'bg-amber-400');
    }

    return \`
      <div class="space-y-4">
        <!-- تب‌های انتخاب پایه تحصیلی -->
        <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button type="button" class="btn-humanities-grade-tab px-3 py-1.5 rounded-xl text-xs font-bold transition \${humanitiesEditorActiveGrade === 'grade10' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-grade="grade10">
            پایه دهم (۱۱ درس)
          </button>
          <button type="button" class="btn-humanities-grade-tab px-3 py-1.5 rounded-xl text-xs font-bold transition \${humanitiesEditorActiveGrade === 'grade11' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-grade="grade11">
            پایه یازدهم (۱۱ درس)
          </button>
          <button type="button" class="btn-humanities-grade-tab px-3 py-1.5 rounded-xl text-xs font-bold transition \${humanitiesEditorActiveGrade === 'grade12' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-grade="grade12">
            پایه دوازدهم (۱۱ درس)
          </button>
          <button type="button" class="btn-humanities-grade-tab px-3 py-1.5 rounded-xl text-xs font-bold transition \${humanitiesEditorActiveGrade === 'farhangian' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-grade="farhangian">
            کنکور فرهنگیان (۴ درس)
          </button>
          <button type="button" class="btn-humanities-grade-tab px-3 py-1.5 rounded-xl text-xs font-bold transition \${humanitiesEditorActiveGrade === 'all' ? 'bg-purple-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-grade="all">
            نمای یکپارچه (همه پایه‌ها)
          </button>
        </div>

        <div class="flex items-center gap-2 text-xs bg-amber-50/70 border border-amber-200/80 px-3.5 py-2 rounded-xl shadow-2xs">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-200/70 text-amber-900 font-bold text-xs shrink-0">↔</span>
          <span class="font-bold text-amber-950">
            برای دسترسی و ویرایش درس‌های دیگر، جدول را به چپ یا راست اسکرول کنید.
          </span>
        </div>

        <!-- جدول ویرایش پایه انتخابی -->
        \${tablesHtml}
      </div>
    \`;
  }

  function bindReportEditorEvents() {
    if (isHumanitiesField(appState)) {
      bindHumanitiesReportEditorEvents();
    } else {
      bindGeneralReportEditorEvents();
    }
  }

  function bindGeneralReportEditorEvents() {
    document.getElementById('btn-add-book')?.addEventListener('click', () => {
      resetReportBudgets();
      addBookToReport(appState);
      renderEditorPanel();
      patchPreviewPage('report');
      debouncedSaveToLocalStorage(appState);
    });

    document.querySelectorAll('.btn-remove-book').forEach(btn => {
      btn.addEventListener('click', (e) => {
        resetReportBudgets();
        const bookId = e.currentTarget.getAttribute('data-book-id');
        removeBookFromReport(appState, bookId);
        renderEditorPanel();
        patchPreviewPage('report');
        debouncedSaveToLocalStorage(appState);
      });
    });

    document.querySelectorAll('.report-input-field').forEach(input => {
      input.addEventListener('input', (e) => {
        resetReportBudgets();
        const bookId = e.target.getAttribute('data-book-id');
        const field = e.target.getAttribute('data-field');
        const book = appState.report.books.find(b => b.id === bookId);
        if (book) {
          book[field] = e.target.value;
          requestPagePatch('report');
          debouncedSaveToLocalStorage(appState);
        }
      });
    });
  }

  function syncHumanitiesRowHeight(tr) {
    if (!tr) return;
    const inputs = Array.from(tr.querySelectorAll('.humanities-progress-input'));
    if (inputs.length === 0) return;
    inputs.forEach(el => { el.style.height = 'auto'; });
    let maxH = 32;
    inputs.forEach(el => {
      if (el.value && el.value.trim() !== '') {
        if (el.scrollHeight > maxH) {
          maxH = el.scrollHeight;
        }
      }
    });
    inputs.forEach(el => {
      el.style.height = maxH + 'px';
    });
  }

  function syncAllHumanitiesRowHeights() {
    document.querySelectorAll('.humanities-editor-table tbody tr').forEach(tr => {
      syncHumanitiesRowHeight(tr);
    });
  }

  function bindHumanitiesReportEditorEvents() {
    document.querySelectorAll('.btn-humanities-grade-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const grade = e.currentTarget.getAttribute('data-grade');
        if (grade) {
          humanitiesEditorActiveGrade = grade;
          renderEditorPanel();
        }
      });
    });

    syncAllHumanitiesRowHeights();

    document.querySelectorAll('.humanities-progress-input').forEach(input => {
      input.addEventListener('input', (e) => {
        syncHumanitiesRowHeight(e.target.closest('tr'));
        resetReportBudgets();
        const grade = e.target.getAttribute('data-grade');
        const subject = e.target.getAttribute('data-subject');
        const row = e.target.getAttribute('data-row');
        if (!appState.report.humanitiesProgress) {
          appState.report.humanitiesProgress = getInitialHumanitiesProgress();
        }
        if (!appState.report.humanitiesProgress[grade]) {
          appState.report.humanitiesProgress[grade] = {};
        }
        if (!appState.report.humanitiesProgress[grade][subject]) {
          appState.report.humanitiesProgress[grade][subject] = { status: '', r1: '', r2: '', r3: '' };
        }
        appState.report.humanitiesProgress[grade][subject][row] = e.target.value;
        requestPagePatch('report');
        debouncedSaveToLocalStorage(appState);
      });
    });
  }

  // ===============================================================
  // ۶. رندر پیش‌نمایش ۴ صفحه A4
  // ===============================================================
  function getDayContentSignature(dKey, planner) {
    if (!planner || !planner.blocks) return '';
    const parts = [];
    const count = planner.rowCount || 6;
    for (let r = 0; r < count; r++) {
      const item = (planner.blocks[r] && planner.blocks[r][dKey]) || {};
      const topicStr = (item.topic !== undefined && item.topic !== null) ? String(item.topic) : '';
      const testsStr = (item.tests !== undefined && item.tests !== null) ? String(item.tests) : '';
      parts.push(\`\${topicStr}\\x00\${testsStr}\`);
    }
    return \`\${count}|\${planner.hasNightRoutine ? 1 : 0}|\${parts.join('\\x01')}\`;
  }

  let isAdjustingPlannerDom = false;
  function checkAndFixPlannerDomOverflow(pass = 0) {
    if (isAdjustingPlannerDom) return false;
    if (typeof document === 'undefined') return false;
    const container = document.getElementById('pdf-pages-wrapper');
    if (!container || typeof container.querySelectorAll !== 'function') return false;

    const plannerPages = Array.from(container.querySelectorAll('.page-planner'));
    if (!plannerPages.length) return false;

    // در صورتی که پنل پیش‌نمایش در صفحه مخفی باشد (مثلاً نمای ویرایشگر در موبایل)، اندازه‌گیری متوقف می‌شود
    const previewWrapper = document.getElementById('preview-panel-wrapper');
    if (previewWrapper && (previewWrapper.offsetParent === null || previewWrapper.style.display === 'none')) {
      return false;
    }
    if (plannerPages[0].offsetHeight === 0) return false;

    const rowCount = (appState.planner && appState.planner.rowCount) || 6;
    if (!cachedMeasuredHeights[rowCount]) {
      cachedMeasuredHeights[rowCount] = {};
    }

    let anyMeasurementChanged = false;
    const splitBeforeDays = new Set();

    // ۱. اندازه‌گیری دقیق ارتفاع تمام سطرها مستقیماً بر اساس رندر واقعی مرورگر و ثبت در کش (بدون حدس و دستکاری با perRowInc)
    plannerPages.forEach(page => {
      const rows = page.querySelectorAll('tbody tr[data-day]');
      rows.forEach(tr => {
        const dKey = tr.getAttribute('data-day');
        const rawOffsetH = tr.offsetHeight || 0;
        // اگر سطر هنوز رندر نشده باشد (ارتفاع ۰)، از ثبت مقدار نامعتبر خودداری می‌شود
        if (rawOffsetH <= 0) return;

        const domH = Math.max(88, Math.ceil(rawOffsetH));
        if (dKey && domH > 0) {
          const sig = getDayContentSignature(dKey, appState.planner);
          const oldEntry = cachedMeasuredHeights[rowCount][dKey];
          const oldH = (oldEntry && typeof oldEntry === 'object') ? oldEntry.height : (typeof oldEntry === 'number' ? oldEntry : 0);
          const oldSig = oldEntry && oldEntry.sig;
          if (oldSig !== sig || Math.abs(domH - oldH) >= 2) {
            cachedMeasuredHeights[rowCount][dKey] = { sig, height: domH };
            anyMeasurementChanged = true;
          }
        }
      });

      // بررسی سرریز صفحه چندسطری: در صورتی که صفحه بیش از ۱ سطر داشته باشد و سرریز رخ دهد، سطر آخر به صفحه بعد منتقل می‌شود
      const pageRows = Array.from(page.querySelectorAll('tbody tr[data-day]'));
      if (pageRows.length > 1) {
        const tbody = page.querySelector('tbody');
        const tbodyH = tbody ? Math.max(tbody.offsetHeight || 0, tbody.scrollHeight || 0) : 0;
        const tableWrapper = page.querySelector('.planner-table-wrapper');
        const tableWrapperH = tableWrapper ? Math.max(tableWrapper.offsetHeight || 0, tableWrapper.scrollHeight || 0) : 0;

        if (page.scrollHeight > 794 || tbodyH > 684 || tableWrapperH > 720) {
          const lastTr = pageRows[pageRows.length - 1];
          const lastDayKey = lastTr.getAttribute('data-day');
          if (lastDayKey) {
            splitBeforeDays.add(lastDayKey);
          }
        }
      }
    });

    // ۲. بررسی بازگرداندن روز بعدی به صفحه جاری (Pull-Back) در صورت وجود فضای خالی واقعی در پایین صفحه
    let canPullBackAnyDay = false;
    if (plannerPages.length > 1) {
      for (let i = 0; i < plannerPages.length - 1; i++) {
        const pCurrent = plannerPages[i];
        const pNext = plannerPages[i + 1];
        const nextFirstRow = pNext.querySelector('tbody tr[data-day]');
        if (!nextFirstRow) continue;
        const nextRowH = nextFirstRow.offsetHeight || 0;
        if (nextRowH <= 0) continue;

        const currentTbody = pCurrent.querySelector('tbody');
        const currentTbodyH = currentTbody ? currentTbody.offsetHeight : 0;
        if (currentTbodyH <= 0) continue;

        const currentRows = pCurrent.querySelectorAll('tbody tr[data-day]');
        // سقف ارتفاع مفید سطرهای جدول ۶۸۴ پیکسل است و هر صفحه حداکثر می‌تواند ۷ روز داشته باشد
        if (currentRows.length < 7 && currentTbodyH + nextRowH <= 676) {
          canPullBackAnyDay = true;
          break;
        }
      }
    }

    if (anyMeasurementChanged || splitBeforeDays.size > 0 || canPullBackAnyDay) {
      try {
        localStorage.setItem(STORAGE_KEY_MEASURED_HEIGHTS, JSON.stringify(cachedMeasuredHeights));
      } catch (e) {}

      const startDayKey = (appState.planner && appState.planner.startDay) || 'sat';
      const dayCount = (appState.planner && appState.planner.dayCount) || 7;
      const orderedDays = getOrderedDays(startDayKey, dayCount);
      const partitions = partitionPlannerDays(orderedDays, appState.planner, rowCount, splitBeforeDays.size > 0 ? splitBeforeDays : null);

      const currentDayDistribution = plannerPages.map(p => 
        Array.from(p.querySelectorAll('tbody tr[data-day]')).map(tr => tr.getAttribute('data-day')).join(',')
      ).join('|');
      const newDayDistribution = partitions.map(p => p.map(d => d.key).join(',')).join('|');

      if (currentDayDistribution !== newDayDistribution) {
        isAdjustingPlannerDom = true;
        try {
          const existingPages = Array.from(container.querySelectorAll('.page-planner'));
          if (existingPages.length > 0) {
            const newHtml = partitions.map((pageDays, pageIndex) => 
              renderSinglePlannerPageHtml(pageDays, pageIndex, partitions.length, appState)
            ).join('\\n');
            const temp = document.createElement('div');
            temp.innerHTML = newHtml;
            const newPages = Array.from(temp.children);
            if (newPages.length > 0) {
              const firstExisting = existingPages[0];
              newPages.forEach(newPage => {
                container.insertBefore(newPage, firstExisting);
              });
              existingPages.forEach(el => el.remove());
            }
          }
        } finally {
          isAdjustingPlannerDom = false;
        }

        if (pass < 2) {
          checkAndFixPlannerDomOverflow(pass + 1);
        }
        setZoom(currentZoom);
        return true;
      }
    }
    return false;
  }

  // ===============================================================
  // رفع سرریز بر اساس DOM واقعی برای صفحه ۳ (نکات و پرونده دانش‌آموز)
  // ===============================================================
  let isAdjustingStudentDom = false;
  let defaultStudentFirstPageBudget = 430;
  let defaultStudentContinuationBudget = 580;
  let studentPageBudgets = {};

  function getStudentPageBudget(pageIndex) {
    if (studentPageBudgets[pageIndex] !== undefined) {
      return studentPageBudgets[pageIndex];
    }
    return pageIndex === 0 ? defaultStudentFirstPageBudget : defaultStudentContinuationBudget;
  }

  function setStudentPageBudget(pageIndex, value) {
    studentPageBudgets[pageIndex] = value;
  }

  function resetStudentBudgets() {
    defaultStudentFirstPageBudget = 430;
    defaultStudentContinuationBudget = 580;
    studentPageBudgets = {};
  }

  function checkAndFixStudentDomOverflow(pass = 0) {
    if (isAdjustingStudentDom) return false;
    if (typeof document === 'undefined') return false;
    const container = document.getElementById('pdf-pages-wrapper');
    if (!container || typeof container.querySelectorAll !== 'function') return false;

    const studentPages = Array.from(container.querySelectorAll('.page-student'));
    if (!studentPages.length) return false;

    const previewWrapper = document.getElementById('preview-panel-wrapper');
    if (previewWrapper && (previewWrapper.offsetParent === null || previewWrapper.style.display === 'none')) {
      return false;
    }
    if (studentPages[0].offsetHeight === 0) return false;

    let anyOverflow = false;
    for (let i = 0; i < studentPages.length; i++) {
      const page = studentPages[i];
      const cards = page.querySelectorAll('.counselor-note-card');
      // بررسی سرریز بر اساس DOM واقعی مرورگر (ارتفاع استاندارد برگه A4 برابر ۷۹۴ پیکسل است)
      if (page.scrollHeight > 794) {
        if (cards.length > 1) {
          const overflow = page.scrollHeight - 794;
          anyOverflow = true;
          const currentBudget = getStudentPageBudget(i);
          const minBudget = i === 0 ? 100 : 150;
          setStudentPageBudget(i, Math.max(minBudget, currentBudget - Math.max(25, overflow + 15)));
        } else if (cards.length === 1) {
          // در صورتی که یک کارت به تنهایی موجب سرریز صفحه شود، شکستن آن در مرز کلمات انجام می‌گیرد
          const cardP = cards[0].querySelector('p');
          const noteText = cardP ? cardP.textContent.trim() : '';
          if (noteText && noteText.length > 50) {
            const mid = Math.floor(noteText.length / 2);
            const spaceIdx = noteText.indexOf(' ', mid);
            const splitAt = spaceIdx !== -1 ? spaceIdx : noteText.lastIndexOf(' ', mid);
            if (splitAt > 0) {
              const part1 = noteText.slice(0, splitAt).trim();
              const part2 = noteText.slice(splitAt + 1).trim();
              if (appState && appState.student && appState.student.extraNotes) {
                const currentExtra = appState.student.extraNotes;
                if (currentExtra.includes(noteText)) {
                  appState.student.extraNotes = currentExtra.replace(noteText, part1 + '\\n' + part2);
                  anyOverflow = true;
                } else {
                  const latinNote = toLatinDigits(noteText);
                  if (currentExtra.includes(latinNote)) {
                    const latinP1 = toLatinDigits(part1);
                    const latinP2 = toLatinDigits(part2);
                    appState.student.extraNotes = currentExtra.replace(latinNote, latinP1 + '\\n' + latinP2);
                    anyOverflow = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (anyOverflow) {
      isAdjustingStudentDom = true;
      try {
        const existingPages = Array.from(container.querySelectorAll('.page-student'));
        if (existingPages.length > 0) {
          const newHtml = renderStudentPreviewPage(appState);
          const temp = document.createElement('div');
          temp.innerHTML = newHtml;
          const newPages = Array.from(temp.children);
          if (newPages.length > 0) {
            const firstExisting = existingPages[0];
            newPages.forEach(newPage => {
              container.insertBefore(newPage, firstExisting);
            });
            existingPages.forEach(el => el.remove());
          }
        }
      } finally {
        isAdjustingStudentDom = false;
      }

      if (pass < 3) {
        checkAndFixStudentDomOverflow(pass + 1);
      }
      setZoom(currentZoom);
      updateDossierNotesCounter();
      return true;
    }
    return false;
  }

  // ===============================================================
  // رفع سرریز بر اساس DOM واقعی برای صفحه ۴ (کارنامه انسانی و عمومی)
  // ===============================================================
  let isAdjustingReportDom = false;
  let humanitiesPageBudget = 640;
  let generalReportBodyBudget = 650;

  function resetReportBudgets() {
    humanitiesPageBudget = 640;
    generalReportBodyBudget = 650;
  }

  function checkAndFixReportDomOverflow(pass = 0) {
    if (isAdjustingReportDom) return false;
    if (typeof document === 'undefined') return false;
    const container = document.getElementById('pdf-pages-wrapper');
    if (!container || typeof container.querySelectorAll !== 'function') return false;

    const reportPages = Array.from(container.querySelectorAll('.page-report'));
    if (!reportPages.length) return false;

    const previewWrapper = document.getElementById('preview-panel-wrapper');
    if (previewWrapper && (previewWrapper.offsetParent === null || previewWrapper.style.display === 'none')) {
      return false;
    }
    if (reportPages[0].offsetHeight === 0) return false;

    const isHum = isHumanitiesField(appState);
    let anyOverflow = false;

    for (let i = 0; i < reportPages.length; i++) {
      const page = reportPages[i];
      const tableRows = page.querySelectorAll('tbody tr');
      // اگر صفحه بیش از ۷۹۴ پیکسل شده باشد و قابلیت تفکیک بیشتر وجود داشته باشد
      if (page.scrollHeight > 794 && (isHum || tableRows.length > 1)) {
        const overflow = page.scrollHeight - 794;
        anyOverflow = true;
        if (isHum) {
          humanitiesPageBudget = Math.max(260, humanitiesPageBudget - Math.max(30, overflow + 20));
        } else {
          generalReportBodyBudget = Math.max(180, generalReportBodyBudget - Math.max(30, overflow + 20));
        }
      }
    }

    if (anyOverflow) {
      isAdjustingReportDom = true;
      try {
        const existingPages = Array.from(container.querySelectorAll('.page-report'));
        if (existingPages.length > 0) {
          const newHtml = renderReportPreviewPage(appState);
          const temp = document.createElement('div');
          temp.innerHTML = newHtml;
          const newPages = Array.from(temp.children);
          if (newPages.length > 0) {
            const firstExisting = existingPages[0];
            newPages.forEach(newPage => {
              container.insertBefore(newPage, firstExisting);
            });
            existingPages.forEach(el => el.remove());
          }
        }
      } finally {
        isAdjustingReportDom = false;
      }

      if (pass < 3) {
        checkAndFixReportDomOverflow(pass + 1);
      }
      setZoom(currentZoom);
      return true;
    }
    return false;
  }

  function checkAndFixAllDomOverflow() {
    let changed = false;
    if (checkAndFixPlannerDomOverflow()) changed = true;
    if (checkAndFixStudentDomOverflow()) changed = true;
    if (checkAndFixReportDomOverflow()) changed = true;
    if (changed) {
      setZoom(currentZoom);
    }
    return changed;
  }

  let patchRafId = null;
  const pendingPatchPages = new Set();
  let previewIsDirty = false;

  function patchPreviewPage(pageKey) {
    const container = document.getElementById('pdf-pages-wrapper');
    if (!container || typeof container.querySelectorAll !== 'function') return;

    // اگر کانتینر خالی باشد یا هنوز هیچ صفحه‌ای رندر نشده باشد، رندر کامل انجام می‌شود
    if (!container.querySelector('.a4-page')) {
      renderPreviewPages();
      return;
    }

    let newHtml = '';
    let selector = '';

    switch (pageKey) {
      case 'cover':
        newHtml = renderCoverPreviewPage(appState);
        selector = '.page-cover';
        break;
      case 'planner':
        newHtml = renderPlannerPreviewPage(appState);
        selector = '.page-planner';
        break;
      case 'student':
        newHtml = renderStudentPreviewPage(appState);
        selector = '.page-student';
        break;
      case 'report':
        newHtml = renderReportPreviewPage(appState);
        selector = '.page-report';
        break;
      default:
        renderPreviewPages();
        return;
    }

    const existingPages = Array.from(container.querySelectorAll(selector));
    if (existingPages.length === 0) {
      renderPreviewPages();
      return;
    }

    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    const newPages = Array.from(temp.children);
    if (newPages.length === 0) return;

    const firstExisting = existingPages[0];
    newPages.forEach(newPage => {
      container.insertBefore(newPage, firstExisting);
    });
    existingPages.forEach(el => el.remove());

    // بررسی سرریز DOM بر اساس رندر واقعی در مرورگر
    let overflowChangedDom = false;
    if (pageKey === 'planner') {
      overflowChangedDom = checkAndFixPlannerDomOverflow();
    } else if (pageKey === 'student') {
      overflowChangedDom = checkAndFixStudentDomOverflow();
    } else if (pageKey === 'report') {
      overflowChangedDom = checkAndFixReportDomOverflow();
    }

    // در صورت تغییر در تعداد صفحات (شکست یا الحاق صفحات ادامه‌دار) یا تغییر DOM توسط سرریز، مقیاس زوم به‌روز می‌شود
    const currentPages = Array.from(container.querySelectorAll(selector));
    if (overflowChangedDom || newPages.length !== existingPages.length || currentPages.length !== existingPages.length) {
      setZoom(currentZoom);
    }
    if (pageKey === 'student') {
      updateDossierNotesCounter();
    }
  }

  function requestPagePatch(pageKey) {
    pendingPatchPages.add(pageKey);

    const isMobile = typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024;
    if (isMobile && mobileView === 'editor') {
      // در نمای موبایل هنگام ویرایش، پیش‌نمایش در حالت display: none است؛ رندر تا سوییچ به تب پیش‌نمایش به تعویق می‌افتد
      previewIsDirty = true;
      return;
    }

    if (patchRafId) return;

    const executeBatch = () => {
      patchRafId = null;
      const pagesToPatch = Array.from(pendingPatchPages);
      pendingPatchPages.clear();
      for (const key of pagesToPatch) {
        patchPreviewPage(key);
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      patchRafId = requestAnimationFrame(executeBatch);
    } else {
      patchRafId = setTimeout(executeBatch, 16);
    }
  }

  function renderPreviewPages() {
    previewIsDirty = false;
    pendingPatchPages.clear();
    const container = document.getElementById('pdf-pages-wrapper');
    if (!container || typeof container.querySelectorAll !== 'function') return;

    const themeName = (appState.meta && appState.meta.theme === 'pink') ? 'pink' : 'navy';
    container.setAttribute('data-theme', themeName);
    container.classList.remove('theme-navy', 'theme-pink');
    container.classList.add(\`theme-\${themeName}\`);

    container.innerHTML = \`
      \${renderCoverPreviewPage(appState)}
      \${renderPlannerPreviewPage(appState)}
      \${renderStudentPreviewPage(appState)}
      \${renderReportPreviewPage(appState)}
    \`;
    checkAndFixAllDomOverflow();
    setZoom(currentZoom);
  }

  // -------------------------------------------------------------
  // صفحه ۱ پیش‌نمایش: طرح جلد فاخر و اصیل آکادمیک با حفظ رنگ‌های زنده و شاداب
  // -------------------------------------------------------------
  function renderCoverPreviewPage(state) {
    const student = state.student;
    const fullName = getStudentFullName(student);
    const themeName = (state.meta && state.meta.theme === 'pink') ? 'pink' : 'navy';
    const cfg = getThemeConfig(themeName);

    return \`
      <div class="a4-page page-cover theme-\${themeName} flex flex-col justify-between \${cfg.coverBg} text-white relative overflow-hidden" id="pdf-page-1">
        <!-- کادر حاشیه‌ای ظریف هندسی درون صفحه -->
        <div class="absolute inset-4 border \${cfg.coverBorder} rounded-2xl pointer-events-none"></div>

        <div class="relative z-10 flex-1 flex items-center justify-between gap-10 px-6">
          <div class="w-1/2 flex flex-col items-center text-center">
            
            <div class="mb-5 flex items-center justify-center">
              <img 
                src="\${EMBEDDED_DARK_LOGO}" 
                alt="آکادمی مشاوره دکتر فروتن کیا" 
                class="max-h-32 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
              />
            </div>

            <h1 class="text-4xl font-bold \${cfg.coverTitle} mb-2">
              برنامه مطالعاتی
            </h1>

            <h2 class="text-2xl font-bold \${cfg.coverSubtitle} tracking-wide mb-4">
              \${sanitizeHtml(formatWeekDisplay(student.weeksPassed))}
            </h2>

            <div class="w-20 h-1 \${cfg.coverDivider} mx-auto rounded-full mb-5"></div>

            <div class="cover-academic-pill inline-flex items-center gap-2.5 px-4 py-1.5 rounded-lg border \${cfg.coverPill} text-xs font-bold tracking-wide">
              <span class="text-slate-300 font-normal">سال تحصیلی:</span>
              <span class="text-white font-bold tracking-wider">
                \${sanitizeHtml(toPersianDigits(state.meta.academicYear))}
              </span>
            </div>
          </div>

          <div class="w-1/2 flex flex-col justify-center">
            <div class="\${cfg.coverCardBg} rounded-xl p-6 space-y-4">
              <div class="flex items-center justify-between border-b border-white/15 pb-2.5">
                <span class="font-peyda text-xs font-bold \${cfg.coverCardSubtitle} flex items-center gap-2">
                  <span class="\${cfg.coverCardDiamond} text-[10px]">◆</span>
                  دفترچه اختصاصی برنامه‌ریزی
                </span>
                <span class="text-[10px] \${cfg.coverCardBrand} font-mono font-bold tracking-wider">DR. FOROUTAN KIA</span>
              </div>

              <div class="border-r-4 \${cfg.coverNameBorder} pr-3.5 py-1">
                <span class="text-[10.5px] font-semibold text-slate-300 block mb-0.5">دانش‌آموز:</span>
                <div class="font-peyda text-2xl font-bold text-white text-right">
                  \${sanitizeHtml(fullName) || 'نام و نام خانوادگی'}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-white/15 text-xs">
                <div class="\${cfg.coverFieldCard} p-3 rounded-lg border shadow-2xs">
                  <span class="block text-[10.5px] font-bold mb-1">رشته تحصیلی:</span>
                  <strong class="\${cfg.coverFieldText} font-bold block text-xs truncate" title="\${sanitizeHtml(student.fieldOfStudy || '-')}">\${sanitizeHtml(student.fieldOfStudy || '-')}</strong>
                </div>
                <div class="\${cfg.coverCounselorCard} p-3 rounded-lg border shadow-2xs">
                  <span class="block text-[10.5px] font-bold mb-1">مشاور:</span>
                  <strong class="\${cfg.coverCounselorText} font-bold block text-xs truncate" title="\${sanitizeHtml(student.counselorName || '-')}">\${sanitizeHtml(student.counselorName || '-')}</strong>
                </div>
                <div class="\${cfg.coverTimeframeCard} p-3 rounded-lg border shadow-2xs">
                  <span class="block text-[10.5px] font-bold mb-1">بازه زمانی:</span>
                  <strong class="\${cfg.coverTimeframeText} font-bold block text-xs truncate" title="\${sanitizeHtml(toPersianDigits(student.timeframe)) || '-'}">\${sanitizeHtml(toPersianDigits(student.timeframe)) || '-'}</strong>
                </div>
                <div class="\${cfg.coverSchoolCard} p-3 rounded-lg border shadow-2xs">
                  <span class="block text-[10.5px] font-bold mb-1">نام مدرسه:</span>
                  <strong class="\${cfg.coverSchoolText} font-bold block text-xs truncate" title="\${sanitizeHtml(student.schoolName || '-')}">\${sanitizeHtml(student.schoolName || '-')}</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- خط زینتی پایین صفحه ۱ برای نمایش تمیز در چاپ و مانیتور -->
        <div class="cover-bottom-bar absolute bottom-0 left-0 right-0 h-[4px] z-50 pointer-events-none" style="\${cfg.coverBottomBar} -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;"></div>
      </div>
    \`;
  }

  // -------------------------------------------------------------
  // صفحه ۲ پیش‌نمایش: جدول هفتگی مطالعه (چیدمان ترنسپوز با قابلیت گسترش خودکار ارتفاع سلول‌ها و چندصفحه‌ای)
  // -------------------------------------------------------------
  function estimateDayRowHeight(dKey, planner, rowCount) {
    const sig = getDayContentSignature(dKey, planner);
    const cached = cachedMeasuredHeights[rowCount] && cachedMeasuredHeights[rowCount][dKey];
    if (cached && cached.sig === sig && cached.height > 0) {
      return cached.height;
    }

    let maxCellHeight = 78;
    const colWidth = 965 / rowCount;

    // عرض مفید درون سلول با استفاده بهینه و حداکثری از فضا
    const horizontalPadding = rowCount >= 8 ? 16 : 24;
    const usableTopicWidth = Math.max(75, colWidth - horizontalPadding);
    const usableTestWidth = Math.max(65, colWidth - (horizontalPadding - 4));

    // ابعاد نویسه‌های فونت در ضخامت بولد
    const charWidth = rowCount <= 5 ? 6.7 : (rowCount <= 7 ? 5.6 : 5.1);
    const topicCharsPerLine = Math.max(10, Math.floor(usableTopicWidth / charWidth));
    const testCharsPerLine = Math.max(10, Math.floor(usableTestWidth / charWidth));

    const topicLineHeight = rowCount <= 5 ? 18 : (rowCount <= 7 ? 17 : 15.5);
    const testLineHeight = rowCount <= 5 ? 16 : (rowCount <= 7 ? 15 : 13.5);

    for (let r = 0; r < rowCount; r++) {
      const block = (planner.blocks && planner.blocks[r]) || createEmptyBlock();
      const item = block[dKey] || { topic: '', tests: '' };
      const topic = (item.topic !== undefined && item.topic !== null) ? item.topic.toString().trim() : '';
      const tests = (item.tests !== undefined && item.tests !== null) ? item.tests.toString().trim() : '';

      let topicLines = 0;
      if (topic) {
        const explicitLines = topic.split(/\\r?\\n/);
        for (const line of explicitLines) {
          const trimmed = line.trim();
          if (!trimmed) {
            topicLines += 1;
          } else {
            const words = trimmed.split(/\\s+/);
            let currentLineLen = 0;
            let linesForThisPara = 1;
            for (const word of words) {
              const wLen = word.length;
              if (currentLineLen === 0) {
                currentLineLen = wLen;
              } else if (currentLineLen + 1 + wLen <= topicCharsPerLine) {
                currentLineLen += 1 + wLen;
              } else {
                linesForThisPara++;
                currentLineLen = wLen;
              }
            }
            topicLines += linesForThisPara;
          }
        }
      }

      let testsLines = 0;
      if (tests) {
        const explicitLines = tests.split(/\\r?\\n/);
        for (const line of explicitLines) {
          const trimmed = line.trim();
          if (!trimmed) {
            testsLines += 1;
          } else {
            const words = trimmed.split(/\\s+/);
            let currentLineLen = 0;
            let linesForThisPara = 1;
            for (const word of words) {
              const wLen = word.length;
              if (currentLineLen === 0) {
                currentLineLen = wLen;
              } else if (currentLineLen + 1 + wLen <= testCharsPerLine) {
                currentLineLen += 1 + wLen;
              } else {
                linesForThisPara++;
                currentLineLen = wLen;
              }
            }
            testsLines += linesForThisPara;
          }
        }
      }

      // ارتفاع مفید مبحث: تا ۲ خط به راحتی در ۳۸ پیکسل جا می‌شود
      const topicH = topicLines <= 2 ? 38 : (38 + (topicLines - 2) * topicLineHeight);
      // ارتفاع مفید تست: ۱ خط در ۲۲ پیکسل به راحتی جا می‌شود
      const testsH = testsLines <= 1 ? 22 : (22 + (testsLines - 1) * testLineHeight);

      // مجموع سربارهای درون کارت: پدینگ (12px) + بوردر (2px) + مارجین (3px) = 17px
      const cardContentH = Math.max(78, 17 + topicH + testsH);
      if (cardContentH > maxCellHeight) {
        maxCellHeight = cardContentH;
      }
    }

    return Math.max(88, Math.ceil(maxCellHeight + 9));
  }

  function partitionPlannerDays(orderedDays, planner, rowCount, splitBeforeDays = null) {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    // حداکثر ۷ روز در هر صفحه افقی A4 جهت حفظ تقارن و عدم سرریز عمودی
    const maxDaysPerPage = 7;
    const maxPageHeight = 684;

    for (const day of orderedDays) {
      const rowH = estimateDayRowHeight(day.key, planner, rowCount);
      const mustSplit = Boolean(splitBeforeDays && splitBeforeDays.has(day.key));

      if (currentPage.length > 0 && (mustSplit || currentPage.length >= maxDaysPerPage || currentHeight + rowH > maxPageHeight)) {
        pages.push(currentPage);
        currentPage = [day];
        currentHeight = rowH;
      } else {
        currentPage.push(day);
        currentHeight += rowH;
      }
    }
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    return pages;
  }

  function renderSinglePlannerPageHtml(pageDays, pageIndex, totalPlannerPages, state) {
    const rowCount = state.planner.rowCount;
    const dayCount = (state.planner && state.planner.dayCount) || 7;
    const hasNightRoutine = Boolean(state.planner && state.planner.hasNightRoutine);
    const dayColWidthStyle = 'width: 92px;';
    const student = state.student;
    const fullName = getStudentFullName(student) || '-';
    const themeName = (state.meta && state.meta.theme === 'pink') ? 'pink' : 'navy';
    const cfg = getThemeConfig(themeName);
    const tdPaddingClass = rowCount >= 8 ? 'p-0.5' : 'p-1';
    const cardPaddingClass = rowCount >= 8 ? 'px-1.5 py-1.5' : 'px-2 py-1.5';
    const topicFontSizeClass = rowCount <= 5 
      ? 'text-[12.5px] leading-[18px]' 
      : rowCount <= 7 
        ? 'text-[11.5px] leading-[17px]' 
        : 'text-[10.5px] leading-[15.5px]';
    const testFontSizeClass = rowCount <= 5 
      ? 'text-[12px]' 
      : rowCount <= 7 
        ? 'text-[11px]' 
        : 'text-[10.5px]';

    const pageId = pageIndex === 0 ? 'pdf-page-2' : ('pdf-page-2-part-' + (pageIndex + 1));
    const badgeLabel = totalPlannerPages > 1 ? toPersianDigits('2.' + (pageIndex + 1)) : '۲';
    const pageTitle = totalPlannerPages === 1
      ? (dayCount === 7 ? 'برنامه هفتگی مطالعه' : ('برنامه مطالعاتی (' + toPersianDigits(dayCount) + ' روزه)'))
      : (dayCount === 7 
          ? ('برنامه هفتگی مطالعه (بخش ' + toPersianDigits(pageIndex + 1) + ' از ' + toPersianDigits(totalPlannerPages) + ')')
          : ('برنامه مطالعاتی (' + toPersianDigits(dayCount) + ' روزه) - بخش ' + toPersianDigits(pageIndex + 1) + ' از ' + toPersianDigits(totalPlannerPages)));

    return \`
      <div class="a4-page page-planner theme-\${themeName} flex flex-col justify-start bg-white text-slate-900 relative" id="\${pageId}">
        <!-- سربرگ رسمی و شکیل صفحه با نشان‌های رنگی هماهنگ -->
        <div class="flex items-center justify-between \${cfg.pageHeaderBorder} pb-1 mb-1.5 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="page-badge-num w-7 h-7 rounded-lg \${cfg.pageBadge} flex items-center justify-center font-bold \${totalPlannerPages > 1 ? 'text-xs' : 'text-sm'} shadow-2xs" dir="ltr">\${badgeLabel}</div>
            <div>
              <h2 class="text-base font-bold \${cfg.pageTitleText} leading-tight">\${pageTitle}</h2>
            </div>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <div class="page-header-pill px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 flex items-center gap-1.5 shadow-2xs">
              <span class="font-bold text-blue-700 text-[10px]">دانش‌آموز:</span>
              <span class="font-bold text-xs">\${sanitizeHtml(fullName)}</span>
            </div>
            <div class="page-header-pill px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-1.5 shadow-2xs">
              <span class="font-bold text-emerald-700 text-[10px]">رشته:</span>
              <span class="font-bold text-xs">\${sanitizeHtml(student.fieldOfStudy || '-')}</span>
            </div>
            <div class="page-header-pill px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 flex items-center gap-1.5 shadow-2xs">
              <span class="font-bold text-purple-700 text-[10px]">بازه زمانی:</span>
              <span class="font-bold text-xs">\${sanitizeHtml(toPersianDigits(student.timeframe)) || '-'}</span>
            </div>
            <div class="page-header-pill px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-1.5 shadow-2xs">
              <span class="font-bold text-amber-800 text-[10px]">مشاور:</span>
              <span class="font-bold text-xs">\${sanitizeHtml(student.counselorName || '-')}</span>
            </div>
          </div>
        </div>

        <!-- جدول چیدمان هدف با ابعاد کاملاً هماهنگ و بدون کشیدگی غیرضروری -->
        <div class="planner-table-wrapper w-full \${cfg.reportTableBorder} rounded-lg overflow-hidden shadow-2xs bg-white shrink-0">
          <table class="w-full table-fixed border-collapse text-right text-xs">
            <colgroup>
              <col style="\${dayColWidthStyle}" />
              \${Array.from({ length: rowCount }).map(() => '<col />').join('')}
            </colgroup>
            <thead>
              <tr class="\${cfg.plannerTheadRow}">
                <th style="\${dayColWidthStyle}" class="\${cfg.plannerDayColTh}">روز / پارت</th>
                \${Array.from({ length: rowCount }).map((_, r) => {
                  const isLast = r === rowCount - 1;
                  const isNight = Boolean(hasNightRoutine && isLast);
                  const title = isNight ? 'روتین شبانه' : \`پارت \${toPersianDigits(r + 1)}\`;
                  const thClass = isNight ? cfg.plannerNightTh : cfg.plannerNormalTh;
                  return \`
                    <th class="\${thClass}">
                      <div class="text-xs font-bold tracking-wide text-white flex items-center justify-center gap-1">
                        \${isNight ? '<span class="text-amber-300 text-xs shrink-0">🌙</span>' : ''}
                        <span class="text-white">\${title}</span>
                      </div>
                    </th>
                  \`;
                }).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              \${pageDays.map((d) => {
                const theme = getDayTheme(d);
                return \`
                  <tr class="\${theme.rowBg} divide-x divide-x-reverse divide-slate-200" data-day="\${d.key}">
                    <!-- ستون اول: روزهای هفته به ترتیب اصلی با نشان رنگی اختصاصی -->
                    <td class="text-center font-bold text-slate-800 bg-slate-100/90 py-1.5 px-2 align-middle">
                      <span class="day-badge-pill inline-block px-3.5 py-1.5 rounded-xl \${theme.badge} font-bold text-xs shadow-xs tracking-wide">
                        \${d.label}
                      </span>
                    </td>
                    <!-- ستون‌های پارت‌های ۱ تا N با ابعاد منعطف و گسترش خودکار ارتفاع متناسب با نیاز محتوا -->
                    \${Array.from({ length: rowCount }).map((_, r) => {
                      const isLast = r === rowCount - 1;
                      const isNight = Boolean(hasNightRoutine && isLast);
                      const block = state.planner.blocks[r] || createEmptyBlock();
                      const item = block[d.key] || { topic: '', tests: '' };
                      const hasTests = item.tests !== undefined && item.tests !== null && item.tests.toString().trim() !== '';
                      const hasTopic = item.topic !== undefined && item.topic !== null && item.topic.toString().trim() !== '';
                      const cardNightClass = isNight
                        ? cfg.plannerNightCard
                        : \`\${theme.cardBg} border \${theme.border} shadow-2xs\`;
                      const testBadgeClass = (isNight && hasTests)
                        ? cfg.plannerNightTestBadge
                        : (hasTests ? \`bg-white border \${theme.testBadge} font-bold\` : '');

                      return \`
                        <td class="\${tdPaddingClass} align-middle">
                          <div class="planner-card \${cardNightClass} rounded-lg \${cardPaddingClass} transition-colors">
                            <!-- سطر ۱ درون سلول: عنوان مبحث یا نام کتاب -->
                            <div class="planner-topic-wrapper" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:100%;min-height:38px;">
                              <div class="planner-topic-text \${topicFontSizeClass}" style="text-align:center;-webkit-box-align:center;-webkit-box-pack:center;margin:0 auto;width:100%;" title="\${sanitizeHtml(item.topic)}">
                                <div class="planner-topic-inner" style="text-align:center;margin:0 auto;width:100%;">
                                  \${hasTopic ? sanitizeHtml(item.topic) : '<span class="text-slate-300 font-normal text-[10px]">-</span>'}
                                </div>
                              </div>
                            </div>
                            <!-- سطر ۲ درون سلول: نمایش مستقیم اطلاعات بخش تست با استفاده حداکثری از فضا -->
                            <div class="planner-test-bar">
                              \${hasTests ? \`
                                <span class="planner-test-badge \${testBadgeClass} px-1.5 py-0.5 rounded w-full \${testFontSizeClass} shadow-2xs" title="\${sanitizeHtml(toPersianDigits(item.tests))}">
                                  \${sanitizeHtml(toPersianDigits(item.tests))}
                                </span>
                              \` : \`
                                <span class="planner-test-badge text-slate-300 font-bold w-full \${testFontSizeClass}">-</span>
                              \`}
                            </div>
                          </div>
                        </td>
                      \`;
                    }).join('')}
                  </tr>
                \`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    \`;
  }

  function renderPlannerPreviewPage(state) {
    const rowCount = state.planner.rowCount;
    const startDayKey = (state.planner && state.planner.startDay) || 'sat';
    const dayCount = (state.planner && state.planner.dayCount) || 7;
    const orderedDays = getOrderedDays(startDayKey, dayCount);
    const pagePartitions = partitionPlannerDays(orderedDays, state.planner, rowCount);

    return pagePartitions.map((pageDays, pageIndex) => {
      return renderSinglePlannerPageHtml(pageDays, pageIndex, pagePartitions.length, state);
    }).join('\\n');
  }

  // -------------------------------------------------------------
  // صفحه ۳ پیش‌نمایش: اطلاعات تحصیلی و پرونده دانش‌آموز (با چیدمان هوشمند و صفحه‌بندی ضد سرریز)
  // -------------------------------------------------------------
  function estimateNoteItemHeight(text, isCompact = false, useTwoColumns = true) {
    if (!text) return isCompact ? 36 : 44;
    const charsPerLine = useTwoColumns ? 77 : 155;
    const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
    const baseH = isCompact ? 36 : 44;
    const lineH = isCompact ? 16 : 19;
    return baseH + (lines - 1) * lineH;
  }

  function splitTextAtWordBoundaries(text, maxChars = 350) {
    if (!text || text.length <= maxChars) return [text];
    const words = text.split(/\\s+/);
    const chunks = [];
    let current = '';

    for (const w of words) {
      if (!current) {
        current = w;
      } else if (current.length + 1 + w.length <= maxChars) {
        current += ' ' + w;
      } else {
        chunks.push(current);
        current = w;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  function estimatePageNotesHeight(slice) {
    if (!slice || slice.length === 0) return 0;
    const useTwoColumns = true;
    const isCompact = false;

    if (!useTwoColumns) {
      let total = 0;
      for (const n of slice) {
        total += estimateNoteItemHeight(n, isCompact, false) + 10;
      }
      return total;
    }

    let total = 0;
    let i = 0;
    while (i < slice.length) {
      const n1 = slice[i];
      const n2 = (i + 1 < slice.length) ? slice[i + 1] : null;
      if (n2) {
        const h1 = estimateNoteItemHeight(n1, isCompact, true);
        const h2 = estimateNoteItemHeight(n2, isCompact, true);
        total += Math.max(h1, h2) + 10;
        i += 2;
      } else {
        total += estimateNoteItemHeight(n1, isCompact, true) + 10;
        i += 1;
      }
    }
    return total;
  }

  function partitionStudentNotes(notesText, maxFirstPageH = null, maxContinuationPageH = 580) {
    if (!notesText || !notesText.trim()) {
      return [[]];
    }

    const rawLines = notesText.split(/\\r?\\n/).map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) {
      return [[]];
    }

    const notes = [];
    const rxBullet = /^(?:[۰-۹0-9]+(?:[.)](?![۰-۹0-9])|-(?![۰-۹0-9]))\\s*|[•—–]\\s*|[-*]\\s+)/;
    for (const raw of rawLines) {
      const cleaned = raw.replace(rxBullet, '').trim() || raw;
      if (cleaned.length > 350) {
        if (/[.!?؟؛]/.test(cleaned)) {
          const sentences = cleaned.split(/(?<=[.!?؟؛])\\s+/).map(s => s.trim()).filter(Boolean);
          for (const s of sentences) {
            if (s.length > 350) {
              notes.push(...splitTextAtWordBoundaries(s, 350));
            } else if (s) {
              notes.push(s);
            }
          }
        } else {
          notes.push(...splitTextAtWordBoundaries(cleaned, 350));
        }
      } else if (cleaned) {
        notes.push(cleaned);
      }
    }

    if (notes.length === 0) {
      return [[]];
    }

    const pages = [];
    let startIndex = 0;
    let pageIndex = 0;

    const getBudget = (pIdx) => {
      if (typeof maxFirstPageH === 'function') {
        return maxFirstPageH(pIdx);
      }
      return pIdx === 0 ? (maxFirstPageH || 430) : (studentPageBudgets[pIdx] || maxContinuationPageH);
    };

    while (startIndex < notes.length) {
      const limit = getBudget(pageIndex);
      const remaining = notes.slice(startIndex);

      if (estimatePageNotesHeight(remaining) <= limit) {
        pages.push(remaining);
        break;
      }

      let count = 1;
      while (count < remaining.length && estimatePageNotesHeight(remaining.slice(0, count + 1)) <= limit) {
        count++;
      }

      pages.push(remaining.slice(0, count));
      startIndex += count;
      pageIndex++;
    }

    return pages.length > 0 ? pages : [[]];
  }

  function renderStrategicNotesGrid(notes, isContinuation = false, themeName = 'navy', startOffset = 0) {
    if (!notes || notes.length === 0) {
      return \`
        <div class="py-5 text-center text-slate-400 text-xs font-medium">
          توضیحات تکمیلی و نکات مهم ثبت نشده است.
        </div>
      \`;
    }

    const cfg = getThemeConfig(themeName);
    const useTwoColumns = true;
    const paddingClass = 'p-2.5 px-3';
    const fontClass = 'text-xs leading-relaxed';
    const gridColsClass = 'grid grid-cols-2 gap-2.5';

    return \`
      <div class="\${gridColsClass}">
        \${notes.map((note, idx) => {
          const colSpanClass = '';
          return \`
            <div class="\${colSpanClass} counselor-note-card flex items-start gap-2.5 \${paddingClass} rounded-lg bg-white border \${cfg.noteCardBorder} shadow-2xs transition">
              <span class="counselor-note-num w-5 h-5 rounded-md \${cfg.noteCardNum} border text-[10px] font-bold shrink-0 mt-0.5" dir="ltr">\${toPersianDigits(startOffset + idx + 1)}</span>
              <p class="\${fontClass} font-medium text-slate-800 flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
                \${sanitizeHtml(toPersianDigits(note, true))}
              </p>
            </div>
          \`;
        }).join('')}
      </div>
    \`;
  }

  function renderStudentPreviewPage(state) {
    const s = (state && state.student) || {};
    const student = s;
    const fullName = getStudentFullName(s);
    const themeName = (state.meta && state.meta.theme === 'pink') ? 'pink' : 'navy';
    const cfg = getThemeConfig(themeName);
    const pages = partitionStudentNotes(s.extraNotes || '', (pageIdx) => getStudentPageBudget(pageIdx));
    const totalStudentPages = pages.length;
    let noteOffset = 0;

    return pages.map((pageNotes, pageIndex) => {
      const pageStart = noteOffset;
      noteOffset += (pageNotes ? pageNotes.length : 0);
      const pageId = pageIndex === 0 ? 'pdf-page-3' : ('pdf-page-3-part-' + (pageIndex + 1));
      const badgeLabel = totalStudentPages > 1 ? toPersianDigits('3.' + (pageIndex + 1)) : '۳';
      const pageTitle = totalStudentPages === 1
        ? 'اطلاعات تحصیلی و پرونده دانش‌آموز'
        : ('اطلاعات تحصیلی و پرونده دانش‌آموز (بخش ' + toPersianDigits(pageIndex + 1) + ' از ' + toPersianDigits(totalStudentPages) + ')');

      if (pageIndex === 0) {
        return \`
          <div class="a4-page page-student theme-\${themeName} flex flex-col justify-start bg-white text-slate-900 relative" id="\${pageId}">
            <!-- سربرگ رسمی و شکیل صفحه ۳ -->
            <div class="flex items-center justify-between \${cfg.pageHeaderBorder} pb-2 mb-3 shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="page-badge-num w-7 h-7 rounded-lg \${cfg.pageBadge} flex items-center justify-center font-bold \${totalStudentPages > 1 ? 'text-xs' : 'text-sm'} shadow-2xs" dir="ltr">\${badgeLabel}</div>
                <div>
                  <h2 class="text-base font-bold \${cfg.pageTitleText} leading-tight">\${pageTitle}</h2>
                </div>
              </div>
            </div>

            <!-- شبکه کارت‌های مشخصات ۱۲ ستونه با رنگ‌های زنده و خالص -->
            <div class="grid grid-cols-12 gap-2.5 mb-3 shrink-0">
              <!-- ۱. نام و نام خانوادگی (۳ ستون) -->
              <div class="col-span-3 p-2.5 rounded-lg border border-sky-300 bg-sky-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-sky-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-sky-600 shrink-0"></span>
                  نام و نام خانوادگی:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-sky-950 truncate" title="\${sanitizeHtml(fullName)}">\${sanitizeHtml(fullName) || '-'}</div>
              </div>

              <!-- ۲. رشته تحصیلی (۲ ستون) -->
              <div class="col-span-2 p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-emerald-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-emerald-600 shrink-0"></span>
                  رشته تحصیلی:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-emerald-950 truncate">\${sanitizeHtml(s.fieldOfStudy) || '-'}</div>
              </div>

              <!-- ۳. نام مدرسه (۳ ستون) -->
              <div class="col-span-3 p-2.5 rounded-lg border border-purple-300 bg-purple-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-purple-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-purple-600 shrink-0"></span>
                  نام مدرسه:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-purple-950 truncate" title="\${sanitizeHtml(s.schoolName) || '-'}">\${sanitizeHtml(s.schoolName) || '-'}</div>
              </div>

              <!-- ۴. هفته (۲ ستون) -->
              <div class="col-span-2 p-2.5 rounded-lg border border-amber-300 bg-amber-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-amber-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-amber-600 shrink-0"></span>
                  هفته:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-amber-950">\${sanitizeHtml(formatWeekDisplay(s.weeksPassed))}</div>
              </div>

              <!-- ۵. شماره تماس (۲ ستون) -->
              <div class="col-span-2 p-2.5 rounded-lg border border-cyan-300 bg-cyan-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-cyan-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-cyan-600 shrink-0"></span>
                  شماره تماس:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-cyan-950">\${s.phone ? sanitizeHtml(toPersianDigits(s.phone)) : '-'}</div>
              </div>

              <!-- ۶. مشاور ناظر (۳ ستون) -->
              <div class="col-span-3 p-2.5 rounded-lg border border-indigo-300 bg-indigo-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-indigo-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-indigo-600 shrink-0"></span>
                  مشاور ناظر:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-indigo-950 truncate" title="\${sanitizeHtml(s.supervisorCounselor || '')}">\${sanitizeHtml(s.supervisorCounselor) || '-'}</div>
              </div>

              <!-- ۷. مشاور (۳ ستون) -->
              <div class="col-span-3 p-2.5 rounded-lg border border-amber-300 bg-amber-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-amber-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-amber-600 shrink-0"></span>
                  مشاور:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-amber-950 truncate" title="\${sanitizeHtml(s.counselorName || '')}">\${sanitizeHtml(s.counselorName) || '-'}</div>
              </div>

              <!-- ۸. آزمون‌های آزمایشی (۳ ستون) -->
              <div class="col-span-3 p-2.5 rounded-lg border border-rose-300 bg-rose-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-rose-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-rose-600 shrink-0"></span>
                  آزمون‌های آزمایشی:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-rose-950 truncate" title="\${sanitizeHtml(s.exams) || '-'}">\${sanitizeHtml(s.exams) || '-'}</div>
              </div>

              <!-- ۹. بازه زمانی (۳ ستون) -->
              <div class="col-span-3 p-2.5 rounded-lg border border-fuchsia-300 bg-fuchsia-50/70 shadow-2xs min-h-[58px] flex flex-col justify-between">
                <div class="dossier-card-label text-[10.5px] text-fuchsia-800 font-bold mb-0.5 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-xs bg-fuchsia-600 shrink-0"></span>
                  بازه زمانی:
                </div>
                <div class="dossier-card-value text-[13px] font-bold text-fuchsia-950 truncate" title="\${sanitizeHtml(toPersianDigits(s.timeframe)) || '-'}">\${sanitizeHtml(toPersianDigits(s.timeframe)) || '-'}</div>
              </div>
            </div>

            <!-- کادر توصیه‌های استراتژیک مشاور با طراحی منظم و رنگ هماهنگ -->
            <div class="\${cfg.notesBoxBorder}">
              <div class="flex items-center gap-2 \${cfg.notesHeaderBorder} pb-2 mb-2 shrink-0">
                <span class="w-5 h-5 rounded-md \${cfg.notesDiamond} flex items-center justify-center text-[10px] font-bold">◆</span>
                <h3 class="text-xs font-bold \${cfg.pageTitleText}">توضیحات تکمیلی و نکات مهم</h3>
              </div>
              <div class="flex-1">
                \${renderStrategicNotesGrid(pageNotes, false, themeName, pageStart)}
              </div>
            </div>
          </div>
        \`;
      } else {
        return \`
          <div class="a4-page page-student theme-\${themeName} flex flex-col justify-start bg-white text-slate-900 relative" id="\${pageId}">
            <!-- سربرگ رسمی صفحه ادامه پرونده -->
            <div class="flex items-center justify-between \${cfg.pageHeaderBorder} pb-2 mb-3.5 shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="page-badge-num w-7 h-7 rounded-lg \${cfg.pageBadge} flex items-center justify-center font-bold text-xs shadow-2xs" dir="ltr">\${badgeLabel}</div>
                <div>
                  <h2 class="text-base font-bold \${cfg.pageTitleText} leading-tight">\${pageTitle}</h2>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="page-header-meta-pill text-[10.5px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">دانش‌آموز: <strong class="\${cfg.pagePillText} font-bold">\${sanitizeHtml(fullName) || '-'}</strong></span>
                <span class="page-header-meta-pill text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">مشاور: <strong class="\${cfg.pagePillText}">\${sanitizeHtml(s.counselorName) || '-'}</strong></span>
                <span class="page-header-meta-pill text-[9.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-md">\${sanitizeHtml(formatWeekDisplay(s.weeksPassed))}</span>
              </div>
            </div>

            <!-- کادر توصیه‌های استراتژیک مشاور -->
            <div class="\${cfg.notesBoxBorderContinuation}">
              <div class="flex items-center gap-2 \${cfg.notesHeaderBorder} pb-2 mb-3 shrink-0">
                <span class="w-5 h-5 rounded-md \${cfg.notesDiamond} flex items-center justify-center text-[10px] font-bold">◆</span>
                <h3 class="text-xs font-bold \${cfg.pageTitleText}">ادامه نکات و توصیه‌های راهبردی مشاور</h3>
              </div>
              <div class="flex-1">
                \${renderStrategicNotesGrid(pageNotes, true, themeName, pageStart)}
              </div>
            </div>
          </div>
        \`;
      }
    }).join('\\n');
  }

  // -------------------------------------------------------------
  // صفحه ۴ پیش‌نمایش: گزارش وضعیت مطالعه
  // -------------------------------------------------------------
  function partitionReportBooks(books, maxBodyHeight = 650) {
    if (!Array.isArray(books) || books.length === 0) return [[]];
    const pages = [];
    let current = [];
    let currentH = 0;

    for (const b of books) {
      const calcLines = (txt, cpl) => {
        if (!txt) return 1;
        const parts = String(txt).split(/\\r?\\n/);
        let count = 0;
        for (const p of parts) {
          count += Math.max(1, Math.ceil(p.length / cpl));
        }
        return Math.max(1, count);
      };

      const maxLines = Math.max(
        1,
        calcLines(b.name, 28),
        calcLines(b.topicsCovered, 34),
        calcLines(b.notes, 28)
      );
      const rowH = 22 + maxLines * 18;
      if (current.length > 0 && currentH + rowH > maxBodyHeight) {
        pages.push(current);
        current = [b];
        currentH = rowH;
      } else {
        current.push(b);
        currentH += rowH;
      }
    }
    if (current.length > 0) pages.push(current);
    return pages.length ? pages : [[]];
  }

  function estimateHumanitiesGradeHeight(progress, g) {
    let h = 26; // thead row
    const subjects = HUMANITIES_SUBJECTS[g] || [];
    for (const row of PROGRESS_ROWS) {
      let maxLines = 1;
      for (const s of subjects) {
        const val = (progress && progress[g] && progress[g][s.id] && progress[g][s.id][row.key] !== undefined && progress[g][s.id][row.key] !== null) ? progress[g][s.id][row.key] : '';
        const str = String(val).trim();
        if (str) {
          // عرض ستون حدود ۸.۱۸٪ (حدود ۸۵ پیکسل)، تقریباً ۱۱ کاراکتر در هر سطر
          const lines = Math.max(1, Math.ceil(str.length / 11));
          if (lines > maxLines) maxLines = lines;
        }
      }
      h += maxLines <= 1 ? 26 : (26 + (maxLines - 1) * 16);
    }
    return h;
  }

  function estimateFarhangianHeight(progress) {
    let h = 48; // thead + container margins
    const subjects = HUMANITIES_SUBJECTS.farhangian || [];
    for (const row of PROGRESS_ROWS) {
      let maxLines = 1;
      for (const s of subjects) {
        const val = (progress && progress.farhangian && progress.farhangian[s.id] && progress.farhangian[s.id][row.key] !== undefined && progress.farhangian[s.id][row.key] !== null) ? progress.farhangian[s.id][row.key] : '';
        const str = String(val).trim();
        if (str) {
          // فرهنگیان ۴ ستون با عرض ۱۹٪ دارد (حدود ۱۵۰ پیکسل)، تقریباً ۱۸ کاراکتر در سطر
          const lines = Math.max(1, Math.ceil(str.length / 18));
          if (lines > maxLines) maxLines = lines;
        }
      }
      h += maxLines <= 1 ? 26 : (26 + (maxLines - 1) * 16);
    }
    return h;
  }

  function partitionHumanitiesReport(progress, maxPageBudget = 640) {
    const h10 = estimateHumanitiesGradeHeight(progress, 'grade10');
    const h11 = estimateHumanitiesGradeHeight(progress, 'grade11');
    const h12 = estimateHumanitiesGradeHeight(progress, 'grade12');
    const hFar = estimateFarhangianHeight(progress);
    const table1Overhead = 14;
    const table1Height = table1Overhead + h10 + h11 + h12;
    const totalAll = table1Height + hFar;

    // حالت ۱: تمام جداول به راحتی روی یک صفحه جا می‌شوند
    if (totalAll <= maxPageBudget) {
      return [{ grades: ['grade10', 'grade11', 'grade12'], hasFarhangian: true }];
    }

    // حالت ۲: تفکیک هوشمند ۲ صفحه‌ای: دهم + یازدهم در صفحه ۱، دوازدهم + فرهنگیان در صفحه ۲
    const hP1 = table1Overhead + h10 + h11;
    const hP2 = table1Overhead + h12 + hFar;

    if (hP1 <= maxPageBudget && hP2 <= maxPageBudget) {
      return [
        { grades: ['grade10', 'grade11'], hasFarhangian: false },
        { grades: ['grade12'], hasFarhangian: true }
      ];
    }

    // حالت ۳: در صورتی که جدول ۱ به تنهایی روی صفحه جا شود ولی دوازدهم+فرهنگیان زیاد باشد
    if (table1Height <= maxPageBudget && hFar <= maxPageBudget) {
      return [
        { grades: ['grade10', 'grade11', 'grade12'], hasFarhangian: false },
        { grades: [], hasFarhangian: true }
      ];
    }

    // حالت ۴: تفکیک ۳ صفحه‌ای زمانی که سطرها بسیار پر باشند
    if (hP1 <= maxPageBudget) {
      return [
        { grades: ['grade10', 'grade11'], hasFarhangian: false },
        { grades: ['grade12'], hasFarhangian: false },
        { grades: [], hasFarhangian: true }
      ];
    }

    // حالت حداکثری ۴ صفحه‌ای برای متون فوق‌العاده حجیم
    return [
      { grades: ['grade10'], hasFarhangian: false },
      { grades: ['grade11'], hasFarhangian: false },
      { grades: ['grade12'], hasFarhangian: false },
      { grades: [], hasFarhangian: true }
    ];
  }

  function shouldSplitHumanitiesReport(progress) {
    const pages = partitionHumanitiesReport(progress, humanitiesPageBudget);
    return pages.length > 1;
  }

  function renderReportPreviewPage(state) {
    if (isHumanitiesField(state)) {
      return renderHumanitiesReportPreview(state);
    }
    return renderGeneralReportPreview(state);
  }

  function renderGeneralReportPreview(state) {
    const books = (state.report && state.report.books) || [];
    const student = state.student || {};
    const fullName = getStudentFullName(student) || '-';
    const themeName = (state.meta && state.meta.theme === 'pink') ? 'pink' : 'navy';
    const cfg = getThemeConfig(themeName);
    const pages = partitionReportBooks(books, generalReportBodyBudget);
    const totalReportPages = pages.length;

    let bookOffset = 0;
    return pages.map((pageBooks, pageIndex) => {
      const pageStart = bookOffset;
      bookOffset += pageBooks.length;
      const pageId = pageIndex === 0 ? 'pdf-page-4' : ('pdf-page-4-part-' + (pageIndex + 1));
      const badgeLabel = totalReportPages > 1 ? toPersianDigits('4.' + (pageIndex + 1)) : '۴';
      const pageTitle = totalReportPages === 1
        ? 'گزارش وضعیت مطالعه'
        : ('گزارش وضعیت مطالعه (بخش ' + toPersianDigits(pageIndex + 1) + ' از ' + toPersianDigits(totalReportPages) + ')');

      return \`
        <div class="a4-page page-report theme-\${themeName} flex flex-col justify-start bg-white text-slate-900 relative" id="\${pageId}">
          <div>
            <!-- سربرگ رسمی و شکیل صفحه ۴ -->
            <div class="flex items-center justify-between \${cfg.pageHeaderBorder} pb-2 mb-3">
              <div class="flex items-center gap-2.5">
                <div class="page-badge-num w-7 h-7 rounded-lg \${cfg.pageBadge} flex items-center justify-center font-bold \${totalReportPages > 1 ? 'text-xs' : 'text-sm'} shadow-2xs" dir="ltr">\${badgeLabel}</div>
                <div>
                  <h2 class="text-base font-bold \${cfg.pageTitleText} leading-tight">\${pageTitle}</h2>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="page-header-meta-pill text-[10.5px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">دانش‌آموز: <strong class="\${cfg.pagePillText} font-bold">\${sanitizeHtml(fullName)}</strong></span>
                <span class="page-header-meta-pill text-[9.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-md">\${sanitizeHtml(formatWeekDisplay(student.weeksPassed))}</span>
              </div>
            </div>

            <!-- جدول منابع و سرفصل‌ها با چیدمان استاندارد و تمیز -->
            <div class="\${cfg.reportTableBorder} rounded-lg overflow-hidden shadow-2xs mb-2.5">
              <table class="w-full table-fixed border-collapse text-right text-xs">
                <thead>
                  <tr class="\${cfg.reportThead}">
                    <th class="py-2.5 px-2 text-center w-[7%] \${cfg.reportTheadThText} font-bold text-[11px]">ردیف</th>
                    <th class="py-2.5 px-3 w-[30%] text-white font-bold text-[11px]">نام کتاب و منبع مطالعاتی</th>
                    <th class="py-2.5 px-3 w-[35%] \${cfg.reportTheadThText} font-bold text-[11px]">مباحث و فصول خوانده‌شده</th>
                    <th class="py-2.5 px-3 w-[28%] \${cfg.reportTheadThText} font-bold text-[11px]">یادداشت</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  \${pageBooks.map((b, index) => {
                    const isEven = index % 2 === 0;
                    const rowBg = isEven ? 'bg-white' : 'bg-slate-50/70';
                    const rowNumber = pageStart + index + 1;
                    return \`
                      <tr class="\${rowBg} divide-x divide-x-reverse divide-slate-200 text-xs transition-colors hover:bg-slate-50">
                        <td class="text-center font-bold text-slate-600 py-2 bg-slate-100/80">
                          <span class="counselor-note-num w-5 h-5 rounded-md inline-flex items-center justify-center bg-white border border-slate-300 text-[10.5px] font-bold text-slate-800 shadow-2xs">
                            \${toPersianDigits(rowNumber)}
                          </span>
                        </td>
                        <td class="py-2 px-3 font-bold \${cfg.reportBookName} break-words">
                          \${sanitizeHtml(b.name) || '-'}
                        </td>
                        <td class="py-2 px-3 text-slate-700 font-medium break-words">\${sanitizeHtml(b.topicsCovered) || '-'}</td>
                        <td class="py-2 px-3 text-[11px] text-slate-600 leading-snug break-words">\${sanitizeHtml(b.notes) || '-'}</td>
                      </tr>
                    \`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      \`;
    }).join('\\n');
  }

  function renderHumanitiesGradeSection(gradeKey, progress, cfg) {
    let theadClass = cfg.humanitiesG10Thead;
    let thTextClass = cfg.humanitiesG10ThText;
    let title = 'پایه دهم';
    let getStatusRowBg = (isStatus, rIdx) => isStatus ? cfg.humanitiesStatusRow : (rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/65');
    let getHeaderBg = (isStatus) => isStatus ? cfg.humanitiesStatusHeader : 'bg-slate-100/90 text-slate-700';
    let getCellTextClass = (hasVal) => hasVal ? (cfg.humanitiesStatusCell + ' bg-amber-50/60 text-[11.5px]') : 'text-slate-300 font-normal';

    if (gradeKey === 'grade11') {
      theadClass = cfg.humanitiesG11Thead;
      thTextClass = cfg.humanitiesG11ThText;
      title = 'پایه یازدهم';
      getStatusRowBg = (isStatus, rIdx) => isStatus ? 'bg-purple-50/40' : (rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/65');
      getHeaderBg = (isStatus) => isStatus ? 'bg-purple-100/85 text-purple-950' : 'bg-slate-100/90 text-slate-700';
      getCellTextClass = (hasVal) => hasVal ? 'text-purple-950 bg-amber-50/60 text-[11.5px]' : 'text-slate-300 font-normal';
    } else if (gradeKey === 'grade12') {
      theadClass = cfg.humanitiesG12Thead;
      thTextClass = cfg.humanitiesG12ThText;
      title = 'پایه دوازدهم';
      getStatusRowBg = (isStatus, rIdx) => isStatus ? cfg.humanitiesG12StatusRow : (rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/65');
      getHeaderBg = (isStatus) => isStatus ? cfg.humanitiesG12StatusHeader : 'bg-slate-100/90 text-slate-700';
      getCellTextClass = (hasVal) => hasVal ? (cfg.humanitiesG12StatusCell + ' bg-amber-50/60 text-[11.5px]') : 'text-slate-300 font-normal';
    }

    const subjects = HUMANITIES_SUBJECTS[gradeKey] || [];
    const gradeData = (progress && progress[gradeKey]) || {};

    return \`
      <thead>
        <tr class="\${theadClass}">
          <th class="py-1.5 px-1 w-[10%] text-center \${thTextClass} font-bold whitespace-nowrap text-[11px]">\${title}</th>
          \${subjects.map(s => \`
            <th class="py-1.5 px-0.5 w-[8.18%] \${thTextClass} font-bold whitespace-nowrap text-[11px]">\${s.name}</th>
          \`).join('')}
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200">
        \${PROGRESS_ROWS.map((row, rIdx) => {
          const isStatus = row.key === 'status';
          const rowBg = getStatusRowBg(isStatus, rIdx);
          const headerBg = getHeaderBg(isStatus);
          return \`
            <tr class="\${rowBg} divide-x divide-x-reverse divide-slate-200 text-[11px] leading-snug">
              <td class="py-1.5 px-1 font-bold \${headerBg}">\${row.label}</td>
              \${subjects.map(s => {
                const val = (gradeData[s.id] && gradeData[s.id][row.key] !== undefined && gradeData[s.id][row.key] !== null) ? gradeData[s.id][row.key] : '';
                const hasVal = Boolean(val !== '' && String(val).trim() !== '');
                return \`<td class="py-1.5 px-1 font-bold text-center break-words whitespace-normal align-middle \${getCellTextClass(hasVal)}">\${hasVal ? sanitizeHtml(toPersianDigits(val)) : '-'}</td>\`;
              }).join('')}
            </tr>
          \`;
        }).join('')}
      </tbody>
    \`;
  }

  function renderHumanitiesTable1Html(progress, cfg, gradesToRender = ['grade10', 'grade11', 'grade12']) {
    if (!gradesToRender || gradesToRender.length === 0) return '';
    return \`
      <!-- جدول پیشروی انسانی -->
      <div class="\${cfg.reportTableBorder} rounded-lg overflow-hidden shadow-2xs mb-3.5">
        <table class="w-full table-fixed border-collapse text-center">
          \${gradesToRender.map(g => renderHumanitiesGradeSection(g, progress, cfg)).join('')}
        </table>
      </div>
    \`;
  }

  function renderHumanitiesFarhangianTableHtml(progress, cfg, isStandalone = false) {
    const wrapClass = isStandalone ? 'flex justify-center mt-6' : 'flex justify-center mt-3';
    const boxWidthClass = isStandalone ? 'w-[75%] min-w-[500px]' : 'w-[62%] min-w-[460px]';
    return \`
      <!-- جدول ۲: کنکور فرهنگیان (مرکزچین و استاندارد) -->
      <div class="\${wrapClass}">
        <div class="\${boxWidthClass} \${cfg.humanitiesFarhangianBorder} rounded-lg overflow-hidden shadow-2xs">
          <table class="w-full table-fixed border-collapse text-center">
            <thead>
              <tr class="\${cfg.humanitiesFarhangianThead}">
                <th class="py-2 px-1.5 w-[24%] text-center \${cfg.humanitiesFarhangianThText} font-bold whitespace-nowrap text-[11px]">کنکور فرهنگیان</th>
                \${HUMANITIES_SUBJECTS.farhangian.map(s => \`
                  <th class="py-2 px-1 w-[19%] \${cfg.humanitiesFarhangianThText} font-bold whitespace-nowrap text-[11px]">\${s.name}</th>
                \`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y \${cfg.humanitiesFarhangianTbodyDivide}">
              \${PROGRESS_ROWS.map((row, rIdx) => {
                const isStatus = row.key === 'status';
                const rowBg = isStatus ? cfg.humanitiesFarhangianStatusRow : (rIdx % 2 === 0 ? 'bg-white' : cfg.humanitiesFarhangianRowAlt);
                const headerBg = isStatus ? cfg.humanitiesFarhangianStatusHeader : 'bg-slate-100/90 text-slate-700';
                return \`
                  <tr class="\${rowBg} divide-x divide-x-reverse \${cfg.humanitiesFarhangianRowDivide} text-[11px] leading-snug">
                    <td class="py-2 px-1.5 font-bold \${headerBg}">\${row.label}</td>
                    \${HUMANITIES_SUBJECTS.farhangian.map(s => {
                      const val = (progress.farhangian && progress.farhangian[s.id] && progress.farhangian[s.id][row.key] !== undefined && progress.farhangian[s.id][row.key] !== null) ? progress.farhangian[s.id][row.key] : '';
                      const hasVal = Boolean(val !== '' && String(val).trim() !== '');
                      return \`<td class="py-2 px-1 font-bold text-center break-words whitespace-normal align-middle \${hasVal ? cfg.humanitiesFarhangianCellActive + ' text-[11.5px]' : 'text-slate-300 font-normal'}">\${hasVal ? sanitizeHtml(toPersianDigits(val)) : '-'}</td>\`;
                    }).join('')}
                  </tr>
                \`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    \`;
  }

  function renderHumanitiesReportPreview(state) {
    const student = state.student || {};
    const fullName = getStudentFullName(student) || '-';
    const progress = (state.report && state.report.humanitiesProgress) || getInitialHumanitiesProgress();
    const themeName = (state.meta && state.meta.theme === 'pink') ? 'pink' : 'navy';
    const cfg = getThemeConfig(themeName);
    const pages = partitionHumanitiesReport(progress, humanitiesPageBudget);
    const totalPages = pages.length;

    return pages.map((pageCfg, idx) => {
      const pageNum = idx + 1;
      const pageId = idx === 0 ? 'pdf-page-4' : ('pdf-page-4-part-' + pageNum);
      const badgeText = totalPages > 1 ? toPersianDigits('4.' + pageNum) : '۴';
      const badgeDir = totalPages > 1 ? 'dir="ltr"' : '';
      const titleText = totalPages > 1
        ? ('گزارش وضعیت مطالعه (بخش ' + toPersianDigits(pageNum) + ' از ' + toPersianDigits(totalPages) + ')')
        : 'گزارش وضعیت مطالعه';

      const table1Html = renderHumanitiesTable1Html(progress, cfg, pageCfg.grades);
      const isStandaloneFarhangian = pageCfg.grades.length === 0;
      const farhangianHtml = pageCfg.hasFarhangian ? renderHumanitiesFarhangianTableHtml(progress, cfg, isStandaloneFarhangian) : '';

      return \`
        <div class="a4-page page-report theme-\${themeName} flex flex-col justify-start bg-white text-slate-900 relative" id="\${pageId}">
          <div>
            <!-- سربرگ رسمی و شکیل صفحه ۴ -->
            <div class="flex items-center justify-between \${cfg.pageHeaderBorder} pb-2 mb-3">
              <div class="flex items-center gap-2.5">
                <div class="page-badge-num w-7 h-7 rounded-lg \${cfg.pageBadge} flex items-center justify-center font-bold text-xs shadow-2xs" \${badgeDir}>\${badgeText}</div>
                <div>
                  <h2 class="text-base font-bold \${cfg.pageTitleText} leading-tight">\${titleText}</h2>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="page-header-meta-pill text-[10.5px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">دانش‌آموز: <strong class="\${cfg.pagePillText} font-bold">\${sanitizeHtml(fullName)}</strong></span>
                <span class="page-header-meta-pill text-[9.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-md">\${sanitizeHtml(formatWeekDisplay(student.weeksPassed))}</span>
              </div>
            </div>

            \${table1Html}
            \${farhangianHtml}
          </div>
        </div>
      \`;
    }).join('\\n');
  }

  // ==================== عملیات ذخیره، نمونه و خروجی‌ها ====================
  function handleNewPlan() {
    showConfirmModal({
      title: 'ایجاد برنامه جدید',
      message: 'آیا مایل به ایجاد برنامه مطالعاتی جدید هستید؟',
      subMessage: 'کلیه اطلاعات و پارت‌های فعلی پاک و فرم خام جایگزین خواهد شد.',
      subMessageType: 'danger',
      confirmText: 'ایجاد برنامه جدید',
      cancelText: 'انصراف',
      type: 'warning',
      icon: '📄',
      onConfirm: () => {
        cancelPendingSave();
        cachedMeasuredHeights = {};
        resetStudentBudgets();
        resetReportBudgets();
        try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
        resetPlannerCopying();
        appState = getInitialState();
        renderAll();
        showToast('برنامه مطالعاتی جدید ایجاد شد.', 'info');
      }
    });
  }

  function handleLoadSample() {
    showConfirmModal({
      title: 'بارگذاری داده‌های نمونه',
      message: 'آیا مایل به بارگذاری اطلاعات نمونه آزمایشی هستید؟',
      subMessage: 'اطلاعات برنامه فعلی با داده‌های نمونه جایگزین خواهند شد.',
      subMessageType: 'warning',
      confirmText: 'بارگذاری نمونه',
      cancelText: 'انصراف',
      type: 'info',
      icon: '✨',
      onConfirm: () => {
        cancelPendingSave();
        cachedMeasuredHeights = {};
        resetStudentBudgets();
        resetReportBudgets();
        try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
        resetPlannerCopying();
        appState = normalizeState(getSampleState());
        renderAll();
        showToast('برنامه نمونه آزمایشی با موفقیت بارگذاری شد.', 'success');
      }
    });
  }

  function handleExportJson() {
    flushPendingSave();
    try {
      appState = normalizeState(appState);
      const val = validateState(appState);
      if (!val.isValid) {
        showToast('توجه: ' + val.errors[0], 'warning');
      }
      appState.meta.updatedAt = new Date().toISOString();

      const jsonStr = JSON.stringify(appState, null, 2);
      const blob = new Blob(['\\uFEFF' + jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      const studentName = getStudentFullName(appState.student) || 'دانش‌آموز';
      const week = (appState.student.weeksPassed || '').trim();
      const parts = [studentName];
      if (week) {
        parts.push(week.startsWith('هفته') ? week : \`هفته \${week}\`);
      }
      const fileName = parts.join(' - ').replace(/[\\\\/:*?"<>|]/g, '').trim() || 'برنامه_مطالعاتی';

      a.href = url;
      a.download = \`\${fileName}.json\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('فایل JSON با موفقیت دریافت و ذخیره شد.', 'success');
    } catch (err) {
      showToast('خطا در دریافت فایل JSON: ' + err.message, 'error');
    }
  }

  function sanitizeObjectKeys(obj, maxDepth = 30) {
    if (!obj || typeof obj !== 'object') return;
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    const stack = [{ node: obj, depth: 1 }];
    const seen = new Set();

    while (stack.length > 0) {
      const { node, depth } = stack.pop();
      if (!node || typeof node !== 'object') continue;

      if (depth > maxDepth) {
        throw new Error('ساختار فایل JSON بیش از حد مجاز تودرتو است (حداکثر عمق ۳۰).');
      }

      if (seen.has(node)) continue;
      seen.add(node);

      for (const key of Object.getOwnPropertyNames(node)) {
        if (dangerous.includes(key)) {
          try {
            delete node[key];
          } catch (e) {
            try { node[key] = undefined; } catch (e2) {}
          }
        } else {
          const val = node[key];
          if (val && typeof val === 'object') {
            stack.push({ node: val, depth: depth + 1 });
          }
        }
      }
    }
  }

  function handleImportJson(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // محدودیت حجم فایل (حداکثر ۲ مگابایت جهت جلوگیری از حملات DoS و پر شدن حافظه)
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      showToast('خطا: حجم فایل انتخاب‌شده بیش از حد مجاز (حداکثر ۲ مگابایت) است.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target.result || '').replace(/^\\uFEFF/, '').trim();
        if (!text) {
          throw new Error('فایل انتخاب‌شده خالی است.');
        }

        // محدودیت تعداد کاراکتر متن JSON
        if (text.length > 2000000) {
          throw new Error('حجم محتوای فایل بیش از حد مجاز است.');
        }

        let data;
        try {
          // محافظت در برابر Prototype Pollution با حذف کلیدهای مخرب در فرآیند Parse
          data = JSON.parse(text, (key, value) => {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
              return undefined;
            }
            return value;
          });
        } catch (jsonErr) {
          throw new Error('ساختار فایل JSON معتبر نیست.');
        }

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('محتوای فایل JSON معتبر نیست.');
        }

        // پالایش عمیق کلیدهای شیء برای تضمین امنیت کامل
        sanitizeObjectKeys(data);

        if (!data.student && !data.planner && !data.report) {
          throw new Error('فایل انتخاب‌شده حاوی اطلاعات برنامه مطالعاتی نیست.');
        }

        cancelPendingSave();
        cachedMeasuredHeights = {};
        resetStudentBudgets();
        resetReportBudgets();
        try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
        resetPlannerCopying();
        appState = normalizeState(data);
        renderAll();

        const val = validateState(appState);
        if (!val.isValid) {
          showToast('برنامه بارگذاری شد، اما توجه: ' + val.errors[0], 'warning');
        } else {
          showToast('برنامه با موفقیت از فایل بارگذاری و اعمال شد.', 'success');
        }
      } catch (err) {
        showToast('خطا در بارگذاری فایل: ' + err.message, 'error');
      }
    };
    reader.onerror = () => {
      showToast('خطا در خواندن فایل انتخاب‌شده.', 'error');
    };
    reader.readAsText(file, 'utf-8');
  }

  // خروجی چاپ و ذخیره فایل PDF از طریق پنجره استاندارد مرورگر
  function handlePrintPdf() {
    if (document.body.classList.contains('is-printing')) {
      return;
    }
    flushPendingSave();
    const val = validateState(appState);
    if (!val.isValid) {
      showToast('خطا در اعتبارسنجی: ' + val.errors[0], 'error');
      return;
    }

    // ۱. اطمینان از تازه‌سازی و رندر کامل تمام ۴ صفحه در DOM
    renderPreviewPages();

    // ۲. ذخیره وضعیت زوم و نمای موبایل فعلی
    const prevZoom = currentZoom;
    const prevMobileView = mobileView;
    const pagesWrapper = document.getElementById('pdf-pages-wrapper');
    const previewWrapper = document.getElementById('preview-panel-wrapper');

    // ۳. تغییر عنوان سند جهت نام‌گذاری پیشنهادی خودکار در هنگام Save as PDF
    // فرمت استاندارد: [نام دانش‌آموز] [شماره هفته به عدد لاتین] (مثال: محمد پورهنگ 4.pdf)
    const studentName = getStudentFullName(appState.student) || 'برنامه مطالعاتی';
    const rawWeek = (appState.student.weeksPassed || '').trim();
    const latinWeek = toLatinDigits(rawWeek).replace(/[^0-9]/g, '').trim();
    const weekSuffix = latinWeek || rawWeek;
    let pdfName = weekSuffix ? (studentName + ' ' + weekSuffix) : studentName;
    pdfName = pdfName.replace(/[\\\\/:*?"<>|]/g, '').trim();
    const originalTitle = document.title;
    if (pdfName) {
      document.title = pdfName;
    }

    // ۴. اعمال کلاس آماده‌سازی چاپ و حذف موقت ترنسفورم‌ها
    document.body.classList.add('is-printing');
    if (pagesWrapper) {
      pagesWrapper.style.transform = 'none';
      pagesWrapper.style.position = '';
      pagesWrapper.style.width = '';
      pagesWrapper.style.height = '';
    }
    const parentContainer = document.getElementById('pdf-preview-container');
    if (parentContainer) {
      parentContainer.style.width = '';
      parentContainer.style.height = '';
      parentContainer.style.position = '';
    }
    if (previewWrapper) {
      previewWrapper.style.display = 'block';
    }
    if (typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024) {
      setMobileView('preview');
    }

    showToast('در حال باز کردن پنجره چاپ و ذخیره PDF...', 'info');

    // ۵. تابع پاک‌سازی و بازگردانی وضعیت برنامه پس از پایان چاپ
    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      document.body.classList.remove('is-printing');
      document.title = originalTitle;
      setZoom(prevZoom);
      if (typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth < 1024) {
        setMobileView(prevMobileView);
      } else if (previewWrapper) {
        previewWrapper.style.display = '';
      }
    };

    // ۶. فراخوانی پنجره استاندارد پرینت با مهلت کافی جهت محاسبه لی‌آوت توسط مرورگر
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('afterprint', cleanup, { once: true });
        if ('onafterprint' in window) {
          window.onafterprint = () => {
            cleanup();
            window.onafterprint = null;
          };
        }
      }

      try {
        window.print();
      } catch (err) {
        console.error('Error during window.print:', err);
      }

      // اطمینان از پاک‌سازی در صورت عدم پشتیبانی مرورگر از onafterprint
      setTimeout(cleanup, 1200);
    }, 350);
  }

  // شناسنامه و مشخصات نرم‌افزار
  if (typeof window !== 'undefined') {
    window.StudyPlannerApp = {
      name: 'Dr. Forootan Kia Study Planner',
      version: '1.0.0',
      author: 'Mohammad Shakiba',
      getState: () => appState,
      setState: (s) => {
        cachedMeasuredHeights = {};
        resetStudentBudgets();
        resetReportBudgets();
        try { localStorage.removeItem(STORAGE_KEY_MEASURED_HEIGHTS); } catch (e) {}
        appState = normalizeState(s);
        renderAll();
      },
      renderAll: () => renderAll(),
      validateState: function (s) { return validateState(arguments.length > 0 ? s : appState); },
      normalizeState: (s) => normalizeState(s),
      sanitizeObjectKeys: (o, m) => sanitizeObjectKeys(o, m),
      patchPreviewPage: (p) => patchPreviewPage(p),
      switchTab: (t) => switchTab(t),
      flushPendingSave: () => flushPendingSave(),
      cancelPendingSave: () => cancelPendingSave(),
      getCorruptBackupInfo: () => (corruptStorageBackupInfo ? { ...corruptStorageBackupInfo } : null),
      saveCurrentToLocalStorage: (s) => saveCurrentToLocalStorage(s || appState),
      pruneStorageBackups: (keep) => pruneStorageBackups(keep),
      get officialLogo() { return getOfficialLogoUri(); },
      darkLogo: EMBEDDED_DARK_LOGO,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      migrateState: (s) => migrateState(s),
      showToast: (m, t, d) => showToast(m, t, d),
      checkAndFixPlannerDomOverflow: (pass) => checkAndFixPlannerDomOverflow(pass),
      checkAndFixStudentDomOverflow: (pass) => checkAndFixStudentDomOverflow(pass),
      checkAndFixReportDomOverflow: (pass) => checkAndFixReportDomOverflow(pass),
      checkAndFixAllDomOverflow: () => checkAndFixAllDomOverflow(),
      updateDossierNotesCounter: () => updateDossierNotesCounter(),
      resetStudentBudgets: () => resetStudentBudgets(),
      resetReportBudgets: () => resetReportBudgets(),
      getStudentBudgets: () => ({
        firstPage: getStudentPageBudget(0),
        continuation: getStudentPageBudget(1),
        pageBudgets: { ...studentPageBudgets }
      }),
      getStudentPageBudget: (pIdx) => getStudentPageBudget(pIdx),
      setStudentPageBudget: (pIdx, v) => setStudentPageBudget(pIdx, v),
      getReportBudgets: () => ({ humanities: humanitiesPageBudget, general: generalReportBodyBudget }),
      setBudgetsForTest: (s, r) => {
        if (s) {
          if (s.firstPage !== undefined) {
            defaultStudentFirstPageBudget = s.firstPage;
            setStudentPageBudget(0, s.firstPage);
          }
          if (s.continuation !== undefined) {
            defaultStudentContinuationBudget = s.continuation;
            setStudentPageBudget(1, s.continuation);
          }
        }
        if (r) {
          if (r.humanities !== undefined) humanitiesPageBudget = r.humanities;
          if (r.general !== undefined) generalReportBodyBudget = r.general;
        }
      },
      partitionStudentNotes: (t, m1, m2) => partitionStudentNotes(t, m1, m2),
      estimateNoteItemHeight: (t, c, u) => estimateNoteItemHeight(t, c, u),
      partitionHumanitiesReport: (p, b) => partitionHumanitiesReport(p, b),
      shouldSplitHumanitiesReport: (p) => shouldSplitHumanitiesReport(p),
      estimateHumanitiesGradeHeight: (p, g) => estimateHumanitiesGradeHeight(p, g),
      estimateFarhangianHeight: (p) => estimateFarhangianHeight(p),
      toPersianDigits: (i, p) => toPersianDigits(i, p),
      toLatinDigits: (i) => toLatinDigits(i),
      sanitizeHtml: (s) => sanitizeHtml(s),
      generateUniqueBookId: () => generateUniqueBookId(),
      addBookToReport: (s) => addBookToReport(s),
      isZoomManuallyLocked: () => isZoomManuallyLocked,
      setZoomManuallyLocked: (val) => { isZoomManuallyLocked = Boolean(val); },
      getAutoFitZoom: () => getAutoFitZoom(),
      zoomCenter: (d, a) => zoomCenter(d, a),
      zoomAtPoint: (x, y, z) => zoomAtPoint(x, y, z),
      setZoom: (z) => setZoom(z),
      showConfirmModal: (opts) => showConfirmModal(opts),
      renderModalBody: (c, m, s, st) => renderModalBody(c, m, s, st),
      getSampleState: () => getSampleState(),
      getInitialState: () => getInitialState(),
      partitionPlannerDays: (d, p, r, s) => partitionPlannerDays(d, p, r, s),
      getCachedMeasuredHeights: () => cachedMeasuredHeights,
      copySinglePart: (d, r) => copySinglePart(d, r),
      pasteClipboardAt: (d, r) => pasteClipboardAt(d, r),
      togglePartSelection: (d, r, s) => togglePartSelection(d, r, s),
      toggleDaySelection: (d) => toggleDaySelection(d),
      togglePartColumnSelection: (r) => togglePartColumnSelection(r),
      toggleDayCopy: (d) => toggleDaySelection(d),
      togglePartColCopy: (r) => togglePartColumnSelection(r),
      copySelectedParts: (keys) => copySelectedParts(keys),
      pasteSinglePartToSelected: () => pasteSinglePartToSelected(),
      pasteToSelectedParts: () => pasteToSelectedParts(),
      getDayLabel: (k) => getDayLabel(k),
      getPartClipboard: () => ({ count: selectedParts.size, items: getSelectedPartsPayload() }),
      isCopyMode: () => isCopyMode,
      hasPushedCopyHistory: () => hasPushedCopyHistory,
      resetPlannerCopying: () => resetPlannerCopying(),
      updateClipboardBar: () => updateClipboardBar(),
      undoPastedContent: () => undoPastedContent(),
      getLastPastedUndoAction: () => (lastPastedUndoAction ? { ...lastPastedUndoAction } : null),
      getSelectedParts: () => Array.from(selectedParts),
      isMultiSelectMode: () => isMultiSelectMode,
      setMultiSelectMode: (v) => {
        isMultiSelectMode = Boolean(v);
        selectedParts.clear();
        lastSelectedCoord = null;
        updatePlannerInteractionModeVisuals();
      },
      clearDay: (dayKey, dayLabel) => handleClearDay(dayKey, dayLabel),
      clearPartColumn: (r, title) => handleClearPartColumn(r, title),
      clearSinglePart: (dayKey, r) => handleClearSinglePart(dayKey, r),
      getLastActivePlannerInput: () => lastActivePlannerInput,
      getLastActiveInputInfo: () => ({ ...lastActiveInputInfo })
    };
  }

  // ==================== راه‌اندازی (Init) ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
`;

fs.writeFileSync('js/bundle.js', code);

// همگام‌سازی و تزریق مستقیم استایل‌ها و جاوااسکریپت در فایل index.html
// این کار باعث می‌شود فایل index.html کاملاً مستقل (Standalone) و تک‌فایلی شده و روی هر موبایل یا کامپیوتری بدون مشکل CORS یا خطای مسیر فایل اجرا شود
const styleCss = fs.readFileSync('css/style.css', 'utf8');
let inlinedStyle = styleCss;

// تبدیل خودکار تمام فونت‌های محلی woff2 به Data URI برای ایجاد فایل Standalone و کارکرد 100% آفلاین
inlinedStyle = inlinedStyle.replace(/url\(['"]\.\.?\/assets\/fonts\/([^'"]+)['"]\)/g, (match, filename) => {
  const fontFile = path.join(__dirname, 'assets', 'fonts', filename);
  if (fs.existsSync(fontFile)) {
    const ext = path.extname(filename).replace('.', '');
    const mime = ext === 'woff2' ? 'font/woff2' : 'font/woff';
    const b64 = fs.readFileSync(fontFile).toString('base64');
    return `url('data:${mime};base64,${b64}')`;
  }
  return match;
});

let html = fs.readFileSync('index.html', 'utf8');

// جایگزینی آیکون با Data URI برای ایجاد فایل Standalone و جلوگیری از شکستن آیکون در اجرای بدون پوشه assets
html = html.replace(/<link\s+rel=["'](?:shortcut\s+)?icon["'][^>]*>/i, () => `<link rel="icon" type="image/png" href="${originalLogoDataUri}">`);

if (html.includes('<style id="custom-app-styles">')) {
  html = html.replace(/<style id="custom-app-styles">[\s\S]*?<\/style>/, () => '<style id="custom-app-styles">\n' + inlinedStyle + '\n  </style>');
} else if (html.includes('<link rel="stylesheet" href="./css/style.css">')) {
  html = html.replace('<link rel="stylesheet" href="./css/style.css">', () => '<style id="custom-app-styles">\n' + inlinedStyle + '\n  </style>');
}

if (html.includes('<script id="custom-app-bundle">')) {
  html = html.replace(/<script id="custom-app-bundle">[\s\S]*?<\/script>/, () => '<script id="custom-app-bundle">\n' + code + '\n  </script>');
} else if (html.includes('<script src="./js/bundle.js"></script>')) {
  html = html.replace('<script src="./js/bundle.js"></script>', () => '<script id="custom-app-bundle">\n' + code + '\n  </script>');
}

fs.writeFileSync('index.html', html);
console.log('Successfully re-compiled bundle.js and synced standalone index.html!');
