import { RequestHandler } from 'express';
import { RequestUtil } from '@/common/request';
import { sendError, sendSuccess } from '../utils/response';

export const GetProxyHandler: RequestHandler = async (req, res) => {
    let { url } = req.query;
    if (url && typeof url === 'string') {
        url = decodeURIComponent(url);
        const responseText = await RequestUtil.HttpGetText(url);
        res.send(sendSuccess(res, responseText));
    } else {
        res.send(sendError(res, 'url参数不合法'));
    }
};