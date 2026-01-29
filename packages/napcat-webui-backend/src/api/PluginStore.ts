import { RequestHandler } from 'express';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { PluginStoreList } from '@/napcat-webui-backend/src/types/PluginStore';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import compressing from 'compressing';
import { findAvailableDownloadUrl, GITHUB_RAW_MIRRORS } from 'napcat-common/src/mirror';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';

// Helper to get the plugin manager adapter
const getPluginManager = (): OB11PluginMangerAdapter | null => {
  const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
  if (!ob11) return null;
  return ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter;
};

// 插件商店源配置
const PLUGIN_STORE_SOURCES = [
  'https://raw.githubusercontent.com/NapNeko/napcat-plugin-index/main/plugins.v4.json',
];

// 插件目录 - 使用 pathWrapper
const getPluginsDir = () => webUiPathWrapper.pluginPath;

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
async function downloadFile (url: string, destPath: string, customMirror?: string): Promise<void> {
  try {
    let downloadUrl: string;

    // 判断是否是 GitHub Release URL
    // 格式: https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}
    const githubReleasePattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//;

    if (githubReleasePattern.test(url)) {
      // 使用镜像系统查找可用的下载 URL（支持 GitHub Release 镜像）
      console.log(`Detected GitHub Release URL: ${url}`);
      console.log(`Custom mirror: ${customMirror || 'auto'}`);

      downloadUrl = await findAvailableDownloadUrl(url, {
        validateContent: false, // 不验证内容，只检查状态码和 Content-Type
        timeout: 5000, // 每个镜像测试5秒超时
        useFastMirrors: false, // 不使用快速镜像列表（避免测速阻塞）
        customMirror: customMirror || undefined, // 使用用户选择的镜像
      });

      console.log(`Selected download URL: ${downloadUrl}`);
    } else {
      // 其他URL直接下载
      console.log(`Direct download URL: ${url}`);
      downloadUrl = url;
    }

    console.log(`Starting download from: ${downloadUrl}`);

    // 确保目标目录存在
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log(`Created directory: ${destDir}`);
    }

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'NapCat-WebUI',
      },
      signal: AbortSignal.timeout(120000), // 实际下载120秒超时
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
  const PLUGINS_DIR = getPluginsDir();
  const pluginDir = path.join(PLUGINS_DIR, pluginId);

  console.log(`[extractPlugin] PLUGINS_DIR: ${PLUGINS_DIR}`);
  console.log(`[extractPlugin] pluginId: ${pluginId}`);
  console.log(`[extractPlugin] Target directory: ${pluginDir}`);
  console.log(`[extractPlugin] Zip file: ${zipPath}`);

  // 确保插件根目录存在
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    console.log(`[extractPlugin] Created plugins root directory: ${PLUGINS_DIR}`);
  }

  // 如果目录已存在，先删除
  if (fs.existsSync(pluginDir)) {
    console.log(`[extractPlugin] Directory exists, removing: ${pluginDir}`);
    fs.rmSync(pluginDir, { recursive: true, force: true });
  }

  // 创建插件目录
  fs.mkdirSync(pluginDir, { recursive: true });
  console.log(`[extractPlugin] Created directory: ${pluginDir}`);

  // 解压
  await compressing.zip.uncompress(zipPath, pluginDir);

  console.log(`[extractPlugin] Plugin extracted to: ${pluginDir}`);

  // 列出解压后的文件
  const files = fs.readdirSync(pluginDir);
  console.log(`[extractPlugin] Extracted files:`, files);
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
 * 安装插件（从商店）- 普通 POST 接口
 */
export const InstallPluginFromStoreHandler: RequestHandler = async (req, res) => {
  try {
    const { id, mirror } = req.body;

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
    const PLUGINS_DIR = getPluginsDir();
    const tempZipPath = path.join(PLUGINS_DIR, `${id}.temp.zip`);

    try {
      await downloadFile(plugin.downloadUrl, tempZipPath, mirror);

      // 解压插件
      await extractPlugin(tempZipPath, id);

      // 删除临时文件
      fs.unlinkSync(tempZipPath);

      // 如果 pluginManager 存在，立即注册插件
      const pluginManager = getPluginManager();
      if (pluginManager) {
        // 检查是否已注册，避免重复注册
        if (!pluginManager.getPluginInfo(id)) {
          await pluginManager.loadPluginById(id);
        }
      }

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

/**
 * 安装插件（从商店）- SSE 版本，实时推送进度
 */
export const InstallPluginFromStoreSSEHandler: RequestHandler = async (req, res) => {
  const { id, mirror } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Plugin ID is required' });
    return;
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendProgress = (message: string, progress?: number) => {
    res.write(`data: ${JSON.stringify({ message, progress })}\n\n`);
  };

  try {
    sendProgress('正在获取插件信息...', 10);

    // 获取插件信息
    const data = await fetchPluginList();
    const plugin = data.plugins.find(p => p.id === id);

    if (!plugin) {
      sendProgress('错误: 插件不存在', 0);
      res.write(`data: ${JSON.stringify({ error: 'Plugin not found in store' })}\n\n`);
      res.end();
      return;
    }

    sendProgress(`找到插件: ${plugin.name} v${plugin.version}`, 20);
    sendProgress(`下载地址: ${plugin.downloadUrl}`, 25);

    if (mirror && typeof mirror === 'string') {
      sendProgress(`使用镜像: ${mirror}`, 28);
    }

    // 下载插件
    const PLUGINS_DIR = getPluginsDir();
    const tempZipPath = path.join(PLUGINS_DIR, `${id}.temp.zip`);

    try {
      sendProgress('正在下载插件...', 30);
      await downloadFile(plugin.downloadUrl, tempZipPath, mirror as string | undefined);

      sendProgress('下载完成，正在解压...', 70);
      await extractPlugin(tempZipPath, id);

      sendProgress('解压完成，正在清理...', 90);
      fs.unlinkSync(tempZipPath);

      // 如果 pluginManager 存在，立即注册插件
      const pluginManager = getPluginManager();
      if (pluginManager) {
        // 检查是否已注册，避免重复注册
        if (!pluginManager.getPluginInfo(id)) {
          sendProgress('正在注册插件...', 95);
          await pluginManager.loadPluginById(id);
        }
      }

      sendProgress('安装成功！', 100);
      res.write(`data: ${JSON.stringify({
        success: true,
        message: 'Plugin installed successfully',
        plugin: plugin,
        installPath: path.join(PLUGINS_DIR, id),
      })}\n\n`);
      res.end();
    } catch (downloadError: any) {
      // 清理临时文件
      if (fs.existsSync(tempZipPath)) {
        fs.unlinkSync(tempZipPath);
      }
      sendProgress(`错误: ${downloadError.message}`, 0);
      res.write(`data: ${JSON.stringify({ error: downloadError.message })}\n\n`);
      res.end();
    }
  } catch (e: any) {
    sendProgress(`错误: ${e.message}`, 0);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
};
