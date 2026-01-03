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

// ============== 镜像配置接口 ==============

export interface MirrorConfig {
  /** 文件下载镜像（用于 release assets） */
  fileMirrors: string[];
  /** API 镜像 */
  apiMirrors: string[];
  /** Raw 文件镜像 */
  rawMirrors: string[];
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
    if (useFastMirrors) {
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

  // 3. 测试镜像源（已按延迟排序）
  let testedCount = 0;
  for (const mirror of mirrors) {
    if (!mirror) continue; // 跳过空字符串
    const mirrorUrl = buildMirrorUrl(originalUrl, mirror);
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

// 缓存 tags 结果（5 分钟有效）
const TAGS_CACHE_TTL = 5 * 60 * 1000;
const tagsCache: Map<string, TagsCache> = new Map();

/**
 * 获取所有 GitHub tags（带缓存）
 * 使用懒加载的快速镜像列表，按测速延迟排序依次尝试
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
  const fetchFromUrl = async (url: string): Promise<string[] | null> => {
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
        return tags;
      }
      return null;
    } catch {
      return null;
    }
  };

  // 获取快速镜像列表（懒加载，首次调用会测速，已按延迟排序）
  let fastMirrors: string[] = [];
  try {
    fastMirrors = await getFastMirrors();
  } catch (e) {
    // 忽略错误，继续使用空列表
  }

  // 构建 URL 列表（快速镜像 + 原始 URL）
  const mirrorUrls = fastMirrors.filter(m => m).map(m => ({ url: buildMirrorUrl(baseUrl, m), mirror: m }));
  mirrorUrls.push({ url: baseUrl, mirror: 'github.com' }); // 添加原始 URL

  // 按顺序尝试每个镜像（已按延迟排序），成功即返回
  for (const { url, mirror } of mirrorUrls) {
    const tags = await fetchFromUrl(url);
    if (tags && tags.length > 0) {
      // 缓存结果
      tagsCache.set(cacheKey, { tags, mirror, timestamp: Date.now() });
      return { tags, mirror };
    }
  }

  // 如果快速镜像都失败，回退到原始镜像列表
  const allMirrors = currentConfig.fileMirrors.filter(m => m);
  for (const mirror of allMirrors) {
    // 跳过已经尝试过的镜像
    if (fastMirrors.includes(mirror)) continue;

    const url = buildMirrorUrl(baseUrl, mirror);
    const tags = await fetchFromUrl(url);
    if (tags && tags.length > 0) {
      // 缓存结果
      tagsCache.set(cacheKey, { tags, mirror, timestamp: Date.now() });
      return { tags, mirror };
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

/**
 * 获取 GitHub Action 最新运行的 artifacts
 * 用于下载 nightly/dev 版本
 */
export async function getLatestActionArtifacts (
  owner: string,
  repo: string,
  workflow: string = 'build.yml',
  branch: string = 'main',
  maxRuns: number = 10
): Promise<ActionArtifact[]> {
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?branch=${branch}&status=success&per_page=${maxRuns}`;

  try {
    const runsResponse = await RequestUtil.HttpGetJson<{
      workflow_runs: Array<{ id: number; head_sha: string; created_at: string; }>;
    }>(endpoint, 'GET', undefined, {
      'User-Agent': 'NapCat',
      'Accept': 'application/vnd.github.v3+json',
    });

    const workflowRuns = runsResponse.workflow_runs;
    if (!workflowRuns || workflowRuns.length === 0) {
      throw new Error('No successful workflow runs found');
    }

    // 获取所有 runs 的 artifacts
    const allArtifacts: ActionArtifact[] = [];

    for (const run of workflowRuns) {
      try {
        const artifactsEndpoint = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run.id}/artifacts`;
        const artifactsResponse = await RequestUtil.HttpGetJson<{
          artifacts: ActionArtifact[];
        }>(artifactsEndpoint, 'GET', undefined, {
          'User-Agent': 'NapCat',
          'Accept': 'application/vnd.github.v3+json',
        });

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
  } catch {
    return [];
  }
}
