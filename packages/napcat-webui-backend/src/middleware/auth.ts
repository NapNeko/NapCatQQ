import { NextFunction, Request, Response } from 'express';

import { getInitialWebUiToken } from '@/napcat-webui-backend/index';

import { AuthHelper } from '@/napcat-webui-backend/src/helper/SignToken';
import { sendError } from '@/napcat-webui-backend/src/utils/response';
import type { WebUiCredentialJson } from '@/napcat-webui-backend/src/types';

// 鉴权中间件
export async function auth (req: Request, res: Response, next: NextFunction) {
  if (req.url === '/auth/login') {
    return next();
  }
  if (req.url === '/auth/passkey/generate-authentication-options' ||
    req.url === '/auth/passkey/verify-authentication') {
    return next();
  }
  if (req.url === '/auth/2fa/status') {
    return next();
  }
  let hash: string | undefined;
  if (req.headers?.authorization) {
    const authorization = req.headers.authorization.split(' ');
    if (authorization.length < 2) {
      return sendError(res, 'Unauthorized');
    }
    hash = authorization[1];
  } else if (req.query['webui_token'] && typeof req.query['webui_token'] === 'string') {
    hash = req.query['webui_token'];
  }

  if (hash) {
    let Credential: WebUiCredentialJson;
    try {
      Credential = JSON.parse(Buffer.from(hash, 'base64').toString('utf-8'));
    } catch (_e) {
      return sendError(res, 'Unauthorized');
    }

    const initialToken = getInitialWebUiToken();
    if (!initialToken) {
      return sendError(res, 'Server token not initialized');
    }

    if (AuthHelper.validateCredentialWithinOneHour(initialToken, Credential)) {
      return next();
    }
    return sendError(res, 'Unauthorized');
  }

  return sendError(res, 'Unauthorized');
}
