import type { Context } from 'hono';
import { RequestUtil } from 'napcat-common/src/request';
import { sendError, sendSuccess } from '../utils/response';

export const GetProxyHandler = async (c: Context) => {
  let url = c.req.query('url');
  if (url && typeof url === 'string') {
    url = decodeURIComponent(url);
    const responseText = await RequestUtil.HttpGetText(url);
    return sendSuccess(c, responseText);
  } else {
    return sendError(c, 'url参数不合法');
  }
};
