/**
 * مدیریت جدول برنامه‌ریزی هفتگی و کنترل پویای ردیف‌ها
 * Weekly Planner Grid & Dynamic Row Control Module
 */

import { DAYS_OF_WEEK, createEmptyBlock } from './state.js';
import { toPersianDigits, toLatinDigits, sanitizeHtml } from './utils.js';

/**
 * تنظیم تعداد ردیف‌ها بین ۳ تا ۹
 * @param {Object} state 
 * @param {number} newCount 
 */
export function setPlannerRowCount(state, newCount) {
  const count = Math.min(9, Math.max(3, parseInt(newCount, 10) || 6));
  state.planner.rowCount = count;

  while (state.planner.blocks.length < count) {
    state.planner.blocks.push(createEmptyBlock());
  }
  while (state.planner.blocks.length > count) {
    state.planner.blocks.pop();
  }
}

/**
 * تنظیم تعداد روزهای برنامه بین ۲ تا ۱۴ روز
 * @param {Object} state 
 * @param {number} newDayCount 
 */
export function setPlannerDayCount(state, newDayCount) {
  const count = Math.min(14, Math.max(2, parseInt(newDayCount, 10) || 7));
  state.planner.dayCount = count;
}


/**
 * تولید HTML ویرایشگر جدول برنامه‌ریزی هفتگی در پنل فرم
 * @param {Object} state 
 * @returns {string}
 */
export function renderPlannerEditor(state) {
  const rowCount = state.planner.rowCount;

  let html = `
    <div class="space-y-6">
      <!-- نوار کنترل ردیف‌ها و خلاصه تست‌ها -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div class="flex items-center gap-3">
          <label for="planner-row-select" class="text-sm font-bold text-slate-800">
            تعداد پارت‌های مطالعه در روز:
          </label>
          <div class="inline-flex items-center gap-2">
            <button type="button" id="btn-decrease-rows" class="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center transition shadow-sm" title="کاهش یک ردیف">
              -
            </button>
            <select id="planner-row-select" class="bg-white border border-slate-300 text-slate-800 text-sm font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              ${[3, 4, 5, 6, 7, 8, 9].map(num => `
                <option value="${num}" ${num === rowCount ? 'selected' : ''}>${toPersianDigits(num)} پارت در روز</option>
              `).join('')}
            </select>
            <button type="button" id="btn-increase-rows" class="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center transition shadow-sm" title="افزایش یک ردیف">
              +
            </button>
          </div>
          <span class="text-xs text-slate-500">(محدوده مجاز: ۳ تا ۹ ردیف)</span>
        </div>

        <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-indigo-900 text-sm font-semibold">
          <span>مجموع کل تست‌های هفته:</span>
          <span class="text-indigo-600 font-extrabold text-base">${toPersianDigits(weeklyTotal)}</span>
          <span class="text-xs text-indigo-500">تست</span>
        </div>
      </div>

      <!-- تب‌های روزانه برای ویرایش راحت در موبایل/تبلت یا جدول گسترده -->
      <div class="overflow-x-auto pb-4">
        <table class="w-full text-right border-collapse border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white min-w-[760px]">
          <thead>
            <tr class="bg-indigo-900 text-white text-xs font-bold divide-x divide-x-reverse divide-indigo-800">
              <th class="py-3 px-2 text-center w-14">پارت</th>
              ${DAYS_OF_WEEK.map(day => `
                <th class="py-3 px-2 text-center w-[13.5%]">
                  <div class="text-sm font-extrabold">${day.label}</div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-xs">
  `;

  for (let r = 0; r < rowCount; r++) {
    const block = state.planner.blocks[r] || createEmptyBlock();
    const isEven = r % 2 === 0;
    const bgRow = isEven ? 'bg-white' : 'bg-slate-50/70';

    html += `
      <tr class="${bgRow} divide-x divide-x-reverse divide-slate-200">
        <td class="text-center font-bold text-slate-600 bg-slate-100/90 py-2">
          <span class="inline-block px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs">
            ${toPersianDigits(r + 1)}
          </span>
        </td>
        ${DAYS_OF_WEEK.map(day => {
          const item = block[day.key] || { topic: '', tests: '' };
          return `
            <td class="p-2 space-y-1.5 align-top">
              <div class="relative">
                <input 
                  type="text" 
                  data-row="${r}" 
                  data-day="${day.key}" 
                  data-field="topic" 
                  placeholder="مبحث / درس..." 
                  value="${sanitizeHtml(item.topic)}" 
                  class="planner-input-topic w-full text-xs p-1.5 rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition bg-white"
                />
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-slate-500 font-medium">تست:</span>
                <input 
                  type="text" 
                  inputmode="numeric"
                  data-row="${r}" 
                  data-day="${day.key}" 
                  data-field="tests" 
                  placeholder="تعداد" 
                  value="${sanitizeHtml(item.tests)}" 
                  class="planner-input-tests w-full text-xs text-center p-1 rounded border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 focus:outline-none transition font-semibold bg-amber-50/30 text-amber-900"
                />
              </div>
            </td>
          `;
        }).join('')}
      </tr>
    `;
  }

  // سطر مجموع روزانه در انتهای جدول ویرایش
  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  return html;
}

/**
 * تولید کد صفحه ۲ برای پیش‌نمایش زنده و چاپ نهایی A4
 * @param {Object} state 
 * @returns {string}
 */
export function renderPlannerPreviewPage(state) {
  const rowCount = state.planner.rowCount;
  const student = state.student;

  // ارتفاع پارت‌ها با توجه به تعداد ردیف‌ها (برای جاگیری دقیق در A4 بدون شکست صفحه)
  let cellHeightClass = 'py-2';
  let fontScaleClass = 'text-[11px]';
  if (rowCount <= 4) {
    cellHeightClass = 'py-3.5';
    fontScaleClass = 'text-xs';
  } else if (rowCount >= 8) {
    cellHeightClass = 'py-1';
    fontScaleClass = 'text-[10px]';
  }

  return `
    <div class="a4-page page-planner flex flex-col justify-between bg-white text-slate-900 relative p-8 print:p-6" id="pdf-page-2">
      <!-- سربرگ صفحه ۲ -->
      <div>
        <div class="flex items-center justify-between border-b-2 border-indigo-900 pb-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-sm">
              ۲
            </div>
            <div>
              <h2 class="text-xl font-black text-indigo-950">جدول برنامه‌ریزی هفتگی مطالعه</h2>
              <p class="text-xs font-semibold text-slate-500">آکادمی مشاوره و برنامه‌ریزی دکتر فروتن کیا</p>
            </div>
          </div>
          <div class="text-left text-xs space-y-1">
            <div class="text-slate-600">
              <span class="font-bold text-slate-800">دانش‌آموز:</span>
              <span>${sanitizeHtml(student.firstName)} ${sanitizeHtml(student.lastName)}</span>
            </div>
            <div class="text-slate-600">
              <span class="font-bold text-slate-800">بازه زمانی:</span>
              <span>${sanitizeHtml(toPersianDigits(student.timeframe))}</span>
            </div>
          </div>
        </div>

        <!-- جدول هفتگی راست‌به‌چپ (شنبه تا جمعه) -->
        <div class="planner-table-wrapper w-full border-2 border-indigo-950 rounded-xl overflow-hidden shadow-sm">
          <table class="w-full border-collapse text-right text-xs">
            <thead>
              <tr class="bg-indigo-950 text-white font-black text-center divide-x divide-x-reverse divide-indigo-800">
                <th class="w-10 py-2.5 bg-slate-900 text-amber-300 text-[11px]">پارت</th>
                ${DAYS_OF_WEEK.map(d => `
                  <th class="w-[14.28%] py-2.5">
                    <div class="text-sm tracking-wide font-black">${d.label}</div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-300">
              ${Array.from({ length: rowCount }).map((_, r) => {
                const block = state.planner.blocks[r] || createEmptyBlock();
                const isEven = r % 2 === 0;
                const rowBg = isEven ? 'bg-white' : 'bg-slate-50/80';
                return `
                  <tr class="${rowBg} divide-x divide-x-reverse divide-slate-300">
                    <td class="text-center font-black text-slate-700 bg-slate-100 text-[11px]">
                      ${toPersianDigits(r + 1)}
                    </td>
                    ${DAYS_OF_WEEK.map(d => {
                      const item = block[d.key] || { topic: '', tests: '' };
                      const hasTests = item.tests && item.tests.toString().trim() !== '';
                      return `
                        <td class="${cellHeightClass} px-2 align-top">
                          <div class="min-h-[30px] flex flex-col justify-between">
                            <!-- ردیف ۱: مبحث -->
                            <div class="${fontScaleClass} font-semibold text-slate-800 leading-snug line-clamp-2">
                              ${sanitizeHtml(item.topic) || '<span class="text-slate-300 font-light">-</span>'}
                            </div>
                            <!-- ردیف ۲: تست -->
                            <div class="mt-1 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px]">
                              <span class="text-slate-500 font-medium">تست:</span>
                              ${hasTests ? `
                                <span class="font-extrabold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300/60">
                                  ${toPersianDigits(item.tests)}
                                </span>
                              ` : `
                                <span class="text-slate-300 font-light">۰</span>
                              `}
                            </div>
                          </div>
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- پاورقی و کادر وضعیت هفتگی -->
      <div class="mt-4 pt-3 border-t border-slate-200">
        <div class="flex items-center justify-between bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-3.5 rounded-xl shadow-sm">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-amber-400 text-indigo-950 flex items-center justify-center font-bold">
              ✓
            </span>
            <div>
              <div class="text-xs font-bold text-amber-300">هدف‌گذاری کل هفته:</div>
              <div class="text-[11px] text-indigo-100">
                برنامه شامل <span class="font-bold text-white">${toPersianDigits(rowCount)}</span> پارت مطالعاتی در هر روز و مجموعاً <span class="font-bold text-amber-300">${toPersianDigits(rowCount * 7)}</span> پارت هفتگی می‌باشد.
              </div>
            </div>
          </div>
          <div class="text-left bg-white/10 px-4 py-2 rounded-lg border border-white/20">
            <div class="text-[10px] text-indigo-200">مجموع تست برنامه‌ریزی‌شده:</div>
            <div class="text-lg font-black text-amber-300">
              ${toPersianDigits(weeklyTotal)} <span class="text-xs text-white font-normal">تست</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>آکادمی دکتر فروتن کیا - سیستم هوشمند برنامه‌ریزی تحصیلی</span>
          <span>صفحه ۲ از ۴</span>
        </div>
      </div>
    </div>
  `;
}
