import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@webapi/helper/Data';

import { sendSuccess } from '@webapi/utils/response';
import { WebUiConfig } from '@/webui';

export const PackageInfoHandler: RequestHandler = (_, res) => {
    const data = WebUiDataRuntime.getPackageJson();
    sendSuccess(res, data);
};

export const QQVersionHandler: RequestHandler = (_, res) => {
    const data = WebUiDataRuntime.getQQVersion();
    sendSuccess(res, data);
};

export const GetThemeConfigHandler: RequestHandler = (_, res) => {
    const data = WebUiConfig.GetTheme();
    sendSuccess(res, data);
};

export const SetThemeConfigHandler: RequestHandler = (req, res) => {
    const { theme } = req.body;
    const data = WebUiConfig.UpdateTheme(theme);
    sendSuccess(res, data);
};
