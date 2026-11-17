/**
 * مدیریت وضعیت برنامه مطالعاتی دانش‌آموزان
 * Student Study Planner State Management
 */

import { getDefaultJalaliRange, getDefaultAcademicYear } from './utils.js';

export const DAYS_OF_WEEK = [
  { key: 'sat', label: 'شنبه' },
  { key: 'sun', label: 'یکشنبه' },
  { key: 'mon', label: 'دوشنبه' },
  { key: 'tue', label: 'سه‌شنبه' },
  { key: 'wed', label: 'چهارشنبه' },
  { key: 'thu', label: 'پنج‌شنبه' },
  { key: 'fri', label: 'جمعه' },
];

/**
 * ایجاد ساختار خالی برای یک ردیف در جدول هفتگی
 */
export function createEmptyBlock() {
  const block = {};
  DAYS_OF_WEEK.forEach(day => {
    block[day.key] = {
      topic: '',
      tests: '',
    };
  });
  return block;
}

/**
 * ایجاد وضعیت اولیه پیش‌فرض
 */
export function getInitialState() {
  const rowCount = 6;
  const blocks = [];
  for (let i = 0; i < rowCount; i++) {
    blocks.push(createEmptyBlock());
  }

  return {
    meta: {
      id: `plan_${Date.now()}`,
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      academicYear: getDefaultAcademicYear(),
      theme: 'navy',
      logoUrl: null, // در صورت نال بودن، لوگوی پیش‌فرض وکتور نمایش داده می‌شود
      logoBase64: null,
    },
    student: {
      firstName: '',
      lastName: '',
      schoolName: '',
      exams: 'قلم‌چی',
      phone: '',
      counselorName: 'دکتر فروتن کیا',
      fieldOfStudy: 'علوم تجربی',
      weeksPassed: '۱',
      timeframe: getDefaultJalaliRange(),
      extraNotes: '۱. مطالعه دقیق کتاب درسی و درسنامه پیش از شروع تست‌زنی الزامی است.\n۲. تحلیل آزمون‌ها در روزهای جمعه بلافاصله پس از دریافت کارنامه انجام شود.\n۳. تست‌های نشان‌دار هفته‌های گذشته در روز پنج‌شنبه مرور گردند.',
    },
    planner: {
      rowCount: rowCount, // بین ۳ تا ۹
      blocks: blocks,
    },
    report: {
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

/**
 * داده‌های نمونه برای آزمایش فوری و نمایش کامل
 */
export function getSampleState() {
  const state = getInitialState();
  state.student = {
    firstName: 'علیرضا',
    lastName: 'محمدی',
    schoolName: 'دبیرستان شهید بهشتی (تیزهوشان)',
    exams: 'آزمون‌های جامع قلم‌چی و ماز',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    counselorName: 'دکتر فروتن کیا',
    fieldOfStudy: 'علوم تجربی',
    weeksPassed: '۸',
    timeframe: '۱۷ آبان ۱۴۰۵ تا ۲۴ آبان ۱۴۰۵',
    extraNotes: '• زمان استراحت بین هر پارت مطالعه حداقل ۱۵ دقیقه رعایت شود.\n• در درس زیست‌شناسی، شکل‌های کتاب درسی با ذره‌بین بازبینی شود.\n• تحلیل تست‌های غلط در دفترچه اختصاصی خودارزیابی ثبت گردد.',
  };

  state.planner.rowCount = 6;
  state.planner.blocks = [
    {
      sat: { topic: 'زیست ۱۲: گفتار ۱ فصل ۲', tests: '۴۰' },
      sun: { topic: 'ریاضی: حل تست معادله درجه ۲', tests: '۳۰' },
      mon: { topic: 'زیست ۱۲: گفتار ۲ فصل ۲', tests: '۴۵' },
      tue: { topic: 'فیزیک: دینامیک و قوانین نیوتون', tests: '۳۵' },
      wed: { topic: 'شیمی: بازده درصدی و استوکیومتری', tests: '۴۰' },
      thu: { topic: 'زیست پایه: مرور جانوری دهم', tests: '۵۰' },
      fri: { topic: 'شرکت در آزمون آزمایشی ماز', tests: '۱۲۰' },
    },
    {
      sat: { topic: 'شیمی ۱۲: اسید و بازها', tests: '۳۰' },
      sun: { topic: 'فیزیک ۱۲: حرکت شناسی سقوط', tests: '۲۵' },
      mon: { topic: 'شیمی پایه: استوکیومتری ص ۴۰-۵۵', tests: '۳۵' },
      tue: { topic: 'ریاضی: لگاریتم و تابع نمایی', tests: '۳۰' },
      wed: { topic: 'زیست ۱۲: تست‌های ترکیبی فصل ۱ و ۲', tests: '۵۰' },
      thu: { topic: 'فیزیک: مرور مبحث الکتریسیته ساکن', tests: '۳۰' },
      fri: { topic: 'تحلیل کامل دفترچه سوالات آزمون', tests: '۰' },
    },
    {
      sat: { topic: 'فیزیک ۱۲: حل تست‌های شتاب ثابت', tests: '۲۵' },
      sun: { topic: 'زیست پایه: گوارش و جذب مواد', tests: '۳۵' },
      mon: { topic: 'ریاضی: مثلثات و دایره مثلثاتی', tests: '۲۵' },
      tue: { topic: 'زیست ۱۲: رونویسی و ترجمه ژن', tests: '۴۰' },
      wed: { topic: 'فیزیک ۱۲: مسائل اصطکاک و سطح شیب‌دار', tests: '۳۰' },
      thu: { topic: 'شیمی: مرور فرمول‌های محلول‌ها', tests: '۳۵' },
      fri: { topic: 'ثبت کارنامه در سامانه آکادمی', tests: '۰' },
    },
    {
      sat: { topic: 'عربی دوازدهم: ترجمه درس ۱ و ۲', tests: '۲۰' },
      sun: { topic: 'ادبیات: آرایه‌های استعاره و مجاز', tests: '۲۵' },
      mon: { topic: 'زبان انگلیسی: ریدینگ و کلوز تست', tests: '۲۰' },
      tue: { topic: 'دینی ۱۲: پیام آیات درس ۱ تا ۳', tests: '۲۵' },
      wed: { topic: 'عربی: قواعد تحلیل صرفی کنکور', tests: '۲۰' },
      thu: { topic: 'ادبیات: لغت و املا و قرابت معنایی', tests: '۳۰' },
      fri: { topic: 'استراحت و ورزش عصرگاهی', tests: '۰' },
    },
    {
      sat: { topic: 'ریاضی: مشتق‌پذیری و پیوستگی', tests: '۳۰' },
      sun: { topic: 'شیمی: تعادل‌های شیمیایی', tests: '۳۵' },
      mon: { topic: 'فیزیک: نوسان و امواج مکانیکی', tests: '۳۰' },
      tue: { topic: 'زیست: چرخه سلولی و میوز', tests: '۴۵' },
      wed: { topic: 'ریاضی: کاربرد مشتق و بهینه‌سازی', tests: '۲۵' },
      thu: { topic: 'شیمی: اسیدهای ضعیف و قوی', tests: '۳۰' },
      fri: { topic: 'جلسه تحلیل هفتگی با مشاور', tests: '۰' },
    },
    {
      sat: { topic: 'مرور تست‌های علامت‌دار روز', tests: '۱۵' },
      sun: { topic: 'یادداشت‌برداری نکات طلایی روز', tests: '۱۰' },
      mon: { topic: 'حل سریع مسائل استوکیومتری', tests: '۲۰' },
      tue: { topic: 'تست‌های زمان‌دار زیست‌شناسی', tests: '۳۰' },
      wed: { topic: 'خلاصه‌نویسی مبحث فیزیک', tests: '۱۵' },
      thu: { topic: 'جمع‌بندی نهایی و بودجه‌بندی آزمون', tests: '۴۰' },
      fri: { topic: 'بررسی هدف‌گذاری هفته آینده', tests: '۰' },
    },
  ];

  return state;
}

// ذخیره‌سازی وضعیت در LocalStorage
const STORAGE_KEY_CURRENT = 'forootan_kia_current_plan';

export function saveCurrentToLocalStorage(state) {
  try {
    state.meta.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(state));
  } catch (err) {
    console.error('خطا در ذخیره وضعیت جاری در مرورگر:', err);
  }
}

export function loadCurrentFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('خطا در خواندن وضعیت از مرورگر:', err);
    return null;
  }
}
