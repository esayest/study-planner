/**
 * Service Worker for Study Planner PWA
 * آکادمی دکتر شهروز فروتن کیا
 * طراح و توسعه‌دهنده: محمد شکیبا (Mohammad Shakiba)
 * نسخه: 1.0.20 
 */

const CACHE_NAME = 'study-planner-pwa-v1.0.20';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './js/tailwindcss.js',
  './assets/Study Planner App Icon.png',
  './assets/academy-logo-transparent.png',
  './assets/academy-logo-dark-transparent.png',
  './assets/academy-logo.png',
  './assets/academy-logo-dark.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/fonts/dana-regular.woff2',
  './assets/fonts/dana-medium.woff2',
  './assets/fonts/dana-bold.woff2',
  './assets/fonts/dana-demibold.woff2',
  './assets/fonts/dana-extrabold.woff2',
  './assets/fonts/dana-black.woff2',
  './assets/fonts/dana-light.woff2',
  './assets/fonts/dana-thin.woff2',
  './assets/fonts/dana-ultrabold.woff2',
  './assets/fonts/dana-regularitalic.woff2',
  './assets/fonts/dana-mediumitalic.woff2',
  './assets/fonts/dana-bolditalic.woff2',
  './assets/fonts/dana-demibolditalic.woff2',
  './assets/fonts/dana-extrabolditalic.woff2',
  './assets/fonts/dana-blackitalic.woff2',
  './assets/fonts/dana-lightitalic.woff2',
  './assets/fonts/dana-thinitalic.woff2',
  './assets/fonts/dana-ultrabolditalic.woff2',
  './assets/fonts/Estedad-Arabic.woff2',
  './assets/fonts/Estedad-Latin.woff2',
  './assets/fonts/PeydaWeb-Regular.woff2',
  './assets/fonts/PeydaWeb-Medium.woff2',
  './assets/fonts/PeydaWeb-SemiBold.woff2',
  './assets/fonts/PeydaWeb-Bold.woff2',
  './assets/fonts/PeydaWeb-ExtraBold.woff2',
  './assets/fonts/PeydaWeb-Black.woff2',
  './assets/fonts/PeydaWeb-Light.woff2',
  './assets/fonts/PeydaWeb-ExtraLight.woff2',
  './assets/fonts/PeydaWeb-Thin.woff2'
];

// مرحله نصب (Installation & Pre-caching)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some assets could not be pre-cached during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// مرحله فعال‌سازی و پاک‌سازی کش‌های قدیمی (Activation & Cache Cleanup)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتژی پاسخ‌دهی به درخواست‌ها
self.addEventListener('fetch', (event) => {
  // فقط درخواست‌های GET با پروتکل http/https را مدیریت کن
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // برای درخواست‌های ناوبری صفحه اصلی (HTML)، استراتژی Network-First جهت دریافت آنی تغییرات جدید
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('./index.html') || caches.match('./');
        });
      })
    );
    return;
  }

  // برای فایل‌های استاتیک دیگر (فونت‌ها، تصاویر، آیکون‌ها): Cache-First با Fallback به شبکه
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // بازگردانی از کش و به‌روزرسانی نامحسوس در پس‌زمینه (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }).catch(() => {/* وضعیت آفلاین */});

        return cachedResponse;
      }

      // در صورت عدم وجود در کش، دریافت از شبکه و ذخیره در کش
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
