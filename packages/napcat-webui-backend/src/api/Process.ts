import type { Request, Response } from 'express';
import { WebUiDataRuntime } from '../helper/Data';
import { sendError, sendSuccess } from '../utils/response';

/**
 * 重启进程处理器
 * POST /api/Process/Restart
 */
export async function RestartProcessHandler (_req: Request, res: Response) {
  try {
    const result = await WebUiDataRuntime.requestRestartProcess();

    if (result.result) {
      return sendSuccess(res, { message: result.message || '进程重启请求已发送' });
    } else {
      return sendError(res, result.message || '进程重启失败');
    }
  } catch (e) {
    return sendError(res, '重启进程时发生错误: ' + (e as Error).message);
  }
}
