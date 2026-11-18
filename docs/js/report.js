/**
 * مدیریت گزارش وضعیت مطالعاتی (صفحه ۴ ویژه مشاور)
 * Study Situation Report Module (Page 4 - Counselor Only)
 */

import { toPersianDigits, toLatinDigits, sanitizeHtml } from './utils.js';

/**
 * افزودن یک کتاب / منبع جدید به لیست گزارش
 * @param {Object} state 
 */
export function addBookToReport(state) {
  const newId = 'book_' + Date.now();
  state.report.books.push({
    id: newId,
    name: '',
    topicsCovered: '',
    notes: '',
  });
}

/**
 * حذف یک کتاب از گزارش با شناسه
 * @param {Object} state 
 * @param {string} bookId 
 */
export function removeBookFromReport(state, bookId) {
  if (state.report.books.length <= 1) {
    alert('حداقل وجود یک ردیف کتاب در گزارش الزامی است.');
    return;
  }
  state.report.books = state.report.books.filter(b => b.id !== bookId);
}

/**
 * رندر فرم ویرایشگر گزارش وضعیت در پنل تنظیمات
 * @param {Object} state 
 * @returns {string}
 */
export function renderReportEditor(state) {
  const books = state.report.books;

  return `
    <div class="space-y-6">
      <!-- بنر راهنمای مشاور -->
      <div class="p-4 bg-amber-50 border-r-4 border-amber-500 rounded-xl text-amber-900 text-sm shadow-sm flex items-start gap-3">
        <svg class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <span class="font-extrabold block mb-0.5">توجه ویژه مشاور محترم:</span>
          <p class="text-xs text-amber-800 leading-relaxed">
            این بخش باید <strong>پیش از طراحی برنامه جدید</strong> توسط مشاور بر اساس گزارش‌های عملکرد واقعی دانش‌آموز تکمیل گردد تا میزان پوشش بودجه‌بندی کتب و تسلط تستی سنجیده شود.
          </p>
        </div>
      </div>

      <!-- دکمه افزودن کتاب جدید و آمار -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button type="button" id="btn-add-book" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            افزودن کتاب / منبع جدید
          </button>
          <span class="text-xs text-slate-500">(${toPersianDigits(books.length)} منبع ثبت شده)</span>
        </div>

        <div class="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
          مجموع تست‌های حل‌شده تا کنون: <strong class="text-indigo-700 font-extrabold text-sm">${toPersianDigits(totalTests)}</strong>
        </div>
      </div>

      <!-- جدول کتاب‌ها در فرم -->
      <div class="space-y-3">
        ${books.map((book, idx) => `
          <div class="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-sm space-y-3" data-book-id="${book.id}">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="text-xs font-black text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg">
                منبع شماره ${toPersianDigits(idx + 1)}
              </span>
              <button type="button" class="btn-remove-book text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 transition" data-book-id="${book.id}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                حذف این منبع
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">نام کتاب / منبع:</label>
                <input 
                  type="text" 
                  class="report-input-field w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  data-book-id="${book.id}" 
                  data-field="name" 
                  value="${sanitizeHtml(book.name)}" 
                  placeholder="مثال: زیست‌شناسی جامع خیلی سبز"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">تعداد مباحث / سرفصل‌های خوانده‌شده:</label>
                <input 
                  type="text" 
                  class="report-input-field w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  data-book-id="${book.id}" 
                  data-field="topicsCovered" 
                  value="${sanitizeHtml(book.topicsCovered)}" 
                  placeholder="مثال: فصل ۱ و ۲ دوازدهم کامل"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1 text-xs">یادداشت، ارزیابی کیفیت و درصد تسلط مشاور:</label>
              <input 
                type="text" 
                class="report-input-field w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs" 
                data-book-id="${book.id}" 
                data-field="notes" 
                value="${sanitizeHtml(book.notes)}" 
                placeholder="مثال: تسلط ۸۰٪، نیازمند مرور شکل‌ها و قیدهای کنکوری"
              />
            </div>
          </div>
        `).join('')}
      </div>

      <!-- ارزیابی کلی و استراتژی مشاور -->
      <div class="space-y-4 pt-4 border-t border-slate-200">
        <h4 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
          ارزیابی جامع و توصیه‌های کلان مشاور
        </h4>

      </div>
    </div>
  `;
}

/**
 * رندر صفحه ۴ برای پیش‌نمایش زنده و چاپ نهایی A4
 * @param {Object} state 
 * @returns {string}
 */
export function renderReportPreviewPage(state) {
  const books = state.report.books;
  const student = state.student;

  return `
    <div class="a4-page page-report flex flex-col justify-between bg-white text-slate-900 relative p-8 print:p-6" id="pdf-page-4">
      <div>
        <!-- سربرگ صفحه ۴ -->
        <div class="flex items-center justify-between border-b-2 border-indigo-900 pb-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-sm">
              ۴
            </div>
            <div>
              <h2 class="text-xl font-black text-indigo-950">گزارش وضعیت مطالعاتی دانش‌آموز</h2>
              <p class="text-xs font-semibold text-slate-500">ارزیابی تجمیعی سرفصل‌ها و تست‌های سپری‌شده پیش از برنامه جدید</p>
            </div>
          </div>
          <div class="text-left text-xs space-y-1">
            <div class="text-slate-600">
              <span class="font-bold text-slate-800">نام دانش‌آموز:</span>
              <span>${sanitizeHtml(student.firstName)} ${sanitizeHtml(student.lastName)}</span>
            </div>
            <div class="text-slate-600">
              <span class="font-bold text-slate-800">مشاور مربوطه:</span>
              <span>${sanitizeHtml(student.counselorName)}</span>
            </div>
          </div>
        </div>

        <!-- جدول تجمیعی کتاب‌ها و منابع مطالعاتی -->
        <div class="border-2 border-indigo-950 rounded-xl overflow-hidden shadow-sm mb-4">
          <table class="w-full border-collapse text-right text-xs">
            <thead>
              <tr class="bg-indigo-950 text-white font-black divide-x divide-x-reverse divide-indigo-800 text-[11px]">
                <th class="py-2.5 px-3 text-center w-12 bg-slate-900 text-amber-300">ردیف</th>
                <th class="py-2.5 px-3 w-[30%]">نام کتاب و منبع مطالعاتی</th>
                <th class="py-2.5 px-3 w-[35%]">مباحث و فصول خوانده‌شده</th>
                <th class="py-2.5 px-3 w-[28%]">یادداشت</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-300">
              ${books.map((b, index) => {
                const isEven = index % 2 === 0;
                return `
                  <tr class="${isEven ? 'bg-white' : 'bg-slate-50'} divide-x divide-x-reverse divide-slate-300 text-xs">
                    <td class="text-center font-bold text-slate-600 py-2.5 bg-slate-100">
                      ${toPersianDigits(index + 1)}
                    </td>
                    <td class="py-2.5 px-3 font-bold text-indigo-950">
                      ${sanitizeHtml(b.name) || '<span class="text-slate-300">-</span>'}
                    </td>
                    <td class="py-2.5 px-3 text-slate-700">
                      ${sanitizeHtml(b.topicsCovered) || '<span class="text-slate-300">-</span>'}
                    </td>
                    <td class="py-2.5 px-3 text-[11px] text-slate-600">
                      ${sanitizeHtml(b.notes) || '<span class="text-slate-300">-</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- کادر تأیید و امضای مشاور در انتهای صفحه ۴ -->
      <div class="mt-4 pt-3 border-t border-slate-200">
        <div class="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-xl p-3 px-5">
          <div class="text-xs text-slate-600 space-y-1">
            <div><span class="font-bold text-slate-800">مشاور ارشد تحصیلی:</span> ${sanitizeHtml(student.counselorName)}</div>
            <div class="text-[10px] text-slate-400">آکادمی تخصصی کنکور و مشاوره دکتر فروتن کیا</div>
          </div>
          <div class="text-center w-36 py-1 border border-dashed border-slate-400 rounded-lg bg-white">
            <div class="text-[10px] text-slate-400 mb-6">محل امضا و مهر مشاور</div>
            <div class="text-[9px] text-slate-300">Dr. Forootan Kia Academy</div>
          </div>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>آکادمی دکتر فروتن کیا - کارنامه وضعیت مطالعاتی منابع</span>
          <span>صفحه ۴ از ۴</span>
        </div>
      </div>
    </div>
  `;
}
