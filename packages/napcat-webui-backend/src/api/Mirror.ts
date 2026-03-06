import type { Context } from 'hono';
import { sendSuccess, sendError } from '@/napcat-webui-backend/src/utils/response';
import {
  GITHUB_FILE_MIRRORS,
  GITHUB_RAW_MIRRORS,
  buildMirrorUrl,
  getMirrorConfig,
  setCustomMirror,
  clearMirrorCache,
} from 'napcat-common/src/mirror';
import https from 'https';
import http from 'http';

export interface MirrorTestResult {
  mirror: string;
  latency: number;
  success: boolean;
  error?: string;
}

/**
 * 测试单个镜像的延迟
 */
async function testMirrorLatency (mirror: string, testUrl: string, timeout: number = 5000): Promise<MirrorTestResult> {
  const url = mirror ? buildMirrorUrl(testUrl, mirror) : testUrl;
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
        const isValid = statusCode >= 200 && statusCode < 400;
        resolve({
          mirror: mirror || 'https://github.com',
          latency: Date.now() - start,
          success: isValid,
        });
      });

      req.on('error', (e) => {
        resolve({
          mirror: mirror || 'https://github.com',
          latency: Date.now() - start,
          success: false,
          error: e.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          mirror: mirror || 'https://github.com',
          latency: timeout,
          success: false,
          error: 'Timeout',
        });
      });

      req.end();
    } catch (e: any) {
      resolve({
        mirror: mirror || 'https://github.com',
        latency: Date.now() - start,
        success: false,
        error: e.message,
      });
    }
  });
}

/**
 * 获取所有可用的镜像列表
 */
export const GetMirrorListHandler = async (c: Context) => {
  try {
    const config = getMirrorConfig();
    return sendSuccess(c, {
      fileMirrors: GITHUB_FILE_MIRRORS.filter(m => m),
      rawMirrors: GITHUB_RAW_MIRRORS,
      customMirror: config.customMirror,
      timeout: config.timeout,
    });
  } catch (e: any) {
    return sendError(c, e.message);
  }
};

/**
 * 设置自定义镜像
 */
export const SetCustomMirrorHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { mirror } = body as { mirror?: string };
    setCustomMirror(mirror || '');
    clearMirrorCache();
    return sendSuccess(c, { message: 'Mirror set successfully' });
  } catch (e: any) {
    return sendError(c, e.message);
  }
};

/**
 * SSE 实时测速所有镜像
 */
export const TestMirrorsSSEHandler = async (c: Context) => {
  const type = c.req.query('type') || 'file';

  let cleanup: (() => void) | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const sendProgress = (data: any) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (_e) { }
      };

      (async () => {
        try {
          // 选择镜像列表
          let mirrors: string[];
          let testUrl: string;

          if (type === 'raw') {
            mirrors = GITHUB_RAW_MIRRORS;
            testUrl = 'https://raw.githubusercontent.com/NapNeko/NapCatQQ/main/README.md';
          } else {
            mirrors = GITHUB_FILE_MIRRORS.filter(m => m);
            testUrl = 'https://github.com/NapNeko/NapCatQQ/releases/latest';
          }

          // 添加原始 URL 测试
          if (!mirrors.includes('')) {
            mirrors = ['', ...mirrors];
          }

          sendProgress({
            type: 'start',
            total: mirrors.length,
            message: `开始测试 ${mirrors.length} 个镜像源...`,
          });

          const results: MirrorTestResult[] = [];
          const timeout = 5000;

          // 逐个测试并实时推送结果
          for (let i = 0; i < mirrors.length; i++) {
            const mirror = mirrors[i] ?? '';
            const displayName = mirror || 'https://github.com (原始)';

            sendProgress({
              type: 'testing',
              index: i,
              total: mirrors.length,
              mirror: displayName,
              message: `正在测试: ${displayName}`,
            });

            const result = await testMirrorLatency(mirror, testUrl, timeout);
            results.push(result);

            sendProgress({
              type: 'result',
              index: i,
              total: mirrors.length,
              result: {
                ...result,
                mirror: result.mirror || 'https://github.com (原始)',
              },
            });
          }

          // 按延迟排序
          const sortedResults = results
            .filter(r => r.success)
            .sort((a, b) => a.latency - b.latency);

          const failedResults = results.filter(r => !r.success);

          sendProgress({
            type: 'complete',
            results: sortedResults,
            failed: failedResults,
            fastest: sortedResults[0] || null,
            message: `测试完成！${sortedResults.length} 个可用，${failedResults.length} 个失败`,
          });

          controller.close();
        } catch (e: any) {
          sendProgress({
            type: 'error',
            error: e.message,
          });
          controller.close();
        }
      })();
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};

/**
 * 快速测试单个镜像
 */
export const TestSingleMirrorHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { mirror, type = 'file' } = body as { mirror?: string; type?: string };

    let testUrl: string;
    if (type === 'raw') {
      testUrl = 'https://raw.githubusercontent.com/NapNeko/NapCatQQ/main/README.md';
    } else {
      testUrl = 'https://github.com/NapNeko/NapCatQQ/releases/latest';
    }

    const result = await testMirrorLatency(mirror || '', testUrl, 5000);

    return sendSuccess(c, result);
  } catch (e: any) {
    return sendError(c, e.message);
  }
};
