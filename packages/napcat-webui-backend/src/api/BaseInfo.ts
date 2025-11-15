import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';

import { sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { WebUiConfig } from '@/napcat-webui-backend/index';

export const GetNapCatVersion: RequestHandler = (_, res) => {
  const data = WebUiDataRuntime.GetNapCatVersion();
  sendSuccess(res, { version: data });
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
