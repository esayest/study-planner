/**
 * ماژول صدور خروجی PDF با حفظ کامل جهت RTL و فونت فارسی
 * PDF Export Engine with Full RTL & Persian Font Preservation
 */

import { validateState } from './validation.js';
import { showToast } from './utils.js';

/**
 * ایجاد نام فایل استاندارد فارسی برای ذخیره PDF
 * @param {Object} state 
 * @returns {string}
 */
export function generatePdfFilename(state) {
  const fName = (state.student.firstName || '').trim();
  const lName = (state.student.lastName || '').trim();
  const studentPart = fName || lName ? `${fName}_${lName}` : 'دانش_آموز';
  return `برنامه_مطالعاتی_آکادمی_فروتن_کیا_${studentPart}.pdf`;
}

/**
 * صدور مستقیم از طریق مرورگر (تضمین بالاترین کیفیت وکتور، متن قابل انتخاب و بدون شکستگی فونت)
 * Native High-Precision Browser Print Method
 */
export function exportViaBrowserPrint(state) {
  const validation = validateState(state);
  if (!validation.isValid) {
    showToast(validation.errors[0], 'error');
    return false;
  }

  showToast('در حال آماده‌سازی پنجره چاپ استاندارد A4...', 'info');
  
  // فعال‌سازی کلاس وضعیت چاپ روی سند
  document.body.classList.add('is-printing-mode');

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-mode');
    }, 500);
  }, 250);

  return true;
}

/**
 * صدور دانلود مستقیم تک‌کلیک با html2pdf.js
 * One-Click Direct File Download Method
 * @param {Object} state 
 * @param {HTMLElement} previewContainer 
 */
export async function exportViaHtml2Pdf(state, previewContainer) {
  const validation = validateState(state);
  if (!validation.isValid) {
    showToast(validation.errors[0], 'error');
    return false;
  }

  // بررسی در دسترس بودن کتابخانه html2pdf
  if (typeof window.html2pdf === 'undefined') {
    showToast('کتابخانه دانلود خودکار در دسترس نیست؛ پنجره چاپ مرورگر باز می‌شود.', 'warning');
    return exportViaBrowserPrint(state);
  }

  const exportBtn = document.getElementById('btn-export-pdf');
  const originalText = exportBtn ? exportBtn.innerHTML : '';
  if (exportBtn) {
    exportBtn.disabled = true;
    exportBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      در حال پردازش و تولید فایل PDF...
    `;
  }

  showToast('در حال پردازش و تولید فایل ۴ صفحه‌ای PDF، لطفاً شکیبا باشید...', 'info');

  try {
    const filename = generatePdfFilename(state);
    const pages = previewContainer.querySelectorAll('.a4-page');

    if (!pages || pages.length === 0) {
      throw new Error('صفحات پیش‌نمایش یافت نشدند.');
    }

    // ساخت ظرف موقت کاملاً استاندارد برای جلوگیری از هرگونه تغییر اسکیل در مانیتور کاربر
    const exportWrapper = document.createElement('div');
    exportWrapper.id = 'pdf-render-cloned-wrapper';
    exportWrapper.setAttribute('dir', 'rtl');
    exportWrapper.style.position = 'fixed';
    exportWrapper.style.top = '-99999px';
    exportWrapper.style.left = '0';
    exportWrapper.style.width = '210mm';
    exportWrapper.style.backgroundColor = '#ffffff';
    exportWrapper.style.fontFamily = "'Dana', 'Peyda', sans-serif";

    // کپی صفحات
    pages.forEach((page) => {
      const clone = page.cloneNode(true);
      clone.style.width = '210mm';
      clone.style.height = '297mm';
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      clone.style.pageBreakAfter = 'always';
      clone.style.breakAfter = 'page';
      exportWrapper.appendChild(clone);
    });

    document.body.appendChild(exportWrapper);

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, // وضوح فوق‌العاده بالا
        useCORS: true,
        letterRendering: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794, // 210mm at 96dpi
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      },
      pagebreak: { mode: ['css', 'legacy'] },
    };

    await window.html2pdf().set(opt).from(exportWrapper).save();

    showToast('فایل PDF با موفقیت دانلود شد!', 'success');
    document.body.removeChild(exportWrapper);
  } catch (err) {
    console.error('خطا در تولید فایل PDF با html2pdf:', err);
    showToast('خطا در پردازش تصویر پی‌دی‌اف؛ به بخش چاپ مرورگر منتقل می‌شوید.', 'warning');
    exportViaBrowserPrint(state);
  } finally {
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.innerHTML = originalText;
    }
  }
}
