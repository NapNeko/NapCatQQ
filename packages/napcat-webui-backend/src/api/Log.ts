import type { Context } from 'hono';
import { sendError, sendSuccess } from '../utils/response';
import { terminalManager } from '../terminal/terminal_manager';
import { logSubscription, WebUiConfig } from '@/napcat-webui-backend/index';
// 判断是否是 macos
const isMacOS = process.platform === 'darwin';

// 日志脱敏函数
const sanitizeLog = (log: string): string => {
  // 脱敏 token 参数，将 token=xxx 替换为 token=***
  return log.replace(/token=[\w\d]+/gi, 'token=***');
};
// 日志记录
export const LogHandler = async (c: Context) => {
  const filename = c.req.query('id');
  if (!filename || typeof filename !== 'string') {
    return sendError(c, 'ID不能为空');
  }

  if (filename.includes('..')) {
    return sendError(c, 'ID不合法');
  }
  const logContent = await WebUiConfig.GetLogContent(filename);
  const sanitizedLogContent = sanitizeLog(logContent);
  return sendSuccess(c, sanitizedLogContent);
};

// 日志列表
export const LogListHandler = async (c: Context) => {
  const logList = await WebUiConfig.GetLogsList();
  return sendSuccess(c, logList);
};

// 实时日志（SSE）
export const LogRealTimeHandler = async (_c: Context) => {
  let cleanup: (() => void) | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const listener = (log: string) => {
        try {
          const sanitizedLog = sanitizeLog(log);
          controller.enqueue(new TextEncoder().encode(`data: ${sanitizedLog}\n\n`));
        } catch (error) {
          console.error('向客户端写入日志数据时出错:', error);
        }
      };
      logSubscription.subscribe(listener);
      cleanup = () => logSubscription.unsubscribe(listener);
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
    },
  });
};

// 终端相关处理器
export const CreateTerminalHandler = async (c: Context) => {
  if (isMacOS) {
    return sendError(c, 'MacOS不支持终端');
  }
  try {
    const body = await c.req.json().catch(() => ({}));
    const { cols, rows } = body as { cols?: number; rows?: number };
    const { id } = terminalManager.createTerminal(cols ?? 80, rows ?? 24);
    return sendSuccess(c, { id });
  } catch (error) {
    console.error('Failed to create terminal:', error);
    return sendError(c, '创建终端失败');
  }
};

export const GetTerminalListHandler = (c: Context) => {
  const list = terminalManager.getTerminalList();
  return sendSuccess(c, list);
};

export const CloseTerminalHandler = (c: Context) => {
  const id = c.req.param('id');
  if (!id) {
    return sendError(c, 'ID不能为空');
  }
  terminalManager.closeTerminal(id);
  return sendSuccess(c, {});
};
