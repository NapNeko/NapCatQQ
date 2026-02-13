/**
 * npm 注册表工具模块
 * 提供从 npm registry 获取包信息和下载 tarball 的能力
 * 适用于 Electron 环境，不依赖系统安装的 npm CLI
 *
 * 设计目标：
 * - 通过 HTTP API 直接与 npm registry 交互
 * - 支持多个 registry 镜像源
 * - 下载 tarball 并解压到指定目录（与现有 zip 安装流程一致）
 */

import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

// ============== npm Registry 镜像源 ==============

/**
 * npm Registry 镜像列表
 * 按优先级排序，优先使用国内镜像
 */
export const NPM_REGISTRY_MIRRORS = [
  'https://registry.npmmirror.com',      // 淘宝镜像（国内首选）
  'https://registry.npmjs.org',           // 官方源
];

// ============== 类型定义 ==============

/** npm 包的简要版本信息 */
export interface NpmPackageVersionInfo {
  name: string;
  version: string;
  description?: string;
  author?: string | { name: string; email?: string; url?: string };
  homepage?: string;
  repository?: string | { type: string; url: string };
  keywords?: string[];
  dist: {
    tarball: string;
    shasum?: string;
    integrity?: string;
    fileCount?: number;
    unpackedSize?: number;
  };
  /** 插件扩展字段 */
  napcat?: {
    tags?: string[];
    minVersion?: string;
    displayName?: string;
  };
}

/** npm 包的完整元数据（简化版） */
export interface NpmPackageMetadata {
  name: string;
  description?: string;
  'dist-tags': Record<string, string>;
  versions: Record<string, NpmPackageVersionInfo>;
  time?: Record<string, string>;
  readme?: string;
  homepage?: string;
  repository?: string | { type: string; url: string };
  author?: string | { name: string; email?: string; url?: string };
  keywords?: string[];
}

// ============== 缓存 ==============

interface MetadataCache {
  data: NpmPackageMetadata;
  timestamp: number;
}

const metadataCache: Map<string, MetadataCache> = new Map();
const METADATA_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// ============== 核心功能 ==============

/**
 * 从 npm registry 获取包的元数据
 * @param packageName 包名（如 "napcat-plugin-example"）
 * @param registry 指定的 registry URL（可选）
 * @param forceRefresh 强制跳过缓存
 */
export async function fetchNpmPackageMetadata (
  packageName: string,
  registry?: string,
  forceRefresh: boolean = false
): Promise<NpmPackageMetadata> {
  // 检查缓存
  const cacheKey = `${registry || 'auto'}:${packageName}`;
  if (!forceRefresh) {
    const cached = metadataCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < METADATA_CACHE_TTL) {
      return cached.data;
    }
  }

  const registries = registry ? [registry] : NPM_REGISTRY_MIRRORS;
  const errors: string[] = [];

  for (const reg of registries) {
    try {
      const url = `${reg.replace(/\/$/, '')}/${encodeURIComponent(packageName)}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NapCat-PluginManager',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.status === 404) {
        throw new Error(`包 "${packageName}" 在 npm 上不存在`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as NpmPackageMetadata;

      // 更新缓存
      metadataCache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (e: any) {
      errors.push(`${reg}: ${e.message}`);
      // 如果是 404，直接抛出，不再尝试其他镜像
      if (e.message.includes('不存在')) {
        throw e;
      }
    }
  }

  throw new Error(`获取 npm 包 "${packageName}" 信息失败:\n${errors.join('\n')}`);
}

/**
 * 获取包的最新版本信息
 */
export async function fetchNpmLatestVersion (
  packageName: string,
  registry?: string
): Promise<NpmPackageVersionInfo> {
  const metadata = await fetchNpmPackageMetadata(packageName, registry);
  const latestTag = metadata['dist-tags']?.['latest'];

  if (!latestTag) {
    throw new Error(`包 "${packageName}" 没有 latest 标签`);
  }

  const versionInfo = metadata.versions[latestTag];
  if (!versionInfo) {
    throw new Error(`包 "${packageName}" 的 latest 版本 (${latestTag}) 信息不存在`);
  }

  return versionInfo;
}

/**
 * 获取包的指定版本信息
 */
export async function fetchNpmVersionInfo (
  packageName: string,
  version: string,
  registry?: string
): Promise<NpmPackageVersionInfo> {
  const metadata = await fetchNpmPackageMetadata(packageName, registry);
  const versionInfo = metadata.versions[version];

  if (!versionInfo) {
    const availableVersions = Object.keys(metadata.versions);
    throw new Error(
      `版本 "${version}" 不存在。可用版本: ${availableVersions.slice(-5).join(', ')}`
    );
  }

  return versionInfo;
}

/**
 * 下载 npm tarball 文件
 * @param tarballUrl tarball 下载地址
 * @param destPath 保存路径
 * @param registry 用于替换 tarball URL 中的 registry 域名（镜像加速）
 * @param onProgress 进度回调
 * @param timeout 超时时间（毫秒）
 */
export async function downloadNpmTarball (
  tarballUrl: string,
  destPath: string,
  registry?: string,
  onProgress?: (percent: number, downloaded: number, total: number, speed: number) => void,
  timeout: number = 120000
): Promise<void> {
  // 如果指定了 registry，替换 tarball URL 中的域名
  let downloadUrl = tarballUrl;
  if (registry) {
    // tarball URL 通常是 https://registry.npmjs.org/package/-/package-1.0.0.tgz
    // 替换为 https://registry.npmmirror.com/package/-/package-1.0.0.tgz
    try {
      const tarballUrlObj = new URL(tarballUrl);
      const registryUrlObj = new URL(registry);
      tarballUrlObj.hostname = registryUrlObj.hostname;
      tarballUrlObj.protocol = registryUrlObj.protocol;
      if (registryUrlObj.port) {
        tarballUrlObj.port = registryUrlObj.port;
      }
      downloadUrl = tarballUrlObj.toString();
    } catch {
      // URL 解析失败，使用原始 URL
    }
  }

  try {
    // 确保目标目录存在
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    if (onProgress) {
      onProgress(0, 0, 0, 0);
    }

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'NapCat-PluginManager',
      },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const totalLength = Number(response.headers.get('content-length')) || 0;
    let downloaded = 0;
    let lastTime = Date.now();
    let lastDownloaded = 0;

    // 进度监控
    // eslint-disable-next-line @stylistic/generator-star-spacing
    const progressMonitor = async function* (source: any) {
      for await (const chunk of source) {
        downloaded += chunk.length;
        const now = Date.now();
        const elapsed = now - lastTime;

        if (elapsed >= 500 || (totalLength && downloaded === totalLength)) {
          const percent = totalLength ? Math.round((downloaded / totalLength) * 100) : 0;
          const speed = (downloaded - lastDownloaded) / (elapsed / 1000);

          if (onProgress) {
            onProgress(percent, downloaded, totalLength, speed);
          }

          lastTime = now;
          lastDownloaded = downloaded;
        }

        yield chunk;
      }
    };

    const fileStream = createWriteStream(destPath);
    await pipeline(progressMonitor(response.body), fileStream);
  } catch (e: any) {
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    throw new Error(`下载 npm 包失败: ${e.message}`);
  }
}

/**
 * 从 npm 包的元数据中提取作者名
 */
export function extractAuthorName (
  author?: string | { name: string; email?: string; url?: string }
): string {
  if (!author) return 'unknown';
  if (typeof author === 'string') return author;
  return author.name || 'unknown';
}

/**
 * 从 npm 包的元数据中提取 homepage
 */
export function extractHomepage (
  homepage?: string,
  repository?: string | { type: string; url: string }
): string | undefined {
  if (homepage) return homepage;
  if (!repository) return undefined;
  if (typeof repository === 'string') return repository;
  // 转换 git+https://github.com/xxx/yyy.git → https://github.com/xxx/yyy
  return repository.url
    ?.replace(/^git\+/, '')
    ?.replace(/\.git$/, '');
}

/**
 * 清除 npm 元数据缓存
 */
export function clearNpmMetadataCache (): void {
  metadataCache.clear();
}
