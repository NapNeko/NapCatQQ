import type { Response } from 'express';

import { ResponseCode, HttpStatusCode } from '@webapi/const/status';

export const sendResponse = <T>(
    res: Response,
    data?: T,
    code: ResponseCode = 0,
    message = 'success',
    useSend: boolean = false
) => {
    const result = {
        code,
        message,
        data,
    };
    if (useSend) {
        res.status(HttpStatusCode.OK).send(JSON.stringify(result));
        return;
    }
    res.status(HttpStatusCode.OK).json(result);
};

export const sendError = (res: Response, message = 'error', useSend: boolean = false) => {
    const result = {
        code: ResponseCode.Error,
        message,
    };
    if (useSend) {
        res.status(HttpStatusCode.OK).send(JSON.stringify(result));
        return;
    }
    res.status(HttpStatusCode.OK).json(result);
};

export const sendSuccess = <T>(res: Response, data?: T, message = 'success', useSend: boolean = false) => {
    const result = {
        code: ResponseCode.Success,
        data,
        message,
    };
    if (useSend) {
        res.status(HttpStatusCode.OK).send(JSON.stringify(result));
        return;
    }
    res.status(HttpStatusCode.OK).json(result);
};
