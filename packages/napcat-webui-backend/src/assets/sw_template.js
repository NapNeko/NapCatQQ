/**
 * NapCat WebUI Service Worker
 * 
 * 路由缓存策略设计：
 * 
 * 【永不缓存 - Network Only】
 *   - /api/*                          WebUI API
 *   - /plugin/:id/api/*               插件 API
 *   - /files/theme.css                动态主题 CSS
 *   - /webui/fonts/CustomFont.woff    用户自定义字体
 *   - WebSocket / SSE 连接
 * 
 * 【强缓存 - Cache First】
 *   - /webui/assets/*                 前端静态资源（带 hash）
 *   - /webui/fonts/*                  内置字体（排除 CustomFont）
 *   - q1.qlogo.cn                     QQ 头像
 * 
 * 【网络优先 - Network First】
 *   - /webui/* (HTML 导航)            SPA 页面
 *   - /plugin/:id/page/*              插件页面
 *   - /plugin/:id/files/*             插件文件系统静态资源
 * 
 * 【后台更新 - Stale-While-Revalidate】  
 *   - /plugin/:id/mem/*               插件内存静态资源
 */

const CACHE_NAME = 'napcat-webui-v{{VERSION}}';

// 缓存配置
const CACHE_CONFIG = {
  // 静态资源缓存最大条目数
  MAX_STATIC_ENTRIES: 200,
  // QQ 头像缓存最大条目数
  MAX_AVATAR_ENTRIES: 100,
  // 插件资源缓存最大条目数
  MAX_PLUGIN_ENTRIES: 50,
};

// ============ 路由匹配辅助函数 ============

/**
 * 检查是否为永不缓存的请求
 */
function isNeverCache (url, request) {
  // WebUI API
  if (url.pathname.startsWith('/api/')) return true;

  // 插件 API: /plugin/:id/api/*
  if (/^\/plugin\/[^/]+\/api(\/|$)/.test(url.pathname)) return true;

  // 动态主题 CSS
  if (url.pathname === '/files/theme.css' || url.pathname.endsWith('/files/theme.css')) return true;

  // 用户自定义字体
  if (url.pathname.includes('/webui/fonts/CustomFont.woff')) return true;

  // WebSocket 升级请求
  if (request.headers.get('Upgrade') === 'websocket') return true;

  // SSE 请求
  if (request.headers.get('Accept') === 'text/event-stream') return true;

  // Socket 相关
  if (url.pathname.includes('/socket')) return true;

  return false;
}

/**
 * 检查是否为 WebUI 静态资源（强缓存）
 */
function isWebUIStaticAsset (url) {
  // /webui/assets/* - 前端构建产物（带 hash）
  if (url.pathname.startsWith('/webui/assets/')) return true;

  // /webui/fonts/* - 内置字体（排除 CustomFont）
  if (url.pathname.startsWith('/webui/fonts/') &&
    !url.pathname.includes('CustomFont.woff')) return true;

  return false;
}

/**
 * 检查是否为外部头像（强缓存）
 */
function isQLogoAvatar (url) {
  return url.hostname === 'q1.qlogo.cn' || url.hostname === 'q2.qlogo.cn';
}

/**
 * 检查是否为插件文件系统静态资源（网络优先）
 */
function isPluginStaticFiles (url) {
  // /plugin/:id/files/*
  return /^\/plugin\/[^/]+\/files(\/|$)/.test(url.pathname);
}

/**
 * 检查是否为插件内存静态资源（Stale-While-Revalidate）
 */
function isPluginMemoryAsset (url) {
  // /plugin/:id/mem/*
  return /^\/plugin\/[^/]+\/mem(\/|$)/.test(url.pathname);
}

/**
 * 检查是否为插件页面（Network First）
 */
function isPluginPage (url) {
  // /plugin/:id/page/*
  return /^\/plugin\/[^/]+\/page(\/|$)/.test(url.pathname);
}

// ============ 缓存管理函数 ============

/**
 * 限制缓存条目数量
 */
async function trimCache (cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // 删除最早的条目
    const deleteCount = keys.length - maxEntries;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
    console.log(`[SW] Trimmed ${deleteCount} entries from cache`);
  }
}

/**
 * 按类型获取缓存限制
 */
function getCacheLimitForRequest (url) {
  if (isQLogoAvatar(url)) return CACHE_CONFIG.MAX_AVATAR_ENTRIES;
  if (isPluginStaticFiles(url) || isPluginMemoryAsset(url)) return CACHE_CONFIG.MAX_PLUGIN_ENTRIES;
  return CACHE_CONFIG.MAX_STATIC_ENTRIES;
}

// ============ Service Worker 生命周期 ============

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', CACHE_NAME);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version:', CACHE_NAME);
  event.waitUntil(
    (async () => {
      // 清理所有旧版本缓存
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('napcat-webui-') && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      // 立即接管所有客户端
      await self.clients.claim();
    })()
  );
});

// ============ 请求拦截 ============

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;

  // 1. 永不缓存的请求 - Network Only
  if (isNeverCache(url, request)) {
    // 不调用 respondWith，让请求直接穿透到网络
    return;
  }

  // 2. WebUI 静态资源 - Cache First
  if (isWebUIStaticAsset(url)) {
    event.respondWith(cacheFirst(request, url));
    return;
  }

  // 3. QQ 头像 - Cache First（支持 opaque response）
  if (isQLogoAvatar(url)) {
    event.respondWith(cacheFirstWithOpaque(request, url));
    return;
  }

  // 4. 插件文件系统静态资源 - Network First
  if (isPluginStaticFiles(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 5. 插件内存静态资源 - Stale-While-Revalidate
  if (isPluginMemoryAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, url));
    return;
  }

  // 6. 插件页面 - Network First
  if (isPluginPage(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 7. HTML 导航请求 - Network First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 8. 其他同源请求 - Network Only（避免意外缓存）
  if (url.origin === self.location.origin) {
    // 不缓存，直接穿透
    return;
  }

  // 9. 其他外部请求 - Network Only
  return;
});

// ============ 缓存策略实现 ============

/**
 * Cache First 策略
 * 优先从缓存返回，缓存未命中则从网络获取并缓存
 */
async function cacheFirst (request, url) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      // 异步清理缓存
      trimCache(CACHE_NAME, getCacheLimitForRequest(url));
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First fetch failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Cache First 策略（支持 opaque response，用于跨域头像）
 */
async function cacheFirstWithOpaque (request, url) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    // opaque response 的 status 是 0，但仍可缓存
    const isValidResponse = networkResponse && (
      networkResponse.status === 200 ||
      networkResponse.type === 'opaque'
    );

    if (isValidResponse) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      trimCache(CACHE_NAME, getCacheLimitForRequest(url));
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First (opaque) fetch failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network First 策略
 * 优先从网络获取，网络失败则返回缓存
 */
async function networkFirst (request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network First: network failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stale-While-Revalidate 策略
 * 立即返回缓存（如果有），同时后台更新缓存
 */
async function staleWhileRevalidate (request, url) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // 后台刷新缓存
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
      trimCache(CACHE_NAME, getCacheLimitForRequest(url));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] SWR background fetch failed:', error);
    return null;
  });

  // 如果有缓存，立即返回缓存
  if (cachedResponse) {
    return cachedResponse;
  }

  // 没有缓存，等待网络
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response('Network error', { status: 503 });
}
