/**
 * GitHub 镜像配置模块
 * 提供统一的镜像源管理，支持复杂网络环境
 * 
 * 镜像源测试时间: 2026-01-03
 * 测试通过: 55/61 完全可用
 */

import https from 'https';
import http from 'http';
import { RequestUtil } from './request';
import { PromiseTimer } from './helper';

// ============== 镜像源列表 ==============

/**
 * GitHub 文件加速镜像
 * 用于加速 release assets 下载
 * 按延迟排序，优先使用快速镜像
 * 
 * 测试时间: 2026-01-03
 * 镜像支持 301/302 重定向
 * 懒加载测速：首次使用时自动测速，缓存 30 分钟
 */
export const GITHUB_FILE_MIRRORS = [
  // 延迟 < 800ms 的最快镜像
  'https://github.chenc.dev/',      // 666ms
  'https://ghproxy.cfd/',           // 719ms - 支持重定向
  'https://github.tbedu.top/',      // 760ms
  'https://ghps.cc/',               // 768ms
  'https://gh.llkk.cc/',            // 774ms
  'https://ghproxy.cc/',            // 777ms
  'https://gh.monlor.com/',         // 779ms
  'https://cdn.akaere.online/',     // 784ms
  // 延迟 800-1000ms 的快速镜像
  'https://gh.idayer.com/',         // 869ms
  'https://gh-proxy.net/',          // 885ms
  'https://ghpxy.hwinzniej.top/',   // 890ms
  'https://github-proxy.memory-echoes.cn/', // 896ms
  'https://git.yylx.win/',          // 917ms
  'https://gitproxy.mrhjx.cn/',     // 950ms
  'https://jiashu.1win.eu.org/',    // 954ms
  'https://ghproxy.cn/',            // 981ms
  // 延迟 1000-1500ms 的中速镜像
  'https://gh.fhjhy.top/',          // 1014ms
  'https://gp.zkitefly.eu.org/',    // 1015ms
  'https://gh-proxy.com/',          // 1022ms
  'https://hub.gitmirror.com/',     // 1027ms
  'https://ghfile.geekertao.top/',  // 1029ms
  'https://j.1lin.dpdns.org/',      // 1037ms
  'https://ghproxy.imciel.com/',    // 1047ms
  'https://github-proxy.teach-english.tech/', // 1047ms
  'https://gh.927223.xyz/',         // 1071ms
  'https://github.ednovas.xyz/',    // 1099ms
  'https://ghf.xn--eqrr82bzpe.top/',// 1122ms
  'https://gh.dpik.top/',           // 1131ms
  'https://gh.jasonzeng.dev/',      // 1139ms
  'https://gh.xxooo.cf/',           // 1157ms
  'https://gh.bugdey.us.kg/',       // 1228ms
  'https://ghm.078465.xyz/',        // 1289ms
  'https://j.1win.ggff.net/',       // 1329ms
  'https://tvv.tw/',                // 1393ms
  'https://gh.chjina.com/',         // 1446ms
  'https://gitproxy.127731.xyz/',   // 1458ms
  // 延迟 1500-2500ms 的较慢镜像
  'https://gh.inkchills.cn/',       // 1617ms
  'https://ghproxy.cxkpro.top/',    // 1651ms
  'https://gh.sixyin.com/',         // 1686ms
  'https://github.geekery.cn/',     // 1734ms
  'https://git.669966.xyz/',        // 1824ms
  'https://gh.5050net.cn/',         // 1858ms
  'https://gh.felicity.ac.cn/',     // 1903ms
  'https://gh.ddlc.top/',           // 2056ms
  'https://cf.ghproxy.cc/',         // 2058ms
  'https://gitproxy.click/',        // 2068ms
  'https://github.dpik.top/',       // 2313ms
  'https://gh.zwnes.xyz/',          // 2434ms
  'https://ghp.keleyaa.com/',       // 2440ms
  'https://gh.wsmdn.dpdns.org/',    // 2744ms
  // 延迟 > 2500ms 的慢速镜像（作为备用）
  'https://ghproxy.monkeyray.net/', // 3023ms
  'https://fastgit.cc/',            // 3369ms
  'https://cdn.gh-proxy.com/',      // 3394ms
  'https://gh.catmak.name/',        // 4119ms
  'https://gh.noki.icu/',           // 5990ms
  '', // 原始 URL（无镜像）
];

/**
 * GitHub API 镜像
 * 用于访问 GitHub API（作为备选方案）
 * 注：优先使用非 API 方法，减少对 API 的依赖
 * 
 * 经测试，大部分代理镜像不支持 API 转发
 * 建议使用 getLatestReleaseTag 等方法避免 API 调用
 */
export const GITHUB_API_MIRRORS = [
  'https://api.github.com',
  // 目前没有可用的公共 API 代理镜像
];

/**
 * GitHub Raw 镜像
 * 用于访问 raw.githubusercontent.com
 * 注：大多数通用代理也支持 raw 文件加速
 */
export const GITHUB_RAW_MIRRORS = [
  'https://raw.githubusercontent.com',
  // 测试确认支持 raw 文件的镜像
  'https://github.chenc.dev/https://raw.githubusercontent.com',
  'https://ghproxy.cfd/https://raw.githubusercontent.com',
  'https://gh.llkk.cc/https://raw.githubusercontent.com',
  'https://ghproxy.cc/https://raw.githubusercontent.com',
  'https://gh-proxy.net/https://raw.githubusercontent.com',
];

/**
 * Nightly.link 镜像
 * 用于访问 GitHub Actions artifacts
 * 优先使用官方服务，出现问题时可切换镜像
 */
export const NIGHTLY_LINK_MIRRORS = [
  'https://nightly.link',
  // 可以添加其他 nightly.link 镜像（如果有的话）
];

// ============== 镜像配置接口 ==============

export interface MirrorConfig {
  /** 文件下载镜像（用于 release assets） */
  fileMirrors: string[];
  /** API 镜像 */
  apiMirrors: string[];
  /** Raw 文件镜像 */
  rawMirrors: string[];
  /** Nightly.link 镜像（用于 Actions artifacts） */
  nightlyLinkMirrors: string[];
  /** 超时时间（毫秒） */
  timeout: number;
  /** 是否启用镜像 */
  enabled: boolean;
  /** 自定义镜像（优先使用） */
  customMirror?: string;
}

// ============== 默认配置 ==============

const defaultConfig: MirrorConfig = {
  fileMirrors: GITHUB_FILE_MIRRORS,
  apiMirrors: GITHUB_API_MIRRORS,
  rawMirrors: GITHUB_RAW_MIRRORS,
  nightlyLinkMirrors: NIGHTLY_LINK_MIRRORS,
  timeout: 10000, // 10秒超时，平衡速度和可靠性
  enabled: true,
  customMirror: undefined,
};

let currentConfig: MirrorConfig = { ...defaultConfig };

// ============== 懒加载镜像测速缓存 ==============

interface MirrorTestResult {
  mirror: string;
  latency: number;
  success: boolean;
}

// 缓存的快速镜像列表（按延迟排序）
let cachedFastMirrors: string[] | null = null;
// 测速是否正在进行
let mirrorTestingPromise: Promise<string[]> | null = null;
// 缓存过期时间（30分钟）
const MIRROR_CACHE_TTL = 30 * 60 * 1000;
let cacheTimestamp: number = 0;

/**
 * 测试单个镜像的延迟（使用 HEAD 请求测试实际文件）
 * 测试一个小型的实际 release 文件，确保镜像支持文件下载
 */
async function testMirrorLatency (mirror: string, timeout: number = 5000): Promise<MirrorTestResult> {
  // 使用一个实际存在的小文件来测试（README 或小型 release asset）
  // 用 HEAD 请求，不下载实际内容
  const testUrl = 'https://github.com/NapNeko/NapCatQQ/releases/latest';
  const url = buildMirrorUrl(testUrl, mirror);
  const start = Date.now();

  return new Promise<MirrorTestResult>((resolve) => {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request({
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout,
        headers: {
          'User-Agent': 'NapCat-Mirror-Test',
        },
      }, (res) => {
        const statusCode = res.statusCode || 0;
        // 2xx 或 3xx 都算成功（3xx 说明镜像工作正常，会重定向）
        const isValid = statusCode >= 200 && statusCode < 400;
        resolve({
          mirror,
          latency: Date.now() - start,
          success: isValid,
        });
      });

      req.on('error', () => {
        resolve({
          mirror,
          latency: Infinity,
          success: false,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          mirror,
          latency: Infinity,
          success: false,
        });
      });

      req.end();
    } catch {
      resolve({
        mirror,
        latency: Infinity,
        success: false,
      });
    }
  });
}

/**
 * 懒加载获取快速镜像列表
 * 第一次调用时会进行测速，后续使用缓存
 */
export async function getFastMirrors (forceRefresh: boolean = false): Promise<string[]> {
  // 检查缓存是否有效
  const now = Date.now();
  if (!forceRefresh && cachedFastMirrors && (now - cacheTimestamp) < MIRROR_CACHE_TTL) {
    return cachedFastMirrors;
  }

  // 如果已经在测速中，等待结果
  if (mirrorTestingPromise) {
    return mirrorTestingPromise;
  }

  // 开始测速
  mirrorTestingPromise = performMirrorTest();

  try {
    const result = await mirrorTestingPromise;
    cachedFastMirrors = result;
    cacheTimestamp = now;
    return result;
  } finally {
    mirrorTestingPromise = null;
  }
}

/**
 * 执行镜像测速
 * 并行测试所有镜像，返回按延迟排序的可用镜像列表
 */
async function performMirrorTest (): Promise<string[]> {
  // 开始镜像测速

  const timeout = 8000; // 测速超时 8 秒

  // 并行测试所有镜像
  const mirrors = currentConfig.fileMirrors.filter(m => m);
  const results = await Promise.all(
    mirrors.map(m => testMirrorLatency(m, timeout))
  );

  // 过滤成功的镜像并按延迟排序
  const successfulMirrors = results
    .filter(r => r.success)
    .sort((a, b) => a.latency - b.latency)
    .map(r => r.mirror);



  // 至少返回原始 URL
  if (successfulMirrors.length === 0) {
    return [''];
  }

  return successfulMirrors;
}

/**
 * 清除镜像缓存，强制下次重新测速
 */
export function clearMirrorCache (): void {
  cachedFastMirrors = null;
  cacheTimestamp = 0;

}

/**
 * 获取缓存状态
 */
export function getMirrorCacheStatus (): { cached: boolean; count: number; age: number; } {
  return {
    cached: cachedFastMirrors !== null,
    count: cachedFastMirrors?.length ?? 0,
    age: cachedFastMirrors ? Date.now() - cacheTimestamp : 0,
  };
}

// ============== 配置管理 ==============

/**
 * 获取当前镜像配置
 */
export function getMirrorConfig (): MirrorConfig {
  return { ...currentConfig };
}

/**
 * 更新镜像配置
 */
export function setMirrorConfig (config: Partial<MirrorConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * 重置为默认配置
 */
export function resetMirrorConfig (): void {
  currentConfig = { ...defaultConfig };
}

/**
 * 设置自定义镜像（优先级最高）
 */
export function setCustomMirror (mirror: string): void {
  currentConfig.customMirror = mirror;
}

// ============== URL 工具函数 ==============

/**
 * 构建镜像 URL
 * @param originalUrl 原始 URL
 * @param mirror 镜像前缀
 */
export function buildMirrorUrl (originalUrl: string, mirror: string): string {
  if (!mirror) return originalUrl;
  // 如果镜像已经包含完整域名，直接拼接
  if (mirror.endsWith('/')) {
    return mirror + originalUrl;
  }
  return mirror + '/' + originalUrl;
}

/**
 * 测试 URL 是否可用（HTTP GET）
 * @param url 要测试的 URL
 * @param timeout 超时时间
 */
export async function testUrl (url: string, timeout: number = 5000): Promise<boolean> {
  try {
    await PromiseTimer(RequestUtil.HttpGetText(url), timeout);
    return true;
  } catch {
    return false;
  }
}

/**
 * 测试 URL 是否可用（HTTP HEAD，更快）
 * 验证：状态码、Content-Type、Content-Length
 */
export async function testUrlHead (url: string, timeout: number = 5000): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout,
      headers: {
        'User-Agent': 'NapCat-Mirror-Test',
      },
    }, (res) => {
      const statusCode = res.statusCode || 0;
      const contentType = (res.headers['content-type'] as string) || '';
      const contentLength = parseInt((res.headers['content-length'] as string) || '0', 10);

      // 验证条件：
      // 1. 状态码 2xx 或 3xx
      // 2. Content-Type 不应该是 text/html（表示错误页面）
      // 3. 对于 .zip 文件，Content-Length 应该 > 1MB（避免获取到错误页面）
      const isValidStatus = statusCode >= 200 && statusCode < 400;
      const isNotHtmlError = !contentType.includes('text/html');
      const isValidSize = url.endsWith('.zip') ? contentLength > 1024 * 1024 : true;

      resolve(isValidStatus && isNotHtmlError && isValidSize);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * 详细验证 URL 响应
 * 返回验证结果和详细信息
 */
export interface UrlValidationResult {
  valid: boolean;
  statusCode?: number;
  contentType?: string;
  contentLength?: number;
  error?: string;
}

export async function validateUrl (url: string, timeout: number = 5000): Promise<UrlValidationResult> {
  return new Promise<UrlValidationResult>((resolve) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout,
      headers: {
        'User-Agent': 'NapCat-Mirror-Test',
      },
    }, (res) => {
      const statusCode = res.statusCode || 0;
      const contentType = (res.headers['content-type'] as string) || '';
      const contentLength = parseInt((res.headers['content-length'] as string) || '0', 10);

      // 验证条件
      const isValidStatus = statusCode >= 200 && statusCode < 400;
      const isNotHtmlError = !contentType.includes('text/html');
      const isValidSize = url.endsWith('.zip') ? contentLength > 1024 * 1024 : true;

      if (!isValidStatus) {
        resolve({
          valid: false,
          statusCode,
          contentType,
          contentLength,
          error: `HTTP ${statusCode}`,
        });
      } else if (!isNotHtmlError) {
        resolve({
          valid: false,
          statusCode,
          contentType,
          contentLength,
          error: '返回了 HTML 页面而非文件',
        });
      } else if (!isValidSize) {
        resolve({
          valid: false,
          statusCode,
          contentType,
          contentLength,
          error: `文件过小 (${contentLength} bytes)，可能是错误页面`,
        });
      } else {
        resolve({
          valid: true,
          statusCode,
          contentType,
          contentLength,
        });
      }
    });

    req.on('error', (e: Error) => resolve({
      valid: false,
      error: e.message,
    }));
    req.on('timeout', () => {
      req.destroy();
      resolve({
        valid: false,
        error: 'Timeout',
      });
    });
    req.end();
  });
}

// ============== 查找可用 URL ==============

/**
 * 查找可用的下载 URL
 * 使用懒加载的快速镜像列表
 * @param originalUrl 原始 GitHub URL
 * @param options 选项
 */
export async function findAvailableDownloadUrl (
  originalUrl: string,
  options: {
    mirrors?: string[];
    timeout?: number;
    customMirror?: string;
    testMethod?: 'head' | 'get';
    /** 是否使用详细验证（验证 Content-Type 和 Content-Length） */
    validateContent?: boolean;
    /** 期望的最小文件大小（字节），用于验证 */
    minFileSize?: number;
    /** 是否使用懒加载的快速镜像列表 */
    useFastMirrors?: boolean;
  } = {}
): Promise<string> {
  const {
    timeout = currentConfig.timeout,
    customMirror = currentConfig.customMirror,
    testMethod = 'head',
    validateContent = true, // 默认启用内容验证
    minFileSize,
    useFastMirrors = true, // 默认使用快速镜像列表
  } = options;

  // 获取镜像列表
  let mirrors = options.mirrors;
  if (!mirrors) {
    // 检查是否是 nightly.link URL
    if (originalUrl.includes('nightly.link')) {
      // 使用 nightly.link 镜像列表（保持完整的 URL 格式）
      mirrors = currentConfig.nightlyLinkMirrors;
    } else if (useFastMirrors) {
      // 使用懒加载的快速镜像列表
      mirrors = await getFastMirrors();
    } else {
      mirrors = currentConfig.fileMirrors;
    }
  }

  // 使用增强验证或简单测试
  const testWithValidation = async (url: string): Promise<boolean> => {
    if (validateContent) {
      const result = await validateUrl(url, timeout);
      // 额外检查文件大小
      if (result.valid && minFileSize && result.contentLength && result.contentLength < minFileSize) {
        return false;
      }
      return result.valid;
    }
    return testMethod === 'head' ? testUrlHead(url, timeout) : testUrl(url, timeout);
  };

  // 1. 如果设置了自定义镜像，优先使用
  if (customMirror) {
    const customUrl = buildMirrorUrl(originalUrl, customMirror);
    if (await testWithValidation(customUrl)) {
      return customUrl;
    }
  }

  // 2. 先测试原始 URL
  if (await testWithValidation(originalUrl)) {
    return originalUrl;
  }

  // 3. 测试镜像源
  let testedCount = 0;
  for (const mirror of mirrors) {
    if (!mirror) continue; // 跳过空字符串
    
    // 特殊处理 nightly.link URL
    let mirrorUrl: string;
    if (originalUrl.includes('nightly.link')) {
      // 替换 nightly.link 域名
      mirrorUrl = originalUrl.replace('https://nightly.link', mirror.startsWith('http') ? mirror : `https://${mirror}`);
    } else {
      mirrorUrl = buildMirrorUrl(originalUrl, mirror);
    }
    
    testedCount++;
    if (await testWithValidation(mirrorUrl)) {
      return mirrorUrl;
    }
  }

  throw new Error(`所有下载源都不可用（已测试 ${testedCount} 个镜像），请检查网络连接或配置自定义镜像`);
}

// ============== 版本和 Release 相关（减少 API 依赖） ==============

/**
 * 语义化版本正则（简化版，用于排序）
 */
const SEMVER_REGEX = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/;

/**
 * 解析语义化版本号
 */
function parseSemVerSimple (version: string): { major: number; minor: number; patch: number; prerelease: string; } | null {
  const match = version.match(SEMVER_REGEX);
  if (!match) return null;
  return {
    major: parseInt(match[1] ?? '0', 10),
    minor: parseInt(match[2] ?? '0', 10),
    patch: parseInt(match[3] ?? '0', 10),
    prerelease: match[4] || '',
  };
}

/**
 * 比较两个版本号
 */
function compareSemVerSimple (a: string, b: string): number {
  const pa = parseSemVerSimple(a);
  const pb = parseSemVerSimple(b);
  if (!pa && !pb) return 0;
  if (!pa) return -1;
  if (!pb) return 1;

  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;

  // 预发布版本排在正式版本前面
  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && pb.prerelease) return 1;

  return pa.prerelease.localeCompare(pb.prerelease);
}

/**
 * 从 tags 列表中获取最新的 release tag
 * 不依赖 GitHub API
 */
export async function getLatestReleaseTag (owner: string, repo: string): Promise<string> {
  const result = await getAllGitHubTags(owner, repo);

  // 过滤出符合 semver 的 tags
  const releaseTags = result.tags.filter(tag => SEMVER_REGEX.test(tag));

  if (releaseTags.length === 0) {
    throw new Error('未找到有效的 release tag');
  }

  // 按版本号排序，取最新的
  releaseTags.sort(compareSemVerSimple);
  const latest = releaseTags[releaseTags.length - 1];

  if (!latest) {
    throw new Error('未找到有效的 release tag');
  }

  return latest;
}

/**
 * 直接构建 GitHub release 下载 URL
 * 不需要调用 API，直接基于 tag 和 asset 名称构建
 */
export function buildReleaseDownloadUrl (
  owner: string,
  repo: string,
  tag: string,
  assetName: string
): string {
  return `https://github.com/${owner}/${repo}/releases/download/${tag}/${assetName}`;
}

/**
 * 获取 GitHub release 信息（优先使用非 API 方法）
 * 
 * 策略：
 * 1. 先通过 git refs 获取 tags
 * 2. 直接构建下载 URL，不依赖 API
 * 3. 仅当需要 changelog 时才使用 API
 */
export async function getGitHubRelease (
  owner: string,
  repo: string,
  tag: string = 'latest',
  options: {
    /** 需要获取的 asset 名称列表 */
    assetNames?: string[];
    /** 是否需要获取 changelog（需要调用 API） */
    fetchChangelog?: boolean;
  } = {}
): Promise<{
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
  body?: string;
}> {
  const { assetNames = [], fetchChangelog = false } = options;

  // 1. 获取实际的 tag 名称
  let actualTag: string;
  if (tag === 'latest') {
    actualTag = await getLatestReleaseTag(owner, repo);
  } else {
    actualTag = tag;
  }

  // 2. 构建 assets 列表（不需要 API）
  const assets = assetNames.map(name => ({
    name,
    browser_download_url: buildReleaseDownloadUrl(owner, repo, actualTag, name),
  }));

  // 3. 如果不需要 changelog 且有 assetNames，直接返回
  if (!fetchChangelog && assetNames.length > 0) {
    return {
      tag_name: actualTag,
      assets,
      body: undefined,
    };
  }

  // 4. 需要更多信息时，尝试调用 API（作为备选）
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${actualTag}`;

  for (const apiBase of currentConfig.apiMirrors) {
    try {
      const url = endpoint.replace('https://api.github.com', apiBase);
      const response = await PromiseTimer(
        RequestUtil.HttpGetJson<any>(url, 'GET', undefined, {
          'User-Agent': 'NapCat',
          'Accept': 'application/vnd.github.v3+json',
        }),
        currentConfig.timeout
      );
      return response;
    } catch {
      continue;
    }
  }

  // 5. API 全部失败，但如果有 assetNames，仍然返回构建的 URL
  if (assetNames.length > 0) {
    return {
      tag_name: actualTag,
      assets,
      body: undefined,
    };
  }

  throw new Error('无法获取 release 信息，所有 API 源都不可用');
}

// ============== Tags 缓存 ==============

interface TagsCache {
  tags: string[];
  mirror: string;
  timestamp: number;
}

// 缓存 tags 结果（10 分钟有效，release 版本不会频繁变动）
const TAGS_CACHE_TTL = 10 * 60 * 1000;
const tagsCache: Map<string, TagsCache> = new Map();

/**
 * 获取所有 GitHub tags（带缓存）
 * 优化：并行请求多个镜像，使用第一个成功返回的结果
 */
export async function getAllGitHubTags (owner: string, repo: string): Promise<{ tags: string[], mirror: string; }> {
  const cacheKey = `${owner}/${repo}`;

  // 检查缓存
  const cached = tagsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < TAGS_CACHE_TTL) {
    return { tags: cached.tags, mirror: cached.mirror };
  }

  const baseUrl = `https://github.com/${owner}/${repo}.git/info/refs?service=git-upload-pack`;

  // 解析 tags 的辅助函数
  const parseTags = (raw: string): string[] => {
    return raw
      .split('\n')
      .map((line: string) => {
        const match = line.match(/refs\/tags\/(.+)$/);
        return match ? match[1] : undefined;
      })
      .filter((tag): tag is string => tag !== undefined && !tag.endsWith('^{}'));
  };

  // 尝试从 URL 获取 tags
  const fetchFromUrl = async (url: string, mirror: string): Promise<{ tags: string[], mirror: string; } | null> => {
    try {
      const raw = await PromiseTimer(
        RequestUtil.HttpGetText(url),
        currentConfig.timeout
      );

      // 检查返回内容是否有效（不是 HTML 错误页面）
      if (raw.includes('<!DOCTYPE') || raw.includes('<html')) {
        return null;
      }

      const tags = parseTags(raw);
      if (tags.length > 0) {
        return { tags, mirror };
      }
      return null;
    } catch {
      return null;
    }
  };

  // 获取快速镜像列表
  let fastMirrors: string[] = [];
  try {
    fastMirrors = await getFastMirrors();
  } catch {
    // 忽略错误
  }

  // 构建 URL 列表（取前 5 个快速镜像 + 原始 URL 并行请求）
  const topMirrors = fastMirrors.slice(0, 5);
  const mirrorUrls = [
    { url: baseUrl, mirror: 'github.com' }, // 原始 URL
    ...topMirrors.filter(m => m).map(m => ({ url: buildMirrorUrl(baseUrl, m), mirror: m })),
  ];

  // 并行请求所有镜像，使用 Promise.any 获取第一个成功的结果
  try {
    const result = await Promise.any(
      mirrorUrls.map(async ({ url, mirror }) => {
        const res = await fetchFromUrl(url, mirror);
        if (res) return res;
        throw new Error('Failed');
      })
    );
    
    // 缓存结果
    tagsCache.set(cacheKey, { tags: result.tags, mirror: result.mirror, timestamp: Date.now() });
    return result;
  } catch {
    // Promise.any 全部失败，回退到顺序尝试剩余镜像
  }

  // 回退：顺序尝试剩余镜像
  const remainingMirrors = fastMirrors.slice(5).filter(m => m);
  for (const mirror of remainingMirrors) {
    const url = buildMirrorUrl(baseUrl, mirror);
    const result = await fetchFromUrl(url, mirror);
    if (result) {
      tagsCache.set(cacheKey, { tags: result.tags, mirror: result.mirror, timestamp: Date.now() });
      return result;
    }
  }

  // 最后尝试所有镜像
  const allMirrors = currentConfig.fileMirrors.filter(m => m && !fastMirrors.includes(m));
  for (const mirror of allMirrors) {
    const url = buildMirrorUrl(baseUrl, mirror);
    const result = await fetchFromUrl(url, mirror);
    if (result) {
      tagsCache.set(cacheKey, { tags: result.tags, mirror: result.mirror, timestamp: Date.now() });
      return result;
    }
  }

  throw new Error('无法获取 tags，所有源都不可用');
}

// ============== Action Artifacts 支持 ==============

export interface ActionArtifact {
  id: number;
  name: string;
  size_in_bytes: number;
  created_at: string;
  expires_at: string;
  archive_download_url: string;
  workflow_run_id?: number;
  head_sha?: string;
}

// ============== Action Artifacts 缓存 ==============

interface ArtifactsCache {
  artifacts: ActionArtifact[];
  timestamp: number;
}

// 缓存 artifacts 结果（10 分钟有效）
const ARTIFACTS_CACHE_TTL = 10 * 60 * 1000;
const artifactsCache: Map<string, ArtifactsCache> = new Map();

/**
 * 清除 artifacts 缓存
 */
export function clearArtifactsCache (): void {
  artifactsCache.clear();
}

/**
 * 通过解析 GitHub Actions HTML 页面获取 workflow runs（备用方案）
 * 当 api.github.com 不可用时使用
 * 页面格式: https://github.com/{owner}/{repo}/actions/workflows/{workflow}
 */
async function getWorkflowRunsFromHtml (
  owner: string,
  repo: string,
  workflow: string = 'build.yml',
  maxRuns: number = 10
): Promise<Array<{ id: number; created_at: string; }>> {
  const baseUrl = `https://github.com/${owner}/${repo}/actions/workflows/${workflow}`;
  
  // 尝试使用镜像获取 HTML
  const mirrors = ['', ...currentConfig.fileMirrors.filter(m => m)];
  
  for (const mirror of mirrors) {
    try {
      const url = mirror ? buildMirrorUrl(baseUrl, mirror) : baseUrl;
      
      const html = await PromiseTimer(
        RequestUtil.HttpGetText(url),
        10000
      );
      
      // 从 HTML 中提取 run IDs 和时间
      // 格式: href="/NapNeko/NapCatQQ/actions/runs/20676123968"
      // 时间格式: <relative-time datetime="2026-01-03T10:37:29Z"
      const runPattern = new RegExp(`href="/${owner}/${repo}/actions/runs/(\\d+)"`, 'gi');
      const timePattern = /<relative-time\s+datetime="([^"]+)"/gi;
      
      // 提取所有时间
      const times: string[] = [];
      let timeMatch;
      while ((timeMatch = timePattern.exec(html)) !== null) {
        times.push(timeMatch[1]);
      }
      
      const runs: Array<{ id: number; created_at: string; }> = [];
      const foundIds = new Set<number>();
      let timeIndex = 0;
      
      let match;
      while ((match = runPattern.exec(html)) !== null && runs.length < maxRuns) {
        const id = parseInt(match[1]);
        if (!foundIds.has(id)) {
          foundIds.add(id);
          // 尝试获取对应的时间，每个 run 通常有两个时间（桌面和移动端显示）
          // 所以每找到一个 run，跳过两个时间
          const created_at = times[timeIndex] || new Date().toISOString();
          timeIndex += 2; // 跳过两个时间（桌面端和移动端各一个）
          runs.push({
            id,
            created_at,
          });
        }
      }
      
      if (runs.length > 0) {
        return runs;
      }
    } catch {
      continue;
    }
  }
  
  return [];
}

/**
 * 通过 API 获取最新的 workflow runs，然后直接拼接 nightly.link 下载链接
 * 无需解析 HTML，直接使用固定的 URL 格式
 * 
 * 策略：
 * 1. 优先使用 GitHub API
 * 2. API 失败时，从 GitHub Actions HTML 页面解析
 */
async function getArtifactsFromNightlyLink (
  owner: string,
  repo: string,
  workflow: string = 'build.yml',
  branch: string = 'main',
  maxRuns: number = 10
): Promise<ActionArtifact[]> {
  let workflowRuns: Array<{ id: number; head_sha?: string; created_at: string; }> = [];
  
  // 策略1: 优先尝试 GitHub API
  try {
    const endpoint = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?branch=${branch}&status=success&per_page=${maxRuns}`;
    
    const runsResponse = await PromiseTimer(
      RequestUtil.HttpGetJson<{
        workflow_runs: Array<{ id: number; head_sha: string; created_at: string; }>;
      }>(endpoint, 'GET', undefined, {
        'User-Agent': 'NapCat',
        'Accept': 'application/vnd.github.v3+json',
      }),
      10000
    );

    if (runsResponse.workflow_runs && runsResponse.workflow_runs.length > 0) {
      workflowRuns = runsResponse.workflow_runs;
    }
  } catch {
    // API 请求失败，继续尝试 HTML 解析
  }

  // 策略2: API 失败时，从 HTML 页面解析
  if (workflowRuns.length === 0) {
    workflowRuns = await getWorkflowRunsFromHtml(owner, repo, workflow, maxRuns);
  }

  if (workflowRuns.length === 0) {
    return [];
  }

  // 直接拼接 nightly.link URL
  // 格式: https://nightly.link/{owner}/{repo}/actions/runs/{run_id}/{artifact_name}.zip
  const artifacts: ActionArtifact[] = [];
  const artifactNames = ['NapCat.Framework', 'NapCat.Shell']; // 已知的 artifact 名称

  for (const run of workflowRuns) {
    for (const artifactName of artifactNames) {
      const mirror = currentConfig.nightlyLinkMirrors[0] || 'https://nightly.link';
      artifacts.push({
        id: run.id,
        name: artifactName,
        size_in_bytes: 0,
        created_at: run.created_at,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        archive_download_url: `${mirror}/${owner}/${repo}/actions/runs/${run.id}/${artifactName}.zip`,
        workflow_run_id: run.id,
        head_sha: run.head_sha,
      });
    }
  }

  return artifacts;
}

/**
 * 通过 GitHub API 获取 artifacts（主要方案）
 */
async function getArtifactsFromAPI (
  owner: string,
  repo: string,
  workflow: string = 'build.yml',
  branch: string = 'main',
  maxRuns: number = 10
): Promise<ActionArtifact[]> {
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?branch=${branch}&status=success&per_page=${maxRuns}`;

  const runsResponse = await PromiseTimer(
    RequestUtil.HttpGetJson<{
      workflow_runs: Array<{ id: number; head_sha: string; created_at: string; }>;
    }>(endpoint, 'GET', undefined, {
      'User-Agent': 'NapCat',
      'Accept': 'application/vnd.github.v3+json',
    }),
    10000
  );

  const workflowRuns = runsResponse.workflow_runs;
  if (!workflowRuns || workflowRuns.length === 0) {
    throw new Error('No successful workflow runs found');
  }

  // 获取所有 runs 的 artifacts
  const allArtifacts: ActionArtifact[] = [];

  for (const run of workflowRuns) {
    try {
      const artifactsEndpoint = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run.id}/artifacts`;
      const artifactsResponse = await PromiseTimer(
        RequestUtil.HttpGetJson<{
          artifacts: ActionArtifact[];
        }>(artifactsEndpoint, 'GET', undefined, {
          'User-Agent': 'NapCat',
          'Accept': 'application/vnd.github.v3+json',
        }),
        10000
      );

      if (artifactsResponse.artifacts) {
        // 为每个 artifact 添加 run 信息
        for (const artifact of artifactsResponse.artifacts) {
          artifact.workflow_run_id = run.id;
          artifact.head_sha = run.head_sha;
          allArtifacts.push(artifact);
        }
      }
    } catch {
      // 单个 run 获取失败，继续下一个
    }
  }

  return allArtifacts;
}

/**
 * 获取 GitHub Action 最新运行的 artifacts
 * 用于下载 nightly/dev 版本
 * 
 * 策略：
 * 1. 检查缓存（10分钟有效）
 * 2. 优先尝试从 nightly.link 获取（无需认证，更稳定）
 * 3. 如果失败，回退到 GitHub API
 */
export async function getLatestActionArtifacts (
  owner: string,
  repo: string,
  workflow: string = 'build.yml',
  branch: string = 'main',
  maxRuns: number = 10
): Promise<ActionArtifact[]> {
  const cacheKey = `${owner}/${repo}/${workflow}/${branch}`;
  
  // 检查缓存
  const cached = artifactsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < ARTIFACTS_CACHE_TTL) {
    return cached.artifacts;
  }

  let artifacts: ActionArtifact[] = [];

  // 策略1: 优先使用 nightly.link（更稳定，无需认证）
  try {
    artifacts = await getArtifactsFromNightlyLink(owner, repo, workflow, branch, maxRuns);
  } catch {
    // nightly.link 获取失败
  }

  // 策略2: 回退到 GitHub API
  if (artifacts.length === 0) {
    try {
      artifacts = await getArtifactsFromAPI(owner, repo, workflow, branch, maxRuns);
    } catch {
      // API 获取失败
    }
  }

  // 缓存结果（即使为空也缓存，避免频繁请求）
  if (artifacts.length > 0) {
    artifactsCache.set(cacheKey, {
      artifacts,
      timestamp: Date.now(),
    });
  }

  return artifacts;
}
