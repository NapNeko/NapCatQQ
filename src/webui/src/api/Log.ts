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
    const logContent = await WebUiConfigWrapper.GetLogContent(filename);
    return sendSuccess(res, logContent);
};

// 日志列表
export const LogListHandler: RequestHandler = async (_, res) => {
    const logList = await WebUiConfigWrapper.GetLogsList();
    return sendSuccess(res, logList);
};
// 实时日志（SSE）
// 实时日志（SSE）
export const LogRealTimeHandler: RequestHandler = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    const listener = (log: string) => {
        try {
            res.write(`data: ${log}\n\n`);
        } catch (error) {
            console.error('向客户端写入日志数据时出错:', error);
        }
    };
    logSubscription.subscribe(listener);
    req.on('close', () => {
        logSubscription.unsubscribe(listener);
    });
};
