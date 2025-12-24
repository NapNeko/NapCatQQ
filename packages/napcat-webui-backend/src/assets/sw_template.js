const CACHE_NAME = 'napcat-webui-v{{VERSION}}';
const ASSETS_TO_CACHE = [
  '/webui/'
];

// 安装阶段：预缓存核心文件
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 强制立即接管
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 这里的资源如果加载失败不应该阻断 SW 安装
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('Failed to cache core assets', err));
    })
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('napcat-webui-') && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 立即控制所有客户端
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API 请求：仅网络 (Network Only)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/socket')) {
    return;
  }

  // 2. 强缓存策略 (Cache First)
  // - 外部 QQ 头像 (q1.qlogo.cn)
  // - 静态资源 (assets, fonts)
  // - 常见静态文件后缀
  const isQLogo = url.hostname === 'q1.qlogo.cn';
  const isCustomFont = url.pathname.includes('CustomFont.woff'); // 用户自定义字体，不强缓存
  const isThemeCss = url.pathname.includes('files/theme.css'); // 主题 CSS，不强缓存
  const isStaticAsset = url.pathname.includes('/webui/assets/') ||
    url.pathname.includes('/webui/fonts/');
  const isStaticFile = /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url.pathname);

  if (!isCustomFont && !isThemeCss && (isQLogo || isStaticAsset || isStaticFile)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }

        // 跨域请求 (qlogo) 需要 mode: 'no-cors' 才能缓存 opaque response，
        // 但 fetch(event.request) 默认会继承 request 的 mode。
        // 如果是 img标签发起的请求，通常 mode 是 no-cors 或 cors。
        // 对于 opaque response (status 0), cache API 允许缓存。
        return fetch(event.request).then((response) => {
          // 对 qlogo 允许 status 0 (opaque)
          // 对其他资源要求 status 200
          const isValidResponse = response && (
            response.status === 200 ||
            response.type === 'basic' ||
            (isQLogo && response.type === 'opaque')
          );

          if (!isValidResponse) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // 3. HTML 页面 / 导航请求 -> 网络优先 (Network First)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 4. 其他 Same-Origin 请求 -> Stale-While-Revalidate
  // 优先返回缓存，同时后台更新缓存，保证下次访问是新的
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
        // 如果有缓存，返回缓存；否则等待网络
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 默认：网络优先
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
