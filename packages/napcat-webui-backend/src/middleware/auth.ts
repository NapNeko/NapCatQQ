import type { Context, Next } from 'hono';

import { getInitialWebUiToken } from '@/napcat-webui-backend/index';

import { AuthHelper } from '@/napcat-webui-backend/src/helper/SignToken';
import { sendError } from '@/napcat-webui-backend/src/utils/response';
import type { WebUiCredentialJson } from '@/napcat-webui-backend/src/types';

export async function auth (c: Context, next: Next) {
  // Hono 的 c.req.path 在 app.route() 子应用中仍是完整路径，用 endsWith 匹配
  const pathname = c.req.path;
  if (pathname.endsWith('/auth/login')) {
    return next();
  }
  if (pathname.endsWith('/auth/passkey/generate-authentication-options') ||
    pathname.endsWith('/auth/passkey/verify-authentication')) {
    return next();
  }
  let hash: string | undefined;
  const authorization = c.req.header('authorization');
  if (authorization) {
    const parts = authorization.split(' ');
    if (parts.length < 2) {
      return sendError(c, 'Unauthorized');
    }
    hash = parts[1];
  } else {
    const queryToken = c.req.query('webui_token');
    if (queryToken && typeof queryToken === 'string') {
      hash = queryToken;
    }
  }
  if (hash) {
    let Credential: WebUiCredentialJson;
    try {
      Credential = JSON.parse(Buffer.from(hash, 'base64').toString('utf-8'));
    } catch (_e) {
      return sendError(c, 'Unauthorized');
    }
    const initialToken = getInitialWebUiToken();
    if (!initialToken) {
      return sendError(c, 'Server token not initialized');
    }
    const credentialJson = AuthHelper.validateCredentialWithinOneHour(initialToken, Credential);
    if (credentialJson) {
      return next();
    }
    return sendError(c, 'Unauthorized');
  }

  return sendError(c, 'Unauthorized');
}
