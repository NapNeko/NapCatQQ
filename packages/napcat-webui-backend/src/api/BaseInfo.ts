import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@/napcat-webui-backend/helper/Data';

import { sendSuccess } from '@/napcat-webui-backend/utils/response';
import { WebUiConfig } from '@/napcat-webui-backend/index';

export const PackageInfoHandler: RequestHandler = (_, res) => {
  const data = WebUiDataRuntime.getPackageJson();
  sendSuccess(res, data);
};

export const QQVersionHandler: RequestHandler = (_, res) => {
  const data = WebUiDataRuntime.getQQVersion();
  sendSuccess(res, data);
};

export const GetThemeConfigHandler: RequestHandler = async (_, res) => {
  const data = await WebUiConfig.GetTheme();
  sendSuccess(res, data);
};

export const SetThemeConfigHandler: RequestHandler = async (req, res) => {
  const { theme } = req.body;
  await WebUiConfig.UpdateTheme(theme);
  sendSuccess(res, { message: '更新成功' });
};
