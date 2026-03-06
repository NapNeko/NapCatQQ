import type { Context } from 'hono';

import { ResponseCode, HttpStatusCode } from '@/napcat-webui-backend/src/const/status';

export const sendResponse = <T>(
  c: Context,
  data?: T,
  code: ResponseCode = 0,
  message = 'success',
) => {
  return c.json({
    code,
    message,
    data,
  }, HttpStatusCode.OK);
};

export const sendError = (c: Context, message = 'error') => {
  return c.json({
    code: ResponseCode.Error,
    message,
  }, HttpStatusCode.OK);
};

export const sendSuccess = <T>(c: Context, data?: T, message = 'success') => {
  return c.json({
    code: ResponseCode.Success,
    data,
    message,
  }, HttpStatusCode.OK);
};
