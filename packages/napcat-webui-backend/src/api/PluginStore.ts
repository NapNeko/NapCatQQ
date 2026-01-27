import { RequestHandler } from 'express';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { PluginStoreList } from '@/napcat-webui-backend/src/types/PluginStore';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import compressing from 'compressing';
import { findAvailableDownloadUrl, GITHUB_RAW_MIRRORS } from 'napcat-common/src/mirror';

// 插件商店源配置
const PLUGIN_STORE_SOURCES = [
  'https://raw.githubusercontent.com/NapNeko/napcat-plugin-index/main/plugins.v4.json',
];

// 插件目录
const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

// 确保插件目录存在
if (!fs.existsSync(PLUGINS_DIR)) {
  fs.mkdirSync(PLUGINS_DIR, { recursive: true });
}

// 插件列表缓存
let pluginListCache: PluginStoreList | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10分钟缓存

/**
 * 从多个源获取插件列表，使用镜像系统
 * 带10分钟缓存
 */
async function fetchPluginList (): Promise<PluginStoreList> {
  // 检查缓存
  const now = Date.now();
  if (pluginListCache && (now - cacheTimestamp) < CACHE_TTL) {
    //console.log('Using cached plugin list');
    return pluginListCache;
  }

  const errors: string[] = [];

  for (const source of PLUGIN_STORE_SOURCES) {
    // 使用镜像系统的 raw 镜像列表
    for (const mirror of GITHUB_RAW_MIRRORS) {
      try {
        const url = mirror ? `${mirror}/${source.replace('https://raw.githubusercontent.com/', '')}` : source;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'NapCat-WebUI',
          },
          signal: AbortSignal.timeout(10000), // 10秒超时
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        //console.log(`Successfully fetched plugin list from: ${url}`);

        // 更新缓存
        pluginListCache = data as PluginStoreList;
        cacheTimestamp = now;

        return pluginListCache;
      } catch (e: any) {
        const errorMsg = `Failed to fetch from ${source} via mirror: ${e.message}`;
        console.warn(errorMsg);
        errors.push(errorMsg);
      }
    }
  }

  throw new Error(`All plugin sources failed:\n${errors.join('\n')}`);
}

/**
 * 下载文件，使用镜像系统
 * 自动识别 GitHub Release URL 并使用镜像加速
 */
async function downloadFile (url: string, destPath: string): Promise<void> {
  try {
    let downloadUrl: string;

    // 判断是否是 GitHub Release URL
    // 格式: https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}
    const githubReleasePattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//;

    if (githubReleasePattern.test(url)) {
      // 使用镜像系统查找可用的下载 URL（支持 GitHub Release 镜像）
      console.log(`Detected GitHub Release URL: ${url}`);
      downloadUrl = await findAvailableDownloadUrl(url, {
        validateContent: true,
        minFileSize: 1024, // 最小 1KB
        timeout: 60000, // 60秒超时
        useFastMirrors: true, // 使用快速镜像列表
      });
    } else {
      // 其他URL直接下载
      console.log(`Direct download URL: ${url}`);
      downloadUrl = url;
    }

    console.log(`Downloading from: ${downloadUrl}`);

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'NapCat-WebUI',
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // 写入文件
    const fileStream = createWriteStream(destPath);
    await pipeline(response.body as any, fileStream);

    console.log(`Successfully downloaded to: ${destPath}`);
  } catch (e: any) {
    // 删除可能的不完整文件
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    throw new Error(`Download failed: ${e.message}`);
  }
}

/**
 * 解压插件到指定目录
 */
async function extractPlugin (zipPath: string, pluginId: string): Promise<void> {
  const pluginDir = path.join(PLUGINS_DIR, pluginId);

  // 如果目录已存在，先删除
  if (fs.existsSync(pluginDir)) {
    fs.rmSync(pluginDir, { recursive: true, force: true });
  }

  // 创建插件目录
  fs.mkdirSync(pluginDir, { recursive: true });

  // 解压
  await compressing.zip.uncompress(zipPath, pluginDir);

  //console.log(`Plugin extracted to: ${pluginDir}`);
}

/**
 * 获取插件商店列表
 */
export const GetPluginStoreListHandler: RequestHandler = async (_req, res) => {
  try {
    const data = await fetchPluginList();
    return sendSuccess(res, data);
  } catch (e: any) {
    return sendError(res, 'Failed to fetch plugin store list: ' + e.message);
  }
};

/**
 * 获取单个插件详情
 */
export const GetPluginStoreDetailHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchPluginList();
    const plugin = data.plugins.find(p => p.id === id);

    if (!plugin) {
      return sendError(res, 'Plugin not found');
    }

    return sendSuccess(res, plugin);
  } catch (e: any) {
    return sendError(res, 'Failed to fetch plugin detail: ' + e.message);
  }
};

/**
 * 安装插件（从商店）
 */
export const InstallPluginFromStoreHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return sendError(res, 'Plugin ID is required');
    }

    // 获取插件信息
    const data = await fetchPluginList();
    const plugin = data.plugins.find(p => p.id === id);

    if (!plugin) {
      return sendError(res, 'Plugin not found in store');
    }

    // 下载插件
    const tempZipPath = path.join(PLUGINS_DIR, `${id}.temp.zip`);

    try {
      await downloadFile(plugin.downloadUrl, tempZipPath);

      // 解压插件
      await extractPlugin(tempZipPath, id);

      // 删除临时文件
      fs.unlinkSync(tempZipPath);

      return sendSuccess(res, {
        message: 'Plugin installed successfully',
        plugin: plugin,
        installPath: path.join(PLUGINS_DIR, id),
      });
    } catch (downloadError: any) {
      // 清理临时文件
      if (fs.existsSync(tempZipPath)) {
        fs.unlinkSync(tempZipPath);
      }
      throw downloadError;
    }
  } catch (e: any) {
    return sendError(res, 'Failed to install plugin: ' + e.message);
  }
};
