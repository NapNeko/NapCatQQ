import { RequestHandler } from 'express';
import { sendSuccess, sendError } from '@/napcat-webui-backend/src/utils/response';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import compressing from 'compressing';
import { webUiPathWrapper } from '../../index';
import { NapCatPathWrapper } from '@/napcat-common/src/path';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { NapCatCoreWorkingEnv } from '@/napcat-webui-backend/src/types';

interface Release {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
  body?: string;
}

// 更新配置文件接口
interface UpdateConfig {
  version: string;
  updateTime: string;
  files: Array<{
    sourcePath: string;
    targetPath: string;
    backupPath?: string;
  }>;
  changelog?: string;
}

// 需要跳过更新的文件
const SKIP_UPDATE_FILES = [
  'NapCatWinBootMain.exe',
  'NapCatWinBootHook.dll'
];

/**
 * 递归扫描目录中的所有文件
 */
function scanFilesRecursively (dirPath: string, basePath: string = dirPath): Array<{
  sourcePath: string;
  relativePath: string;
}> {
  const files: Array<{
    sourcePath: string;
    relativePath: string;
  }> = [];

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.relative(basePath, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 递归扫描子目录
      files.push(...scanFilesRecursively(fullPath, basePath));
    } else if (stat.isFile()) {
      files.push({
        sourcePath: fullPath,
        relativePath: relativePath
      });
    }
  }

  return files;
}

// 镜像源列表（参考ffmpeg下载实现）
const mirrorUrls = [
  'https://j.1win.ggff.net/',
  'https://git.yylx.win/',
  'https://ghfile.geekertao.top/',
  'https://gh-proxy.net/',
  'https://ghm.078465.xyz/',
  'https://gitproxy.127731.xyz/',
  'https://jiashu.1win.eu.org/',
  '', // 原始URL
];

/**
 * 测试URL是否可用
 */
async function testUrl (url: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
      const statusCode = res.statusCode || 0;
      if (statusCode >= 200 && statusCode < 300) {
        req.destroy();
        resolve(true);
      } else {
        req.destroy();
        resolve(false);
      }
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * 构建镜像URL
 */
function buildMirrorUrl (originalUrl: string, mirror: string): string {
  if (!mirror) return originalUrl;
  return mirror + originalUrl;
}

/**
 * 查找可用的下载URL
 */
async function findAvailableUrl (originalUrl: string): Promise<string> {
  console.log('Testing download URLs...');

  // 先测试原始URL
  if (await testUrl(originalUrl)) {
    console.log('Using original URL:', originalUrl);
    return originalUrl;
  }

  // 测试镜像源
  for (const mirror of mirrorUrls) {
    const mirrorUrl = buildMirrorUrl(originalUrl, mirror);
    console.log('Testing mirror:', mirrorUrl);
    if (await testUrl(mirrorUrl)) {
      console.log('Using mirror URL:', mirrorUrl);
      return mirrorUrl;
    }
  }

  throw new Error('所有下载源都不可用');
}

/**
 * 下载文件（带进度和重试）
 */
async function downloadFile (url: string, dest: string): Promise<void> {
  console.log('Starting download from:', url);
  const file = fs.createWriteStream(dest);

  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: { 'User-Agent': 'NapCat-WebUI' }
    }, (res) => {
      console.log('Response status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);

      if (res.statusCode === 302 || res.statusCode === 301) {
        console.log('Following redirect to:', res.headers.location);
        file.close();
        fs.unlinkSync(dest);
        downloadFile(res.headers.location!, dest).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download completed');
        resolve();
      });
    });

    request.on('error', (err) => {
      console.error('Download error:', err);
      file.close();
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
}

export const UpdateNapCatHandler: RequestHandler = async (_req, res) => {
  try {
    // 获取最新release信息
    const latestRelease = await getLatestRelease() as Release;
    const ReleaseName = WebUiDataRuntime.getWorkingEnv() === NapCatCoreWorkingEnv.Framework ? 'NapCat.Framework.zip' : 'NapCat.Shell.zip';
    const shellZipAsset = latestRelease.assets.find(asset => asset.name === ReleaseName);
    if (!shellZipAsset) {
      throw new Error(`未找到${ReleaseName}文件`);
    }

    // 创建临时目录
    const tempDir = path.join(webUiPathWrapper.binaryPath, './temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 查找可用的下载URL
    const downloadUrl = await findAvailableUrl(shellZipAsset.browser_download_url);

    // 下载zip
    const zipPath = path.join(tempDir, 'napcat-latest.zip');
    console.log('[NapCat Update] Saving to:', zipPath);
    await downloadFile(downloadUrl, zipPath);

    // 检查文件大小
    const stats = fs.statSync(zipPath);
    console.log('[NapCat Update] Downloaded file size:', stats.size, 'bytes');

    // 解压到临时目录
    const extractPath = path.join(tempDir, 'napcat-extract');
    console.log('[NapCat Update] Extracting to:', extractPath);
    await compressing.zip.uncompress(zipPath, extractPath);

    // 获取解压后的实际内容目录（NapCat.Shell.zip直接包含文件，无额外根目录）
    const sourcePath = extractPath;

    // 执行更新操作
    try {
      // 扫描需要更新的文件
      const allFiles = scanFilesRecursively(sourcePath);
      const failedFiles: Array<{
        sourcePath: string;
        targetPath: string;
      }> = [];

      // 先尝试直接替换文件
      for (const fileInfo of allFiles) {
        const targetFilePath = path.join(webUiPathWrapper.binaryPath, fileInfo.relativePath);

        // 跳过指定的文件
        if (SKIP_UPDATE_FILES.includes(path.basename(fileInfo.relativePath))) {
          console.log(`[NapCat Update] Skipping update for ${fileInfo.relativePath}`);
          continue;
        }

        try {
          // 确保目标目录存在
          const targetDir = path.dirname(targetFilePath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          // 尝试直接替换文件
          if (fs.existsSync(targetFilePath)) {
            fs.unlinkSync(targetFilePath); // 删除旧文件
          }
          fs.copyFileSync(fileInfo.sourcePath, targetFilePath);
        } catch (error) {
          // 如果替换失败，添加到失败列表
          console.log(`[NapCat Update] Failed to update ${targetFilePath}, will retry on next startup:`, error);
          failedFiles.push({
            sourcePath: fileInfo.sourcePath,
            targetPath: targetFilePath
          });
        }
      }

      // 如果有替换失败的文件，创建更新配置文件
      if (failedFiles.length > 0) {
        const updateConfig: UpdateConfig = {
          version: latestRelease.tag_name,
          updateTime: new Date().toISOString(),
          files: failedFiles,
          changelog: latestRelease.body || ''
        };

        // 保存更新配置文件
        const configPath = path.join(webUiPathWrapper.configPath, 'napcat-update.json');
        fs.writeFileSync(configPath, JSON.stringify(updateConfig, null, 2));
        console.log(`[NapCat Update] Update config saved for ${failedFiles.length} failed files: ${configPath}`);
      }

      // 发送成功响应
      const message = failedFiles.length > 0
        ? `更新完成，重启应用以应用剩余${failedFiles.length}个文件的更新`
        : '更新完成';
      sendSuccess(res, {
        status: 'completed',
        message,
        newVersion: latestRelease.tag_name,
        failedFilesCount: failedFiles.length
      });

    } catch (error) {
      console.error('更新失败:', error);
      sendError(res, '更新失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }

  } catch (error: any) {
    console.error('更新失败:', error);
    sendError(res, '更新失败: ' + error.message);
  }
};

async function getLatestRelease (): Promise<Release> {
  return new Promise((resolve, reject) => {
    https.get('https://api.github.com/repos/NapNeko/NapCatQQ/releases/latest', {
      headers: { 'User-Agent': 'NapCat-WebUI' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const release = JSON.parse(data) as Release;
          console.log('Release info:', {
            tag_name: release.tag_name,
            assets: release.assets?.map(a => ({ name: a.name, url: a.browser_download_url }))
          });
          resolve(release);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 应用待处理的更新（在应用启动时调用）
 */
export async function applyPendingUpdates (webUiPathWrapper: NapCatPathWrapper): Promise<void> {
  const configPath = path.join(webUiPathWrapper.configPath, 'napcat-update.json');

  if (!fs.existsSync(configPath)) {
    console.log('No pending updates found');
    return;
  }

  try {
    console.log('[NapCat Update] Applying pending updates...');
    const updateConfig: UpdateConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const remainingFiles: Array<{
      sourcePath: string;
      targetPath: string;
    }> = [];

    for (const file of updateConfig.files) {
      try {
        // 检查源文件是否存在
        if (!fs.existsSync(file.sourcePath)) {
          console.warn(`[NapCat Update] Source file not found: ${file.sourcePath}`);
          continue;
        }

        // 确保目标目录存在
        const targetDir = path.dirname(file.targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // 尝试替换文件
        if (fs.existsSync(file.targetPath)) {
          fs.unlinkSync(file.targetPath); // 删除旧文件
        }
        fs.copyFileSync(file.sourcePath, file.targetPath);
        console.log(`[NapCat Update] Updated ${path.basename(file.targetPath)} on startup`);

      } catch (error) {
        console.error(`[NapCat Update] Failed to update ${file.targetPath} on startup:`, error);
        // 如果仍然失败，保留在列表中
        remainingFiles.push(file);
      }
    }

    // 如果还有失败的文件，更新配置文件
    if (remainingFiles.length > 0) {
      const updatedConfig: UpdateConfig = {
        ...updateConfig,
        files: remainingFiles
      };
      fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
      console.log(`${remainingFiles.length} files still pending update`);
    } else {
      // 所有文件都成功更新，删除配置文件
      fs.unlinkSync(configPath);
      console.log('[NapCat Update] All pending updates applied successfully');
    }
  } catch (error) {
    console.error('[NapCat Update] Failed to apply pending updates:', error);
  }
}
