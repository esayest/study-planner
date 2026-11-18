/**
 * سیستم اعتبارسنجی ورودی‌ها به زبان فارسی
 * Persian Input Validation Module
 */

import { toLatinDigits } from './utils.js';

/**
 * اعتبارسنجی کامل فرم پیش از صدور یا ذخیره
 * @param {Object} state 
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateState(state) {
  const errors = [];
  const warnings = [];

  // بررسی اطلاعات دانش‌آموز (صفحه ۳)
  if (!state.student.firstName || !state.student.firstName.trim()) {
    errors.push('لطفاً «نام دانش‌آموز» را وارد نمایید.');
  }

  if (!state.student.lastName || !state.student.lastName.trim()) {
    errors.push('لطفاً «نام خانوادگی دانش‌آموز» را وارد نمایید.');
  }

  if (!state.student.counselorName || !state.student.counselorName.trim()) {
    errors.push('لطفاً «نام مشاور» را وارد نمایید.');
  }

  if (!state.student.supervisorCounselor || !state.student.supervisorCounselor.trim()) {
    errors.push('لطفاً «مشاور ناظر» را وارد نمایید.');
  }

  if (!state.student.fieldOfStudy || !state.student.fieldOfStudy.trim()) {
    errors.push('لطفاً «رشته تحصیلی» را مشخص کنید.');
  }

  // اعتبارسنجی شماره تماس (در صورت وارد شدن)
  if (state.student.phone && state.student.phone.trim()) {
    const rawPhone = toLatinDigits(state.student.phone.trim());
    if (!/^[0-9+]{10,14}$/.test(rawPhone)) {
      warnings.push('شماره تماس وارد شده نامعتبر به نظر می‌رسد (فرمت رایج: ۰۹۱۲۳۴۵۶۷۸۹).');
    }
  }

  // اعتبارسنجی تعداد هفته‌های سپری شده
  if (state.student.weeksPassed) {
    const weeks = Number(toLatinDigits(state.student.weeksPassed));
    if (isNaN(weeks) || weeks < 0) {
      errors.push('تعداد هفته‌های سپری‌شده باید یک عدد معتبر باشد.');
    }
  }

  // اعتبارسنجی تعداد ردیف‌های جدول برنامه هفتگی (صفحه ۲)
  const rowCount = state.planner.rowCount;
  if (rowCount < 3 || rowCount > 9) {
    errors.push('تعداد پارت‌های مطالعاتی در هر روز باید بین ۳ تا ۹ ردیف باشد.');
  }

  // اعتبارسنجی تعداد روزهای برنامه (از ۲ تا ۱۴ روز)
  const dayCount = state.planner.dayCount || 7;
  if (dayCount < 2 || dayCount > 14) {
    errors.push('تعداد روزهای برنامه باید بین ۲ تا ۱۴ روز باشد.');
  }

  // اعتبارسنجی فیلدهای تست در جدول برنامه
  let invalidTestCountFound = false;
  state.planner.blocks.forEach((block) => {
    Object.keys(block).forEach((dayKey) => {
      const tests = block[dayKey].tests;
      if (tests !== '' && tests !== null && tests !== undefined) {
        const num = Number(toLatinDigits(tests));
        if (isNaN(num) || num < 0) {
          invalidTestCountFound = true;
        }
      }
    });
  });

  if (invalidTestCountFound) {
    errors.push('تعداد تست‌های وارد شده در جدول هفتگی باید تنها شامل اعداد معتبر باشد.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
