import type { Request, Response } from 'express';
import { WebUiDataRuntime } from '../helper/Data';
import { sendError, sendSuccess } from '../utils/response';

export interface RestartRequestBody {
  /**
   * 重启类型: 'manual' (用户手动触发) 或 'automatic' (系统自动触发)
   * 默认为 'manual'
   */
  restartType?: 'manual' | 'automatic';
}

/**
 * 重启进程处理器
 * POST /api/Process/Restart
 * Body: { restartType?: 'manual' | 'automatic' }
 */
export async function RestartProcessHandler (req: Request, res: Response) {
  try {
    const { restartType = 'manual' } = (req.body as RestartRequestBody) || {};

    const result = await WebUiDataRuntime.requestRestartProcess();

    if (result.result) {
      return sendSuccess(res, {
        message: result.message || '进程重启请求已发送',
        restartType,
      });
    } else {
      return sendError(res, result.message || '进程重启失败');
    }
  } catch (e) {
    return sendError(res, '重启进程时发生错误: ' + (e as Error).message);
  }
}
