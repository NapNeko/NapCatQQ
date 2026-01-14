import { RequestHandler } from 'express';
import { writeFileSync } from 'fs';
import { join } from 'path';

import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { webUiPathWrapper, WebUiConfig } from '@/napcat-webui-backend/index';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';

// 获取QQ登录二维码
export const QQGetQRcodeHandler: RequestHandler = async (_, res) => {
  // 判断是否已经登录
  if (WebUiDataRuntime.getQQLoginStatus()) {
    // 已经登录
    return sendError(res, 'QQ Is Logined');
  }
  // 获取二维码
  const qrcodeUrl = WebUiDataRuntime.getQQLoginQrcodeURL();
  // 判断二维码是否为空
  if (isEmpty(qrcodeUrl)) {
    return sendError(res, 'QRCode Get Error');
  }
  // 返回二维码URL
  const data = {
    qrcode: qrcodeUrl,
  };
  return sendSuccess(res, data);
};

// 获取QQ登录状态
export const QQCheckLoginStatusHandler: RequestHandler = async (_, res) => {
  // 从 OneBot 上下文获取实时的 selfInfo.online 状态
  const oneBotContext = WebUiDataRuntime.getOneBotContext();
  const selfInfo = oneBotContext?.core?.selfInfo;
  const isOnline = selfInfo?.online;
  const qqLoginStatus = WebUiDataRuntime.getQQLoginStatus();
  // 必须同时满足：已登录且在线（online 必须明确为 true）
  const isLogin = qqLoginStatus && isOnline === true;
  const data = {
    isLogin,
    qrcodeurl: WebUiDataRuntime.getQQLoginQrcodeURL(),
    loginError: WebUiDataRuntime.getQQLoginError(),
  };
  return sendSuccess(res, data);
};

// 快速登录
export const QQSetQuickLoginHandler: RequestHandler = async (req, res) => {
  // 获取QQ号
  const { uin } = req.body;
  // 判断是否已经登录
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (isLogin) {
    return sendError(res, 'QQ Is Logined');
  }
  // 判断QQ号是否为空
  if (isEmpty(uin)) {
    return sendError(res, 'uin is empty');
  }

  // 获取快速登录状态
  const { result, message } = await WebUiDataRuntime.requestQuickLogin(uin);
  if (!result) {
    return sendError(res, message);
  }
  // 本来应该验证 但是http不宜这么搞 建议前端验证
  // isLogin = WebUiDataRuntime.getQQLoginStatus();
  return sendSuccess(res, null);
};

// 获取快速登录列表
export const QQGetQuickLoginListHandler: RequestHandler = async (_, res) => {
  const quickLoginList = WebUiDataRuntime.getQQQuickLoginList();
  return sendSuccess(res, quickLoginList);
};

// 获取快速登录列表（新）
export const QQGetLoginListNewHandler: RequestHandler = async (_, res) => {
  const newLoginList = WebUiDataRuntime.getQQNewLoginList();
  return sendSuccess(res, newLoginList);
};

// 获取登录的QQ的信息
export const getQQLoginInfoHandler: RequestHandler = async (_, res) => {
  const data = WebUiDataRuntime.getQQLoginInfo();
  return sendSuccess(res, data);
};

// 获取自动登录QQ账号
export const getAutoLoginAccountHandler: RequestHandler = async (_, res) => {
  const data = WebUiConfig.getAutoLoginAccount();
  return sendSuccess(res, data);
};

// 设置自动登录QQ账号
export const setAutoLoginAccountHandler: RequestHandler = async (req, res) => {
  const { uin } = req.body;
  await WebUiConfig.UpdateAutoLoginAccount(uin);
  return sendSuccess(res, null);
};

// 刷新QQ登录二维码
export const QQRefreshQRcodeHandler: RequestHandler = async (_, res) => {
  // 判断是否已经登录
  if (WebUiDataRuntime.getQQLoginStatus()) {
    // 已经登录
    return sendError(res, 'QQ Is Logined');
  }
  // 刷新二维码
  await WebUiDataRuntime.refreshQRCode();
  return sendSuccess(res, null);
};

// 退出以重启重新登录
export const QQRestartHandler: RequestHandler = async (_, res) => {
  sendSuccess(res, null);
  setTimeout(() => {
    writeFileSync(join(webUiPathWrapper.binaryPath, 'napcat.restart'), Date.now().toString());
    process.exit(51);
  }, 100);
};
