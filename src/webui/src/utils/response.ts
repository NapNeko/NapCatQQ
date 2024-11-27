import type { Response } from 'express';

import { ResponseCode, HttpStatusCode } from '@webapi/const/status';

export const sendResponse = <T>(res: Response, data?: T, code: ResponseCode = 0, message = 'success') => {
    res.status(HttpStatusCode.OK).json({
        code,
        message,
        data,
    });
};

export const sendError = (res: Response, message = 'error') => {
    res.status(HttpStatusCode.OK).json({
        code: ResponseCode.Error,
        message,
    });
};

export const sendSuccess = <T>(res: Response, data?: T, message = 'success') => {
    res.status(HttpStatusCode.OK).json({
        code: ResponseCode.Success,
        data,
        message,
    });
};
