import { RequestHandler } from 'express';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { PluginStoreList, PluginStoreItem } from '@/napcat-webui-backend/src/types/PluginStore';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import compressing from 'compressing';
import { findAvailableDownloadUrl, GITHUB_RAW_MIRRORS } from 'napcat-common/src/mirror';
import {
  fetchNpmPackageMetadata,
  fetchNpmLatestVersion,
  fetchNpmVersionInfo,
  downloadNpmTarball,
  extractAuthorName,
  extractHomepage,
  NPM_REGISTRY_MIRRORS,
} from 'napcat-common/src/npm-registry';
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

/**
 * 验证插件 ID，防止路径注入攻击
 */
function validatePluginId (id: any): string {
  if (typeof id !== 'string') {
    throw new Error('Invalid plugin ID');
  }
  // 仅允许字母、数字、点、下划线、连字符，禁止路径遍历字符
  // 通过 path.basename 进一步确保不包含路径分隔符
  const safeId = path.basename(id);
  if (!/^[a-zA-Z0-9._-]+$/.test(safeId) || safeId !== id) {
    throw new Error('Invalid plugin ID format');
  }
  return safeId;
}

// 插件列表缓存
let pluginListCache: PluginStoreList | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10分钟缓存

/**
 * 从多个源获取插件列表，使用镜像系统
 * 带10分钟缓存，支持强制刷新
 */
async function fetchPluginList (forceRefresh: boolean = false): Promise<PluginStoreList> {
  // 检查缓存（如果不是强制刷新）
  const now = Date.now();
  if (!forceRefresh && pluginListCache && (now - cacheTimestamp) < CACHE_TTL) {
    // console.log('Using cached plugin list');
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
        // console.log(`Successfully fetched plugin list from: ${url}`);

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
async function downloadFile (
  url: string,
  destPath: string,
  customMirror?: string,
  onProgress?: (percent: number, downloaded: number, total: number, speed: number) => void,
  timeout: number = 120000 // 默认120秒超时
): Promise<void> {
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
      signal: AbortSignal.timeout(timeout), // 使用传入的超时时间
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const totalLength = Number(response.headers.get('content-length')) || 0;

    // 初始进度通知
    if (onProgress) {
      onProgress(0, 0, totalLength, 0);
    }

    let downloaded = 0;
    let lastTime = Date.now();
    let lastDownloaded = 0;

    // 进度监控流
    // eslint-disable-next-line @stylistic/generator-star-spacing
    const progressMonitor = async function* (source: any) {
      for await (const chunk of source) {
        downloaded += chunk.length;
        const now = Date.now();
        const elapsedSinceLast = now - lastTime;

        // 每隔 500ms 或完成时计算一次速度并更新进度
        if (elapsedSinceLast >= 500 || (totalLength && downloaded === totalLength)) {
          const percent = totalLength ? Math.round((downloaded / totalLength) * 100) : 0;
          const speed = (downloaded - lastDownloaded) / (elapsedSinceLast / 1000); // bytes/s

          if (onProgress) {
            onProgress(percent, downloaded, totalLength, speed);
          }

          lastTime = now;
          lastDownloaded = downloaded;
        }

        yield chunk;
      }
    };

    // 写入文件
    const fileStream = createWriteStream(destPath);
    await pipeline(progressMonitor(response.body), fileStream);

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
  // 验证 pluginId 确保安全
  const safeId = validatePluginId(pluginId);
  const PLUGINS_DIR = getPluginsDir();
  const pluginDir = path.join(PLUGINS_DIR, safeId);
  const dataDir = path.join(pluginDir, 'data');
  const tempDataDir = path.join(PLUGINS_DIR, `${safeId}.data.backup`);

  console.log(`[extractPlugin] PLUGINS_DIR: ${PLUGINS_DIR}`);
  console.log(`[extractPlugin] pluginId: ${safeId}`);
  console.log(`[extractPlugin] Target directory: ${pluginDir}`);
  console.log(`[extractPlugin] Zip file: ${zipPath}`);

  // 确保插件根目录存在
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    console.log(`[extractPlugin] Created plugins root directory: ${PLUGINS_DIR}`);
  }

  // 如果目录已存在，先备份 data 文件夹，再删除
  let hasDataBackup = false;
  if (fs.existsSync(pluginDir)) {
    // 备份 data 文件夹
    if (fs.existsSync(dataDir)) {
      console.log(`[extractPlugin] Backing up data directory: ${dataDir}`);
      if (fs.existsSync(tempDataDir)) {
        fs.rmSync(tempDataDir, { recursive: true, force: true });
      }
      fs.renameSync(dataDir, tempDataDir);
      hasDataBackup = true;
    }

    console.log(`[extractPlugin] Directory exists, removing: ${pluginDir}`);
    fs.rmSync(pluginDir, { recursive: true, force: true });
  }

  // 创建插件目录
  fs.mkdirSync(pluginDir, { recursive: true });
  console.log(`[extractPlugin] Created directory: ${pluginDir}`);

  try {
    // 解压
    await compressing.zip.uncompress(zipPath, pluginDir);

    console.log(`[extractPlugin] Plugin extracted to: ${pluginDir}`);

    // 恢复 data 文件夹
    if (hasDataBackup && fs.existsSync(tempDataDir)) {
      // 如果新版本也有 data 文件夹，先删除
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }
      console.log(`[extractPlugin] Restoring data directory: ${dataDir}`);
      fs.renameSync(tempDataDir, dataDir);
    }
  } catch (e) {
    // 解压失败时，尝试恢复 data 文件夹
    if (hasDataBackup && fs.existsSync(tempDataDir)) {
      console.log('[extractPlugin] Extract failed, restoring data directory');
      if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir, { recursive: true });
      }
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }
      fs.renameSync(tempDataDir, dataDir);
    }
    throw e;
  }

  // 列出解压后的文件
  const files = fs.readdirSync(pluginDir);
  console.log('[extractPlugin] Extracted files:', files);
}

/**
 * 解压 npm tarball (.tgz) 到指定目录
 * npm tarball 解压后通常有一个 "package/" 前缀目录，需要去掉
 */
async function extractNpmTarball (tgzPath: string, pluginId: string): Promise<void> {
  const safeId = validatePluginId(pluginId);
  const PLUGINS_DIR = getPluginsDir();
  const pluginDir = path.join(PLUGINS_DIR, safeId);
  const dataDir = path.join(pluginDir, 'data');
  const tempDataDir = path.join(PLUGINS_DIR, `${safeId}.data.backup`);
  const tempExtractDir = path.join(PLUGINS_DIR, `${safeId}.npm.temp`);

  console.log(`[extractNpmTarball] pluginId: ${safeId}, tgz: ${tgzPath}`);

  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }

  // 备份 data 目录
  let hasDataBackup = false;
  if (fs.existsSync(pluginDir)) {
    if (fs.existsSync(dataDir)) {
      if (fs.existsSync(tempDataDir)) {
        fs.rmSync(tempDataDir, { recursive: true, force: true });
      }
      fs.renameSync(dataDir, tempDataDir);
      hasDataBackup = true;
    }
    fs.rmSync(pluginDir, { recursive: true, force: true });
  }

  // 创建临时解压目录
  if (fs.existsSync(tempExtractDir)) {
    fs.rmSync(tempExtractDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempExtractDir, { recursive: true });

  try {
    // 解压 tgz（npm tarball 格式）
    await compressing.tgz.uncompress(tgzPath, tempExtractDir);

    // npm tarball 解压后通常有 "package/" 目录
    const extractedItems = fs.readdirSync(tempExtractDir);
    let sourceDir = tempExtractDir;

    if (extractedItems.length === 1 && extractedItems[0]) {
      const singleDir = path.join(tempExtractDir, extractedItems[0]);
      if (fs.statSync(singleDir).isDirectory()) {
        sourceDir = singleDir;
      }
    }

    // 移动到目标目录
    fs.renameSync(sourceDir, pluginDir);

    // 清理临时目录
    if (sourceDir !== tempExtractDir && fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }

    // 恢复 data 目录
    if (hasDataBackup && fs.existsSync(tempDataDir)) {
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }
      fs.renameSync(tempDataDir, dataDir);
    }

    console.log(`[extractNpmTarball] Extracted npm package to: ${pluginDir}`);
  } catch (e) {
    if (fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }
    if (hasDataBackup && fs.existsSync(tempDataDir)) {
      if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir, { recursive: true });
      }
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }
      fs.renameSync(tempDataDir, dataDir);
    }
    throw e;
  }
}

/**
 * 获取插件商店列表
 */
export const GetPluginStoreListHandler: RequestHandler = async (req, res) => {
  try {
    // 支持 forceRefresh 查询参数强制刷新缓存
    const forceRefresh = req.query['forceRefresh'] === 'true';
    const data = await fetchPluginList(forceRefresh);
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
    const id = validatePluginId(req.params['id']);
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
 * 支持 npm 和 github 两种来源
 */
export const InstallPluginFromStoreHandler: RequestHandler = async (req, res) => {
  try {
    const { id: rawId, mirror, registry } = req.body;

    if (!rawId) {
      return sendError(res, 'Plugin ID is required');
    }

    const id = validatePluginId(rawId);

    // 获取插件信息
    const data = await fetchPluginList();
    const plugin = data.plugins.find(p => p.id === id);

    if (!plugin) {
      return sendError(res, 'Plugin not found in store');
    }

    // 检查是否已安装相同版本
    const pm = getPluginManager();
    if (pm) {
      const installedInfo = pm.getPluginInfo(id);
      if (installedInfo && installedInfo.version === plugin.version) {
        return sendError(res, '该插件已安装且版本相同，无需重复安装');
      }
    }

    const PLUGINS_DIR = getPluginsDir();
    const isNpmSource = plugin.source === 'npm' && plugin.npmPackage;

    if (isNpmSource) {
      // npm 安装流程
      const tempTgzPath = path.join(PLUGINS_DIR, `${id}.temp.tgz`);
      try {
        const versionInfo = await fetchNpmLatestVersion(plugin.npmPackage!, registry);
        await downloadNpmTarball(versionInfo.dist.tarball, tempTgzPath, registry, undefined, 300000);
        await extractNpmTarball(tempTgzPath, id);
        fs.unlinkSync(tempTgzPath);

        const pluginManager = getPluginManager();
        if (pluginManager) {
          if (pluginManager.getPluginInfo(id)) {
            await pluginManager.reloadPlugin(id);
          } else {
            await pluginManager.loadPluginById(id);
          }
        }

        return sendSuccess(res, {
          message: 'Plugin installed successfully (npm)',
          plugin,
          installPath: path.join(PLUGINS_DIR, id),
        });
      } catch (e: any) {
        if (fs.existsSync(tempTgzPath)) fs.unlinkSync(tempTgzPath);
        throw e;
      }
    } else {
      // GitHub 安装流程（向后兼容）
      const tempZipPath = path.join(PLUGINS_DIR, `${id}.temp.zip`);
      try {
        await downloadFile(plugin.downloadUrl, tempZipPath, mirror, undefined, 300000);
        await extractPlugin(tempZipPath, id);
        fs.unlinkSync(tempZipPath);

        const pluginManager = getPluginManager();
        if (pluginManager) {
          if (pluginManager.getPluginInfo(id)) {
            await pluginManager.reloadPlugin(id);
          } else {
            await pluginManager.loadPluginById(id);
          }
        }

        return sendSuccess(res, {
          message: 'Plugin installed successfully',
          plugin,
          installPath: path.join(PLUGINS_DIR, id),
        });
      } catch (downloadError: any) {
        if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath);
        throw downloadError;
      }
    }
  } catch (e: any) {
    return sendError(res, 'Failed to install plugin: ' + e.message);
  }
};

/**
 * 安装插件（从商店）- SSE 版本，实时推送进度
 * 支持 npm 和 github 两种来源
 */
export const InstallPluginFromStoreSSEHandler: RequestHandler = async (req, res) => {
  const { id: rawId, mirror, registry } = req.query;

  if (!rawId || typeof rawId !== 'string') {
    res.status(400).json({ error: 'Plugin ID is required' });
    return;
  }

  let id: string;
  try {
    id = validatePluginId(rawId);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
    return;
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendProgress = (message: string, progress?: number, detail?: any) => {
    res.write(`data: ${JSON.stringify({ message, progress, ...detail })}\n\n`);
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

    // 检查是否已安装相同版本
    const pm = getPluginManager();
    if (pm) {
      const installedInfo = pm.getPluginInfo(id);
      if (installedInfo && installedInfo.version === plugin.version) {
        sendProgress('错误: 该插件已安装且版本相同', 0);
        res.write(`data: ${JSON.stringify({ error: '该插件已安装且版本相同，无需重复安装' })}\n\n`);
        res.end();
        return;
      }
    }

    sendProgress(`找到插件: ${plugin.name} v${plugin.version}`, 20);

    const isNpmSource = plugin.source === 'npm' && plugin.npmPackage;
    const PLUGINS_DIR = getPluginsDir();

    if (isNpmSource) {
      // ========== npm 安装流程 ==========
      const npmRegistry = (registry && typeof registry === 'string') ? registry : undefined;
      sendProgress(`来源: npm (${plugin.npmPackage})`, 25);

      if (npmRegistry) {
        sendProgress(`使用 npm 镜像: ${npmRegistry}`, 28);
      }

      const tempTgzPath = path.join(PLUGINS_DIR, `${id}.temp.tgz`);

      try {
        sendProgress('正在从 npm 获取版本信息...', 30);
        const versionInfo = await fetchNpmLatestVersion(plugin.npmPackage!, npmRegistry);
        sendProgress(`tarball: ${versionInfo.dist.tarball}`, 35);

        sendProgress('正在下载插件包...', 40);
        await downloadNpmTarball(
          versionInfo.dist.tarball,
          tempTgzPath,
          npmRegistry,
          (percent, downloaded, total, speed) => {
            const overallProgress = 40 + Math.round(percent * 0.4);
            const downloadedMb = (downloaded / 1024 / 1024).toFixed(1);
            const totalMb = total ? (total / 1024 / 1024).toFixed(1) : '?';
            const speedMb = (speed / 1024 / 1024).toFixed(2);
            const eta = (total > 0 && speed > 0) ? Math.round((total - downloaded) / speed) : -1;

            sendProgress(`正在下载插件... ${percent}%`, overallProgress, {
              downloaded,
              total,
              speed,
              eta,
              downloadedStr: `${downloadedMb}MB`,
              totalStr: `${totalMb}MB`,
              speedStr: `${speedMb}MB/s`,
            });
          },
          300000,
        );

        sendProgress('下载完成，正在解压 npm 包...', 85);
        await extractNpmTarball(tempTgzPath, id);

        sendProgress('解压完成，正在清理...', 95);
        fs.unlinkSync(tempTgzPath);

        // 注册到 pluginManager
        const pluginManager = getPluginManager();
        if (pluginManager) {
          if (pluginManager.getPluginInfo(id)) {
            sendProgress('正在刷新插件信息...', 95);
            await pluginManager.reloadPlugin(id);
          } else {
            sendProgress('正在注册插件...', 95);
            await pluginManager.loadPluginById(id);
          }
        }

        sendProgress('安装成功！', 100);
        res.write(`data: ${JSON.stringify({
          success: true,
          message: 'Plugin installed successfully (npm)',
          plugin,
          installPath: path.join(PLUGINS_DIR, id),
        })}\n\n`);
        res.end();
      } catch (downloadError: any) {
        if (fs.existsSync(tempTgzPath)) fs.unlinkSync(tempTgzPath);
        sendProgress(`错误: ${downloadError.message}`, 0);
        res.write(`data: ${JSON.stringify({ error: downloadError.message })}\n\n`);
        res.end();
      }
    } else {
      // ========== GitHub 安装流程（向后兼容）==========
      sendProgress(`来源: GitHub`, 25);
      sendProgress(`下载地址: ${plugin.downloadUrl}`, 25);

      if (mirror && typeof mirror === 'string') {
        sendProgress(`使用镜像: ${mirror}`, 28);
      }

      const tempZipPath = path.join(PLUGINS_DIR, `${id}.temp.zip`);

      try {
        sendProgress('正在下载插件...', 30);
        await downloadFile(plugin.downloadUrl, tempZipPath, mirror as string | undefined, (percent, downloaded, total, speed) => {
          const overallProgress = 30 + Math.round(percent * 0.5);
          const downloadedMb = (downloaded / 1024 / 1024).toFixed(1);
          const totalMb = total ? (total / 1024 / 1024).toFixed(1) : '?';
          const speedMb = (speed / 1024 / 1024).toFixed(2);
          const eta = (total > 0 && speed > 0) ? Math.round((total - downloaded) / speed) : -1;

          sendProgress(`正在下载插件... ${percent}%`, overallProgress, {
            downloaded,
            total,
            speed,
            eta,
            downloadedStr: `${downloadedMb}MB`,
            totalStr: `${totalMb}MB`,
            speedStr: `${speedMb}MB/s`,
          });
        }, 300000);

        sendProgress('下载完成，正在解压...', 85);
        await extractPlugin(tempZipPath, id);

        sendProgress('解压完成，正在清理...', 95);
        fs.unlinkSync(tempZipPath);

        const pluginManager = getPluginManager();
        if (pluginManager) {
          if (pluginManager.getPluginInfo(id)) {
            sendProgress('正在刷新插件信息...', 95);
            await pluginManager.reloadPlugin(id);
          } else {
            sendProgress('正在注册插件...', 95);
            await pluginManager.loadPluginById(id);
          }
        }

        sendProgress('安装成功！', 100);
        res.write(`data: ${JSON.stringify({
          success: true,
          message: 'Plugin installed successfully',
          plugin,
          installPath: path.join(PLUGINS_DIR, id),
        })}\n\n`);
        res.end();
      } catch (downloadError: any) {
        if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath);
        sendProgress(`错误: ${downloadError.message}`, 0);
        res.write(`data: ${JSON.stringify({ error: downloadError.message })}\n\n`);
        res.end();
      }
    }
  } catch (e: any) {
    sendProgress(`错误: ${e.message}`, 0);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
};

/**
 * 从 npm 直接安装插件（不依赖商店索引）
 * 通过 npm 包名直接安装
 */
export const InstallPluginFromNpmHandler: RequestHandler = async (req, res) => {
  try {
    const { packageName, version, registry } = req.body;

    if (!packageName || typeof packageName !== 'string') {
      return sendError(res, 'npm 包名不能为空');
    }

    // 验证包名格式（npm 包名规则）
    if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(packageName)) {
      return sendError(res, '无效的 npm 包名格式');
    }

    const PLUGINS_DIR = getPluginsDir();
    const tempTgzPath = path.join(PLUGINS_DIR, `${packageName.replace(/\//g, '-')}.temp.tgz`);

    try {
      // 获取版本信息
      let versionInfo;
      if (version) {
        versionInfo = await fetchNpmVersionInfo(packageName, version, registry);
      } else {
        versionInfo = await fetchNpmLatestVersion(packageName, registry);
      }

      const pluginId = versionInfo.name;

      // 检查是否已安装相同版本
      const pm = getPluginManager();
      if (pm) {
        const installedInfo = pm.getPluginInfo(pluginId);
        if (installedInfo && installedInfo.version === versionInfo.version) {
          return sendError(res, '该插件已安装且版本相同，无需重复安装');
        }
      }

      // 下载并解压
      await downloadNpmTarball(versionInfo.dist.tarball, tempTgzPath, registry, undefined, 300000);
      await extractNpmTarball(tempTgzPath, pluginId);
      fs.unlinkSync(tempTgzPath);

      // 注册
      const pluginManager = getPluginManager();
      if (pluginManager) {
        if (pluginManager.getPluginInfo(pluginId)) {
          await pluginManager.reloadPlugin(pluginId);
        } else {
          await pluginManager.loadPluginById(pluginId);
        }
      }

      return sendSuccess(res, {
        message: 'Plugin installed successfully from npm',
        pluginId,
        version: versionInfo.version,
        installPath: path.join(PLUGINS_DIR, pluginId),
      });
    } catch (e: any) {
      if (fs.existsSync(tempTgzPath)) fs.unlinkSync(tempTgzPath);
      throw e;
    }
  } catch (e: any) {
    return sendError(res, '从 npm 安装插件失败: ' + e.message);
  }
};

/**
 * 从 npm 直接安装插件 - SSE 版本
 */
export const InstallPluginFromNpmSSEHandler: RequestHandler = async (req, res) => {
  const { packageName, version, registry } = req.query;

  if (!packageName || typeof packageName !== 'string') {
    res.status(400).json({ error: 'npm 包名不能为空' });
    return;
  }

  if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(packageName)) {
    res.status(400).json({ error: '无效的 npm 包名格式' });
    return;
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendProgress = (message: string, progress?: number, detail?: any) => {
    res.write(`data: ${JSON.stringify({ message, progress, ...detail })}\n\n`);
  };

  const PLUGINS_DIR = getPluginsDir();
  const npmRegistry = (registry && typeof registry === 'string') ? registry : undefined;
  const tempTgzPath = path.join(PLUGINS_DIR, `${packageName.replace(/\//g, '-')}.temp.tgz`);

  try {
    sendProgress('正在从 npm 获取包信息...', 10);

    let versionInfo;
    if (version && typeof version === 'string') {
      versionInfo = await fetchNpmVersionInfo(packageName, version, npmRegistry);
    } else {
      versionInfo = await fetchNpmLatestVersion(packageName, npmRegistry);
    }

    const pluginId = versionInfo.name;
    sendProgress(`找到包: ${pluginId} v${versionInfo.version}`, 20);

    // 检查版本
    const pm = getPluginManager();
    if (pm) {
      const installedInfo = pm.getPluginInfo(pluginId);
      if (installedInfo && installedInfo.version === versionInfo.version) {
        sendProgress('错误: 该插件已安装且版本相同', 0);
        res.write(`data: ${JSON.stringify({ error: '该插件已安装且版本相同，无需重复安装' })}\n\n`);
        res.end();
        return;
      }
    }

    sendProgress(`tarball: ${versionInfo.dist.tarball}`, 25);
    if (npmRegistry) {
      sendProgress(`使用 npm 镜像: ${npmRegistry}`, 28);
    }

    sendProgress('正在下载插件包...', 30);
    await downloadNpmTarball(
      versionInfo.dist.tarball,
      tempTgzPath,
      npmRegistry,
      (percent, downloaded, total, speed) => {
        const overallProgress = 30 + Math.round(percent * 0.5);
        const downloadedMb = (downloaded / 1024 / 1024).toFixed(1);
        const totalMb = total ? (total / 1024 / 1024).toFixed(1) : '?';
        const speedMb = (speed / 1024 / 1024).toFixed(2);
        const eta = (total > 0 && speed > 0) ? Math.round((total - downloaded) / speed) : -1;

        sendProgress(`正在下载... ${percent}%`, overallProgress, {
          downloaded, total, speed, eta,
          downloadedStr: `${downloadedMb}MB`,
          totalStr: `${totalMb}MB`,
          speedStr: `${speedMb}MB/s`,
        });
      },
      300000,
    );

    sendProgress('下载完成，正在解压...', 85);
    await extractNpmTarball(tempTgzPath, pluginId);

    sendProgress('解压完成，正在清理...', 95);
    fs.unlinkSync(tempTgzPath);

    const pluginManager = getPluginManager();
    if (pluginManager) {
      if (pluginManager.getPluginInfo(pluginId)) {
        sendProgress('正在刷新插件信息...', 95);
        await pluginManager.reloadPlugin(pluginId);
      } else {
        sendProgress('正在注册插件...', 95);
        await pluginManager.loadPluginById(pluginId);
      }
    }

    sendProgress('安装成功！', 100);
    res.write(`data: ${JSON.stringify({
      success: true,
      message: 'Plugin installed successfully from npm',
      pluginId,
      version: versionInfo.version,
      installPath: path.join(PLUGINS_DIR, pluginId),
    })}\n\n`);
    res.end();
  } catch (e: any) {
    if (fs.existsSync(tempTgzPath)) fs.unlinkSync(tempTgzPath);
    sendProgress(`错误: ${e.message}`, 0);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
};

/**
 * 搜索 npm 上的 NapCat 插件
 * 使用 npm search API 搜索带有特定关键字的包
 */
export const SearchNpmPluginsHandler: RequestHandler = async (req, res) => {
  try {
    const keyword = (req.query['keyword'] as string) || 'napcat-plugin';
    const registry = (req.query['registry'] as string) || NPM_REGISTRY_MIRRORS[0];
    const from = parseInt(req.query['from'] as string) || 0;
    const size = Math.min(parseInt(req.query['size'] as string) || 20, 50);

    // npm search API: /-/v1/search?text=keyword
    const searchUrl = `${registry?.replace(/\/$/, '')}/-/v1/search?text=${encodeURIComponent(keyword)}&from=${from}&size=${size}`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NapCat-PluginManager',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const searchResult = await response.json() as any;

    // 转换为 PluginStoreItem 格式
    const plugins: PluginStoreItem[] = (searchResult.objects || []).map((obj: any) => {
      const pkg = obj.package;
      return {
        id: pkg.name,
        name: pkg.napcat?.displayName || pkg.name,
        version: pkg.version,
        description: pkg.description || '',
        author: extractAuthorName(pkg.author || (pkg.publisher ? pkg.publisher.username : undefined)),
        homepage: extractHomepage(pkg.links?.homepage, pkg.links?.repository),
        downloadUrl: '', // npm 源不需要 downloadUrl
        tags: pkg.keywords || [],
        source: 'npm' as const,
        npmPackage: pkg.name,
      };
    });

    return sendSuccess(res, {
      total: searchResult.total || 0,
      plugins,
    });
  } catch (e: any) {
    return sendError(res, '搜索 npm 插件失败: ' + e.message);
  }
};

/**
 * 获取 npm 包详情（版本列表、README 等）
 */
export const GetNpmPluginDetailHandler: RequestHandler = async (req, res) => {
  try {
    const packageName = req.params['packageName'];
    const registry = req.query['registry'] as string | undefined;

    if (!packageName) {
      return sendError(res, '包名不能为空');
    }

    const metadata = await fetchNpmPackageMetadata(packageName, registry);
    const latestVersion = metadata['dist-tags']?.['latest'] || '';
    const latestInfo = latestVersion ? metadata.versions[latestVersion] : null;

    return sendSuccess(res, {
      name: metadata.name,
      description: metadata.description || '',
      latestVersion,
      author: extractAuthorName(metadata.author),
      homepage: extractHomepage(metadata.homepage, metadata.repository),
      readme: metadata.readme || '',
      versions: Object.keys(metadata.versions).reverse().slice(0, 20),
      keywords: metadata.keywords || [],
      tarball: latestInfo?.dist?.tarball || '',
      unpackedSize: latestInfo?.dist?.unpackedSize,
      napcat: latestInfo?.napcat,
    });
  } catch (e: any) {
    return sendError(res, '获取 npm 包详情失败: ' + e.message);
  }
};
