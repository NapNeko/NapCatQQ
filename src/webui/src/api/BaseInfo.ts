import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@webapi/helper/Data';

import { sendSuccess } from '@webapi/utils/response';

export const PackageInfoHandler: RequestHandler = (_, res) => {
    const data = WebUiDataRuntime.getPackageJson();
    sendSuccess(res, data);
};


export const QQVersionHandler: RequestHandler = (_, res) => {
    const data = WebUiDataRuntime.getQQVersion();
    sendSuccess(res, data);
};
