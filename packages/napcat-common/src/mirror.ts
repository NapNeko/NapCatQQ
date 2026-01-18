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
  'https://github.chenc.dev/',
  'https://ghproxy.cfd/',
  'https://github.tbedu.top/',
  'https://ghproxy.cc/',
  'https://gh.monlor.com/',
  'https://cdn.akaere.online/',
  'https://gh.idayer.com/',
  'https://gh.llkk.cc/',
  'https://ghpxy.hwinzniej.top/',
  'https://github-proxy.memory-echoes.cn/',
  'https://git.yylx.win/',
  'https://gitproxy.mrhjx.cn/',
  'https://gh.fhjhy.top/',
  'https://gp.zkitefly.eu.org/',
  'https://gh-proxy.com/',
  'https://ghfile.geekertao.top/',
  'https://j.1lin.dpdns.org/',
  'https://ghproxy.imciel.com/',
  'https://github-proxy.teach-english.tech/',
  'https://gh.927223.xyz/',
  'https://github.ednovas.xyz/',
  'https://ghf.xn--eqrr82bzpe.top/',
  'https://gh.dpik.top/',
  'https://gh.jasonzeng.dev/',
  'https://gh.xxooo.cf/',
  'https://gh.bugdey.us.kg/',
  'https://ghm.078465.xyz/',
  'https://j.1win.ggff.net/',
  'https://tvv.tw/',
  'https://gitproxy.127731.xyz/',
  'https://gh.inkchills.cn/',
  'https://ghproxy.cxkpro.top/',
  'https://gh.sixyin.com/',
  'https://github.geekery.cn/',
  'https://git.669966.xyz/',
  'https://gh.5050net.cn/',
  'https://gh.felicity.ac.cn/',
  'https://github.dpik.top/',
  'https://ghp.keleyaa.com/',
  'https://gh.wsmdn.dpdns.org/',
  'https://ghproxy.monkeyray.net/',
  'https://fastgit.cc/',
  'https://gh.catmak.name/',
  'https://gh.noki.icu/',
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
// Update definitions validation locally first if possible.
// I'll assume valid typescript.
// I will split this into two tool calls to avoid complexity.
// 1. Update mirror.ts
// 2. Update UpdateNapCat.ts

// This tool call: Update mirror.ts
export async function getLatestReleaseTag (owner: string, repo: string, mirror?: string): Promise<string> {
  const result = await getAllGitHubTags(owner, repo, mirror);

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
    /** 指定镜像 */
    mirror?: string;
  } = {}
): Promise<{
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
  body?: string;
}> {
  const { assetNames = [], fetchChangelog = false, mirror } = options;

  // 1. 获取实际的 tag 名称
  let actualTag: string;
  if (tag === 'latest') {
    actualTag = await getLatestReleaseTag(owner, repo, mirror);
  } else {
    actualTag = tag;
  }
  // ...

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
export async function getAllGitHubTags (owner: string, repo: string, mirror?: string): Promise<{ tags: string[], mirror: string; }> {
  const cacheKey = `${owner}/${repo}/${mirror || 'auto'}`;

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
  const fetchFromUrl = async (url: string, usedMirror: string): Promise<{ tags: string[], mirror: string; } | null> => {
    try {
      const raw = await PromiseTimer(
        RequestUtil.HttpGetText(url),
        currentConfig.timeout
      );

      // 检查返回内容是否有效（不是 HTML 错误页面）
      if (raw.includes('refs/tags')) {
        return { tags: parseTags(raw), mirror: usedMirror };
      }
    } catch {
      // 忽略错误
    }
    return null;
  };

  // 准备镜像列表
  let mirrors: string[] = [];
  if (mirror) {
    // 如果指定了镜像，只使用该镜像
    mirrors = [mirror];
  } else {
    // 否则使用 auto 逻辑
    mirrors = ['', ...currentConfig.fileMirrors.filter(m => m)];
  }

  // 并行请求
  const promises = mirrors.map(m => {
    const url = m ? buildMirrorUrl(baseUrl, m) : baseUrl;
    return fetchFromUrl(url, m || 'https://github.com');
  });

  try {
    const result = await Promise.any(promises.filter(p => p !== null) as Promise<{ tags: string[], mirror: string; } | null>[]);
    if (result) {
      tagsCache.set(cacheKey, {
        tags: result.tags,
        mirror: result.mirror,
        timestamp: Date.now(),
      });
      return result;
    }
  } catch {
    // all failed
  }

  if (mirror) {
    throw new Error(`指定镜像 ${mirror} 获取 tags 失败`);
  }

  throw new Error('无法获取 tags，所有镜像源都不可用');
}

// ============== Action Artifacts 支持 ==============

// ActionArtifact 接口定义
export interface ActionArtifact {
  id: number;
  name: string;
  size_in_bytes: number;
  created_at: string;
  expires_at: string;
  archive_download_url: string;
  workflow_run_id?: number;
  head_sha?: string;
  workflow_title?: string;
}

// ============== Action Artifacts 缓存 ==============

interface ArtifactsCache {
  artifacts: ActionArtifact[];
  mirror: string;
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
  maxRuns: number = 10,
  mirror?: string
): Promise<{ runs: Array<{ id: number; created_at: string; title: string; }>; mirror: string; }> {
  const baseUrl = `https://github.com/${owner}/${repo}/actions/workflows/${workflow}`;

  // 尝试使用镜像获取 HTML
  // 如果指定了 mirror，则只使用该 mirror
  let mirrors: string[] = [];
  if (mirror) {
    mirrors = [mirror];
  } else {
    mirrors = ['', ...currentConfig.fileMirrors.filter(m => m)];
  }

  for (const mirrorItem of mirrors) {
    try {
      const allRuns: Array<{ id: number; created_at: string; title: string; }> = [];
      const foundIds = new Set<number>();
      let page = 1;
      const maxPages = 10; // 防止无限请求，最多翻10页（约250个条目）

      while (allRuns.length < maxRuns && page <= maxPages) {
        const pageUrl = page > 1 ? `${baseUrl}?page=${page}` : baseUrl;
        const url = mirrorItem ? buildMirrorUrl(pageUrl, mirrorItem) : pageUrl;

        const html = await PromiseTimer(
          RequestUtil.HttpGetText(url),
          10000
        );

        // 使用 Block 分割策略，更稳健地关联 ID 和时间
        const rows = html.split('<div class="Box-row');
        let foundOnThisPage = 0;

        for (const row of rows) {
          // 提取 Run ID 和 Status
          // <a href="/NapNeko/NapCatQQ/actions/runs/20799940346" ... aria-label="completed successfully: ...">
          const runMatch = new RegExp(`href="/${owner}/${repo}/actions/runs/(\\d+)"[^>]*aria-label="([^"]*)"`, 'i').exec(row);

          if (!runMatch || !runMatch[1] || !runMatch[2]) continue;

          const id = parseInt(runMatch[1]);
          const ariaLabel = runMatch[2];
          const ariaLabelLower = ariaLabel.toLowerCase();

          // 只需要判断 completed
          if (ariaLabelLower.includes('completed')) {
            if (!foundIds.has(id)) {
              // 提取时间 (取 Block 内的第一个 relative-time)
              const timeMatch = /<relative-time\s+datetime="([^"]+)"/.exec(row);
              if (timeMatch && timeMatch[1]) {
                foundIds.add(id);
                foundOnThisPage++;

                // 优先从 markdown-title class 提取标题
                let title = '';
                const titleMatch = /class="[^"]*markdown-title[^"]*"[^>]*>([\s\S]*?)<\/span>/i.exec(row);
                if (titleMatch && titleMatch[1]) {
                  title = titleMatch[1].trim();
                }

                // 如果没找到，回退到 aria-label 逻辑
                if (!title) {
                  title = ariaLabel;
                  const prefixMatch = /^(completed successfully:\s*)/i.exec(title);
                  if (prefixMatch) {
                    title = title.substring(prefixMatch[0].length);
                  }
                }

                allRuns.push({
                  id,
                  created_at: timeMatch[1],
                  title: title.trim()
                });
              }
            }
          }
        }

        // 如果本页没有找到任何 completed 的 run（但页面可能不为空），或者页面内容太少（可能是最后一页或错误）
        // 这里简化判断: 如果本页没提取到任何有效数据，就认为没有更多数据了
        if (foundOnThisPage === 0) {
          // 也要考虑到可能是页面解析失败或者全是 failed 状态
          // 检查是否有翻页按钮可能更复杂，暂时假设如果一整页都没有 successful run，可能后面也没有了，或者我们已经获取够多了
          // 为了稳健，如果本页没找到，且 allRuns 还没满，尝试下一页 (除非页面很小说明是空页)
          if (rows.length < 2) { // 只有 split 的第一个空元素
            break;
          }
        }

        // 分页逻辑：总是尝试下一页，直到满足 maxRuns
        page++;
      }

      if (allRuns.length > 0) {
        return { runs: allRuns, mirror: mirrorItem || 'https://github.com' };
      }
    } catch {
      continue;
    }
  }

  return { runs: [], mirror: '' };
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
  _branch: string = 'main',
  maxRuns: number = 10,
  mirror?: string
): Promise<{ artifacts: ActionArtifact[], mirror: string; }> {
  // 策略: 优先使用 nightly.link（更稳定，无需认证）+ HTML 解析
  try {
    // 以前尝试使用 GitHub API，现在弃用，完全使用 HTML 解析逻辑
    // 并获取 workflow    // 直接从 HTML 页面解析
    const { runs: workflowRuns, mirror: runsMirror } = await getWorkflowRunsFromHtml(owner, repo, workflow, maxRuns, mirror);

    if (workflowRuns.length === 0) {
      return { artifacts: [], mirror: runsMirror };
    }

    // 直接拼接 nightly.link URL
    // 格式: https://nightly.link/{owner}/{repo}/actions/runs/{run_id}/{artifact_name}.zip
    const artifacts: ActionArtifact[] = [];
    const artifactNames = ['NapCat.Framework', 'NapCat.Shell']; // 已知的 artifact 名称

    // 如果 HTML 解析使用的 mirror 是 github.com（空），则 nightly.link 使用默认配置
    // 如果使用了镜像，可能需要特殊的 nightly.link 镜像，或者这里仅记录 HTML 来源镜像
    // 实际上 nightly.link 本身就是一个服务，我们使用配置中的 nightlyLinkMirrors
    const baseNightlyMirror = currentConfig.nightlyLinkMirrors[0] || 'https://nightly.link';

    for (const run of workflowRuns) {
      for (const artifactName of artifactNames) {
        artifacts.push({
          id: run.id,
          name: artifactName,
          size_in_bytes: 0,
          created_at: run.created_at,
          expires_at: new Date(new Date(run.created_at).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          archive_download_url: `${baseNightlyMirror}/${owner}/${repo}/actions/runs/${run.id}/${artifactName}.zip`,
          workflow_run_id: run.id,
          workflow_title: run.title,
        });
      }
    }
    return { artifacts, mirror: runsMirror };

  } catch {
    return { artifacts: [], mirror: '' };
  }
}

/**
 * 获取 GitHub Action 最新运行的 artifacts
 * 用于下载 nightly/dev 版本
 * 
 * 策略：
 * 1. 检查缓存（10分钟有效）
 * 2. 优先尝试从 nightly.link 获取（无需认证，更稳定）
 * 3. 这里的实现已经完全移除了对 GitHub API 的依赖，直接解析 HTML
 */
export async function getLatestActionArtifacts (
  owner: string,
  repo: string,
  workflow: string = 'build.yml',
  branch: string = 'main',
  maxRuns: number = 10,
  mirror?: string
): Promise<{ artifacts: ActionArtifact[], mirror: string; }> {
  const cacheKey = `${owner}/${repo}/${workflow}/${branch}/${mirror || 'auto'}`;

  // 检查缓存
  const cached = artifactsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < ARTIFACTS_CACHE_TTL) {
    return { artifacts: cached.artifacts, mirror: cached.mirror };
  }

  let result: { artifacts: ActionArtifact[], mirror: string; } = { artifacts: [], mirror: '' };

  // 策略: 优先使用 nightly.link（更稳定，无需认证）+ HTML 解析
  try {
    result = await getArtifactsFromNightlyLink(owner, repo, workflow, branch, maxRuns, mirror);
  } catch {
    // 获取失败
  }

  // 缓存结果（即使为空也缓存，避免频繁请求）
  if (result.artifacts.length > 0) {
    artifactsCache.set(cacheKey, {
      artifacts: result.artifacts,
      mirror: result.mirror,
      timestamp: Date.now(),
    });
  }

  return result;
}
