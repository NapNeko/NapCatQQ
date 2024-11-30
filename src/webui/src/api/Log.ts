import type { RequestHandler } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import { WebUiConfigWrapper } from '../helper/config';
import { logSubscription } from '@/common/log';

// 日志记录
export const LogHandler: RequestHandler = async (req, res) => {
    const filename = req.query.id as string;
    if (filename.includes('..')) {
        return sendError(res, 'ID不合法');
    }
    const logContent = WebUiConfigWrapper.GetLogContent(filename);
    return sendSuccess(res, logContent);
};

// 日志列表
export const LogListHandler: RequestHandler = async (_, res) => {
    const logList = WebUiConfigWrapper.GetLogsList();
    return sendSuccess(res, logList);
};

// 实时日志（SSE）
export const LogRealTimeHandler: RequestHandler = async (req, res) => {
    const listener = (log: string) => {
        res.write(log + '\n');
    };
    logSubscription.subscribe(listener);
    req.on('close', () => {
        logSubscription.unsubscribe(listener);
    });
};
