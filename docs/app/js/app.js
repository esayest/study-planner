/**
 * هسته اصلی برنامه و هماهنگ‌کننده واسط کاربری و پیش‌نمایش
 * Main Application Controller & UI Orchestrator
 */

import {
  getInitialState,
  getSampleState,
  saveCurrentToLocalStorage,
  loadCurrentFromLocalStorage,
  DAYS_OF_WEEK,
} from './state.js';
import {
  toPersianDigits,
  toLatinDigits,
  sanitizeHtml,
  showToast,
} from './utils.js';
import {
  setPlannerRowCount,
  renderPlannerEditor,
  renderPlannerPreviewPage,
} from './planner.js';
import {
  addBookToReport,
  removeBookFromReport,
  renderReportEditor,
  renderReportPreviewPage,
} from './report.js';
import { validateState } from './validation.js';
import { exportViaHtml2Pdf, exportViaBrowserPrint } from './pdf-export.js';

// وضعیت فراگیر برنامه
let appState = null;
let activeTab = 'cover'; // cover | planner | student | report | saved
let currentZoom = 0.85;

/**
 * آغاز به کار نرم‌افزار
 */
export function initApp() {
  // بارگذاری از ذخیره‌ساز محلی یا وضعیت پیش‌فرض
  const savedState = loadCurrentFromLocalStorage();
  appState = savedState || getSampleState();

  bindGlobalEvents();
  renderAll();
  showToast('سامانه برنامه‌ریزی تحصیلی آکادمی دکتر فروتن کیا آماده است.', 'info');
}

/**
 * اتصال رویدادهای سراسری
 */
function bindGlobalEvents() {
  // دکمه‌های هدر
  document.getElementById('btn-new-plan')?.addEventListener('click', handleNewPlan);
  document.getElementById('btn-load-sample')?.addEventListener('click', handleLoadSample);
  document.getElementById('btn-export-json')?.addEventListener('click', handleExportJson);
  document.getElementById('btn-import-json')?.addEventListener('click', () => {
    document.getElementById('file-input-json')?.click();
  });
  document.getElementById('file-input-json')?.addEventListener('change', handleImportJson);

  // خروجی‌های PDF
  document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
    const previewContainer = document.getElementById('pdf-preview-container');
    exportViaHtml2Pdf(appState, previewContainer);
  });
  document.getElementById('btn-print-pdf')?.addEventListener('click', () => {
    exportViaBrowserPrint(appState);
  });

  // کنترل زوم پیش‌نمایش
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => updateZoom(0.05));
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => updateZoom(-0.05));
  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => setZoom(0.85));

  // تب‌های نوار ویرایشگر
  document.querySelectorAll('.editor-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // پرش به صفحه مشخص در پیش‌نمایش
  document.querySelectorAll('.page-jump-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pageId = e.currentTarget.getAttribute('data-page-target');
      jumpToPreviewPage(pageId);
    });
  });

  // آپلود لوگوی اختصاصی
  document.getElementById('btn-upload-logo')?.addEventListener('click', () => {
    document.getElementById('file-input-logo')?.click();
  });
  document.getElementById('file-input-logo')?.addEventListener('change', handleLogoUpload);
  document.getElementById('btn-remove-logo')?.addEventListener('click', handleRemoveLogo);

  // رهگیری میانبر چاپ مرورگر (Ctrl+P / Cmd+P) و هدایت به خروجی چاپ استاندارد
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
      e.preventDefault();
      exportViaBrowserPrint(appState);
    }
  });
}

/**
 * تنظیم میزان بزرگ‌نمایی پیش‌نمایش
 */
function updateZoom(delta) {
  setZoom(Math.min(1.2, Math.max(0.4, currentZoom + delta)));
}

function setZoom(val) {
  currentZoom = Math.round(val * 100) / 100;
  const container = document.getElementById('pdf-pages-wrapper');
  if (container) {
    container.style.transform = `scale(${currentZoom})`;
    container.style.transformOrigin = 'top center';
  }
  const zoomText = document.getElementById('zoom-percentage');
  if (zoomText) {
    zoomText.textContent = `${toPersianDigits(Math.round(currentZoom * 100))}٪`;
  }
}

/**
 * جابجایی تب فعال فرم
 */
function switchTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll('.editor-tab-btn').forEach(btn => {
    const isCurrent = btn.getAttribute('data-tab') === tabName;
    if (isCurrent) {
      btn.classList.add('bg-indigo-700', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
    } else {
      btn.classList.remove('bg-indigo-700', 'text-white', 'shadow-sm');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100');
    }
  });

  renderEditorPanel();
}

/**
 * اسکرول و برجسته‌سازی صفحه خاص در پیش‌نمایش
 */
function jumpToPreviewPage(targetId) {
  if (targetId === 'all') {
    const container = document.getElementById('pdf-preview-scroll');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const pageElem = document.getElementById(targetId);
  if (pageElem) {
    pageElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * اعمال رندر مجدد کامل فرم و پیش‌نمایش
 */
export function renderAll() {
  renderEditorPanel();
  renderPreviewPages();
  saveCurrentToLocalStorage(appState);
}

/**
 * رندر پنل فرم فعال بر اساس تب
 */
function renderEditorPanel() {
  const panel = document.getElementById('editor-content-panel');
  if (!panel) return;

  switch (activeTab) {
    case 'cover':
      panel.innerHTML = renderCoverEditorHtml();
      bindCoverEditorEvents();
      break;
    case 'planner':
      panel.innerHTML = renderPlannerEditor(appState);
      bindPlannerEditorEvents();
      break;
    case 'student':
      panel.innerHTML = renderStudentEditorHtml();
      bindStudentEditorEvents();
      break;
    case 'report':
      panel.innerHTML = renderReportEditor(appState);
      bindReportEditorEvents();
      break;
    default:
      panel.innerHTML = renderCoverEditorHtml();
  }
}

/**
 * فرم تب ۱: تنظیمات جلد
 */
function renderCoverEditorHtml() {
  const hasCustomLogo = Boolean(appState.meta.logoBase64);
  return `
    <div class="space-y-6">
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <h3 class="font-black text-slate-800 text-sm mb-2 flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          لوگوی آکادمی و مرکز مشاوره
        </h3>
        <p class="text-xs text-slate-500 mb-4">
          می‌توانید تصویر آرم آکادمی خود را بارگذاری کنید. در غیر این صورت، لوگوی طلایی و رسمی آکادمی دکتر فروتن کیا به صورت خودکار درج می‌شود.
        </p>

        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 p-1 flex items-center justify-center bg-white shadow-sm overflow-hidden">
            <img 
              src="${appState.meta.logoBase64 || './assets/logo-default.svg'}" 
              alt="لوگوی آکادمی" 
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <div class="space-y-2">
            <button type="button" id="btn-upload-logo-inline" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              بارگذاری تصویر لوگو
            </button>
            ${hasCustomLogo ? `
              <button type="button" id="btn-remove-logo-inline" class="text-xs text-rose-600 hover:text-rose-800 font-semibold block transition">
                بازنشانی به لوگوی پیش‌فرض
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block font-bold text-slate-700 text-xs mb-1">عنوان اصلی جلد:</label>
          <input 
            type="text" 
            id="cover-title-input" 
            value="برنامه مطالعاتی" 
            disabled 
            class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold"
          />
          <span class="text-[10px] text-slate-400">عنوان استاندارد روی جلد درج می‌گردد.</span>
        </div>

        <div>
          <label class="block font-bold text-slate-700 text-xs mb-1">زیرعنوان جلد:</label>
          <input 
            type="text" 
            id="cover-subheading-input" 
            value="آکادمی دکتر فروتن کیا" 
            disabled 
            class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 text-xs mb-1">سال تحصیلی دانش‌آموز:</label>
          <input 
            type="text" 
            id="cover-academic-year-input" 
            value="${sanitizeHtml(appState.meta.academicYear)}" 
            placeholder="مثال: ۱۴۰۵ - ۱۴۰۶" 
            class="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-bold text-indigo-950"
          />
        </div>
      </div>
    </div>
  `;
}

function bindCoverEditorEvents() {
  document.getElementById('btn-upload-logo-inline')?.addEventListener('click', () => {
    document.getElementById('file-input-logo')?.click();
  });
  document.getElementById('btn-remove-logo-inline')?.addEventListener('click', handleRemoveLogo);

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
      renderPreviewPages();
      saveCurrentToLocalStorage(appState);
    });
  }
}

/**
 * فرم تب ۳: اطلاعات دانش‌آموز (۱۰ فیلد درخواستی)
 */
function renderStudentEditorHtml() {
  const s = appState.student;
  return `
    <div class="space-y-4">
      <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-medium">
        مشخصات زیر در شناسنامه صفحه ۳ و بخش‌هایی از سربرگ‌ها درج می‌گردد.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">
            نام <span class="text-rose-500">*</span>:
          </label>
          <input 
            type="text" 
            id="student-firstName" 
            data-prop="firstName" 
            value="${sanitizeHtml(s.firstName)}" 
            placeholder="مثال: علیرضا" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">
            نام خانوادگی <span class="text-rose-500">*</span>:
          </label>
          <input 
            type="text" 
            id="student-lastName" 
            data-prop="lastName" 
            value="${sanitizeHtml(s.lastName)}" 
            placeholder="مثال: محمدی" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">نام مدرسه:</label>
          <input 
            type="text" 
            id="student-schoolName" 
            data-prop="schoolName" 
            value="${sanitizeHtml(s.schoolName)}" 
            placeholder="مثال: دبیرستان علامه حلی / نمونه دولتی" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">رشته تحصیلی <span class="text-rose-500">*</span>:</label>
          <select 
            id="student-fieldOfStudy" 
            data-prop="fieldOfStudy" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
          >
            <option value="علوم تجربی" ${s.fieldOfStudy === 'علوم تجربی' ? 'selected' : ''}>علوم تجربی</option>
            <option value="ریاضی و فیزیک" ${s.fieldOfStudy === 'ریاضی و فیزیک' ? 'selected' : ''}>ریاضی و فیزیک</option>
            <option value="ادبیات و علوم انسانی" ${s.fieldOfStudy === 'ادبیات و علوم انسانی' ? 'selected' : ''}>ادبیات و علوم انسانی</option>
            <option value="علوم و معارف اسلامی" ${s.fieldOfStudy === 'علوم و معارف اسلامی' ? 'selected' : ''}>علوم و معارف اسلامی</option>
            <option value="هنر" ${s.fieldOfStudy === 'هنر' ? 'selected' : ''}>هنر</option>
            <option value="فنی و حرفه‌ای / منحصراً زبان" ${s.fieldOfStudy === 'فنی و حرفه‌ای / منحصراً زبان' ? 'selected' : ''}>فنی و حرفه‌ای / زبان</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">آزمون‌ها:</label>
          <input 
            type="text" 
            id="student-exams" 
            data-prop="exams" 
            value="${sanitizeHtml(s.exams)}" 
            placeholder="مثال: آزمون قلم‌چی، ماز، سنجش، گاج" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">شماره تماس:</label>
          <input 
            type="tel" 
            id="student-phone" 
            data-prop="phone" 
            value="${sanitizeHtml(s.phone)}" 
            placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">
            نام مشاور <span class="text-rose-500">*</span>:
          </label>
          <input 
            type="text" 
            id="student-counselorName" 
            data-prop="counselorName" 
            value="${sanitizeHtml(s.counselorName)}" 
            placeholder="مثال: دکتر فروتن کیا" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-900"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">تعداد هفته‌های سپری‌شده:</label>
          <input 
            type="text" 
            inputmode="numeric" 
            id="student-weeksPassed" 
            data-prop="weeksPassed" 
            value="${sanitizeHtml(s.weeksPassed)}" 
            placeholder="مثال: ۶" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">بازه زمانی برنامه مطالعاتی:</label>
          <input 
            type="text" 
            id="student-timeframe" 
            data-prop="timeframe" 
            value="${sanitizeHtml(s.timeframe)}" 
            placeholder="مثال: ۱۷ آبان ۱۴۰۳ تا ۲۴ آبان ۱۴۰۳" 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">
            توضیحات تکمیلی (توصیه‌های ویژه مشاور و نکات طلایی):
          </label>
          <textarea 
            id="student-extraNotes" 
            data-prop="extraNotes" 
            rows="4" 
            placeholder="توضیحات و توصیه‌های استراتژیک مطالعه برای دانش‌آموز..." 
            class="student-field w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-xs"
          >${sanitizeHtml(s.extraNotes)}</textarea>
        </div>
      </div>
    </div>
  `;
}

function bindStudentEditorEvents() {
  document.querySelectorAll('.student-field').forEach(input => {
    input.addEventListener('input', (e) => {
      const prop = e.target.getAttribute('data-prop');
      appState.student[prop] = e.target.value;
      renderPreviewPages();
      saveCurrentToLocalStorage(appState);
    });
  });
}

function bindPlannerEditorEvents() {
  const rowSelect = document.getElementById('planner-row-select');
  if (rowSelect) {
    rowSelect.addEventListener('change', (e) => {
      setPlannerRowCount(appState, parseInt(e.target.value, 10));
      renderAll();
    });
  }

  document.getElementById('btn-decrease-rows')?.addEventListener('click', () => {
    if (appState.planner.rowCount > 3) {
      setPlannerRowCount(appState, appState.planner.rowCount - 1);
      renderAll();
    }
  });

  document.getElementById('btn-increase-rows')?.addEventListener('click', () => {
    if (appState.planner.rowCount < 9) {
      setPlannerRowCount(appState, appState.planner.rowCount + 1);
      renderAll();
    }
  });

  document.querySelectorAll('.planner-input-topic').forEach(input => {
    input.addEventListener('input', (e) => {
      const row = parseInt(e.target.getAttribute('data-row'), 10);
      const day = e.target.getAttribute('data-day');
      appState.planner.blocks[row][day].topic = e.target.value;
      renderPreviewPages();
      saveCurrentToLocalStorage(appState);
    });
  });

  document.querySelectorAll('.planner-input-tests').forEach(input => {
    input.addEventListener('input', (e) => {
      const row = parseInt(e.target.getAttribute('data-row'), 10);
      const day = e.target.getAttribute('data-day');
      appState.planner.blocks[row][day].tests = e.target.value;
      renderPreviewPages();
      saveCurrentToLocalStorage(appState);
    });
  });
}

function bindReportEditorEvents() {
  document.getElementById('btn-add-book')?.addEventListener('click', () => {
    addBookToReport(appState);
    renderAll();
  });

  document.querySelectorAll('.btn-remove-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bookId = e.currentTarget.getAttribute('data-book-id');
      removeBookFromReport(appState, bookId);
      renderAll();
    });
  });

  document.querySelectorAll('.report-input-field').forEach(input => {
    input.addEventListener('input', (e) => {
      const bookId = e.target.getAttribute('data-book-id');
      const field = e.target.getAttribute('data-field');
      const book = appState.report.books.find(b => b.id === bookId);
      if (book) {
        book[field] = e.target.value;
        renderPreviewPages();
        saveCurrentToLocalStorage(appState);
      }
    });
  });
}

/**
 * رندر تمام ۴ صفحه در پنل پیش‌نمایش
 */
function renderPreviewPages() {
  const container = document.getElementById('pdf-pages-wrapper');
  if (!container) return;

  const page1 = renderCoverPreviewPage(appState);
  const page2 = renderPlannerPreviewPage(appState);
  const page3 = renderStudentPreviewPage(appState);
  const page4 = renderReportPreviewPage(appState);

  container.innerHTML = `
    ${page1}
    ${page2}
    ${page3}
    ${page4}
  `;
}

/**
 * صفحه ۱: جلد برنامه مطالعاتی (با اولویت زیبایی بصری و پرستیژ آکادمیک)
 */
function renderCoverPreviewPage(state) {
  const logoSrc = state.meta.logoBase64 || './assets/logo-default.svg';
  const student = state.student;
  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'دانش‌آموز گرامی';

  return `
    <div class="a4-page page-cover flex flex-col justify-between bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white relative p-12 print:p-8" id="pdf-page-1">
      <!-- کادر زینتی محیطی -->
      <div class="absolute inset-5 border-2 border-amber-400/40 rounded-2xl pointer-events-none"></div>
      <div class="absolute inset-7 border border-amber-300/20 rounded-xl pointer-events-none"></div>

      <!-- گوشه‌های زینتی -->
      <div class="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-amber-400"></div>
      <div class="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-amber-400"></div>
      <div class="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-amber-400"></div>
      <div class="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-amber-400"></div>

      <!-- بخش بالایی: لوگو و عناوین اصلی -->
      <div class="relative z-10 text-center flex flex-col items-center pt-8">
        <!-- لوگوی آکادمی -->
        <div class="w-36 h-36 rounded-full p-2 bg-gradient-to-tr from-amber-400/30 to-amber-200/10 backdrop-blur-sm border-2 border-amber-400/60 shadow-2xl flex items-center justify-center mb-6">
          <img src="${logoSrc}" alt="لوگوی آکادمی دکتر فروتن کیا" class="w-full h-full object-contain filter drop-shadow-lg" />
        </div>

        <!-- عنوان بزرگ و برجسته: برنامه مطالعاتی -->
        <h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight mb-3">
          برنامه مطالعاتی
        </h1>

        <!-- زیرعنوان: آکادمی دکتر فروتن کیا -->
        <h2 class="text-xl md:text-2xl font-black text-indigo-200 tracking-wide mb-6">
          آکادمی دکتر فروتن کیا
        </h2>

        <div class="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full mb-8"></div>

        <!-- فیلد سال تحصیلی به صورت کادر طراحی‌شده روی جلد -->
        <div class="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/50 shadow-inner">
          <span class="text-xs font-semibold text-amber-300">سال تحصیلی:</span>
          <span class="text-base font-extrabold text-white tracking-widest">
            ${sanitizeHtml(toPersianDigits(state.meta.academicYear))}
          </span>
        </div>
      </div>

      <!-- بخش میانی: کارت مشخصات دانش‌آموز روی جلد -->
      <div class="relative z-10 mx-auto w-full max-w-md">
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl text-center space-y-3">
          <div class="text-xs text-amber-300 font-semibold">دفترچه اختصاصی برنامه‌ریزی جامع و هفتگی کنکور</div>
          <div class="text-2xl font-black text-white pb-2 border-b border-white/15">
            ${sanitizeHtml(fullName)}
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs pt-1 text-slate-300">
            <div>
              <span class="text-slate-400 block text-[10px]">رشته تحصیلی:</span>
              <strong class="text-white font-bold">${sanitizeHtml(student.fieldOfStudy || '-')}</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">مشاور ناظر:</span>
              <strong class="text-amber-300 font-bold">${sanitizeHtml(student.counselorName || '-')}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش پایینی: جمله انگیزشی و پاورقی جلد -->
      <div class="relative z-10 text-center pb-6">
        <p class="text-xs text-indigo-200/80 italic max-w-sm mx-auto mb-4 font-light leading-relaxed">
          «موفقیت، مجموعه‌ای از تلاش‌های کوچک است که هر روز، پیوسته و بی‌وقفه تکرار می‌شوند.»
        </p>
        <div class="text-[10px] text-amber-400/70 tracking-widest font-medium uppercase">
          Dr. Forootan Kia Educational & Counseling Academy
        </div>
        <div class="text-[9px] text-slate-400 mt-1">صفحه ۱ از ۴</div>
      </div>
    </div>
  `;
}

/**
 * صفحه ۳: شناسنامه و اطلاعات دانش‌آموز (۱۰ فیلد به تفکیک)
 */
function renderStudentPreviewPage(state) {
  const s = state.student;
  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'بدون نام';

  return `
    <div class="a4-page page-student flex flex-col justify-between bg-white text-slate-900 relative p-8 print:p-6" id="pdf-page-3">
      <div>
        <!-- سربرگ صفحه ۳ -->
        <div class="flex items-center justify-between border-b-2 border-indigo-900 pb-3 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-sm">
              ۳
            </div>
            <div>
              <h2 class="text-xl font-black text-indigo-950">شناسنامه تحصیلی و پرونده دانش‌آموز</h2>
              <p class="text-xs font-semibold text-slate-500">اطلاعات پایه، اهداف آزمونی و دستورالعمل‌های اختصاصی مشاور</p>
            </div>
          </div>
          <div class="text-left text-xs space-y-1">
            <div class="text-slate-600">
              <span class="font-bold text-slate-800">کد پرونده:</span>
              <span class="font-mono text-indigo-900 font-bold">${toPersianDigits(state.meta.id.slice(-6))}</span>
            </div>
          </div>
        </div>

        <!-- کارت‌های شبکه‌ای ۱۰ فیلد اطلاعاتی -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
          <!-- ۱. نام -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">نام:</div>
            <div class="text-sm font-extrabold text-slate-900">${sanitizeHtml(s.firstName) || '-'}</div>
          </div>

          <!-- ۲. نام خانوادگی -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">نام خانوادگی:</div>
            <div class="text-sm font-extrabold text-slate-900">${sanitizeHtml(s.lastName) || '-'}</div>
          </div>

          <!-- ۳. رشته تحصیلی -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">رشته تحصیلی:</div>
            <div class="text-sm font-extrabold text-indigo-950">${sanitizeHtml(s.fieldOfStudy) || '-'}</div>
          </div>

          <!-- ۴. نام مدرسه -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">نام مدرسه:</div>
            <div class="text-xs font-bold text-slate-800">${sanitizeHtml(s.schoolName) || '-'}</div>
          </div>

          <!-- ۵. نام مشاور -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">نام مشاور:</div>
            <div class="text-xs font-black text-indigo-900">${sanitizeHtml(s.counselorName) || '-'}</div>
          </div>

          <!-- ۶. شماره تماس -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">شماره تماس:</div>
            <div class="text-xs font-bold text-slate-800" dir="ltr">${sanitizeHtml(toPersianDigits(s.phone)) || '-'}</div>
          </div>

          <!-- ۷. آزمون‌ها -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">آزمون‌ها:</div>
            <div class="text-xs font-bold text-slate-800">${sanitizeHtml(s.exams) || '-'}</div>
          </div>

          <!-- ۸. تعداد هفته‌های سپری‌شده -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">تعداد هفته‌های سپری‌شده:</div>
            <div class="text-xs font-black text-amber-800">${sanitizeHtml(toPersianDigits(s.weeksPassed))} هفته</div>
          </div>

          <!-- ۹. بازه زمانی برنامه مطالعاتی -->
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div class="text-[10px] text-slate-500 font-semibold mb-1">بازه زمانی برنامه:</div>
            <div class="text-xs font-bold text-indigo-900">${sanitizeHtml(toPersianDigits(s.timeframe)) || '-'}</div>
          </div>
        </div>

        <!-- ۱۰. توضیحات تکمیلی (کادر چندخطی توصیه‌های مشاور) -->
        <div class="border-2 border-indigo-900/40 rounded-2xl p-5 bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/30 shadow-sm space-y-2">
          <div class="flex items-center gap-2 border-b border-indigo-200/80 pb-2">
            <span class="w-6 h-6 rounded-lg bg-indigo-900 text-amber-400 flex items-center justify-center text-xs font-bold">
              ★
            </span>
            <h3 class="text-sm font-black text-indigo-950">توضیحات تکمیلی، اصول مطالعه و توصیه‌های استراتژیک مشاور</h3>
          </div>
          <div class="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-2 min-h-[140px]">
            ${sanitizeHtml(s.extraNotes) || 'توضیحات تکمیلی توسط مشاور ثبت نشده است.'}
          </div>
        </div>
      </div>

      <!-- پاورقی صفحه ۳ -->
      <div class="mt-4 pt-3 border-t border-slate-200">
        <div class="flex items-center justify-between text-xs text-slate-600 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
          <div>
            <span class="font-bold">تأییدیه مشاور:</span> کلیه مفاد این برنامه متناسب با شرایط علمی و روحی دانش‌آموز طراحی شده است.
          </div>
          <div class="font-bold text-indigo-900">آکادمی دکتر فروتن کیا</div>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>آکادمی دکتر فروتن کیا - پرونده تحصیلی دانش‌آموز</span>
          <span>صفحه ۳ از ۴</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * ایجاد پلن جدید و پاکسازی فرم
 */
function handleNewPlan() {
  if (confirm('آیا مایل به ایجاد برنامه جدید هستید؟ اطلاعات ذخیره‌نشده پاک خواهند شد.')) {
    appState = getInitialState();
    renderAll();
    showToast('برنامه مطالعاتی جدید ایجاد شد.', 'info');
  }
}

/**
 * بارگذاری داده‌های نمونه برای دمو و تست
 */
function handleLoadSample() {
  appState = getSampleState();
  renderAll();
  showToast('داده‌های نمونه آموزشی با موفقیت بارگذاری شدند.', 'success');
}

/**
 * برون‌بری (Export) داده‌ها در قالب فایل استاندارد JSON
 */
function handleExportJson() {
  const jsonStr = JSON.stringify(appState, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const studentName = `${appState.student.firstName || ''}_${appState.student.lastName || ''}`.trim() || 'دانش_آموز';
  a.href = url;
  a.download = `برنامه_مطالعاتی_${studentName}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('فایل JSON برنامه با موفقیت ذخیره شد.', 'success');
}

/**
 * درون‌ریزی (Import) برنامه از فایل JSON
 */
function handleImportJson(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (!data.student || !data.planner || !data.report) {
        throw new Error('فرمت فایل JSON برنامه مطالعاتی معتبر نیست.');
      }
      appState = data;
      renderAll();
      showToast('برنامه با موفقیت از فایل بارگذاری شد.', 'success');
    } catch (err) {
      showToast('خطا در خواندن فایل JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

/**
 * آپلود لوگو
 */
function handleLogoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('لطفاً یک فایل تصویری معتبر انتخاب کنید.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    appState.meta.logoBase64 = event.target.result;
    renderAll();
    showToast('تصویر لوگو با موفقیت بارگذاری شد.', 'success');
  };
  reader.readAsDataURL(file);
}

/**
 * بازنشانی به لوگوی پیش‌فرض
 */
function handleRemoveLogo() {
  appState.meta.logoBase64 = null;
  renderAll();
  showToast('لوگو به آرم پیش‌فرض آکادمی بازگردانده شد.', 'info');
}

// مقداردهی اولیه پس از بارگذاری DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
