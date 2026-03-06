import type { Context } from 'hono';
import { AuthHelper } from '@/napcat-webui-backend/src/helper/SignToken';
import { PasskeyHelper } from '@/napcat-webui-backend/src/helper/PasskeyHelper';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendSuccess, sendError } from '@/napcat-webui-backend/src/utils/response';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';
import { WebUiConfig, getInitialWebUiToken, setInitialWebUiToken } from '@/napcat-webui-backend/index';

// 登录
export const LoginHandler = async (c: Context) => {
  // 获取WebUI配置
  const WebUiConfigData = await WebUiConfig.GetWebUIConfig();
  // 获取请求体中的hash
  const body = await c.req.json().catch(() => ({}));
  const { hash } = body as { hash?: string };
  // 获取客户端IP
  const clientIP = (c.env as any)?.incoming?.socket?.remoteAddress || '';

  // 如果token为空，返回错误信息
  if (isEmpty(hash)) {
    return sendError(c, 'token is empty');
  }
  // 检查登录频率
  if (!WebUiDataRuntime.checkLoginRate(clientIP, WebUiConfigData.loginRate)) {
    return sendError(c, 'login rate limit');
  }
  // 使用启动时缓存的token进行验证，而不是动态读取配置文件
  const initialToken = getInitialWebUiToken();
  if (!initialToken) {
    return sendError(c, 'Server token not initialized');
  }
  // 验证初始token hash是否等于提交的token hash
  if (!AuthHelper.comparePasswordHash(initialToken, hash || '')) {
    return sendError(c, 'token is invalid');
  }

  // 签发凭证
  const signCredential = Buffer.from(JSON.stringify(AuthHelper.signCredential(hash || ''))).toString(
    'base64'
  );
  // 返回成功信息
  return sendSuccess(c, {
    Credential: signCredential,
  });
};

// 退出登录
export const LogoutHandler = async (c: Context) => {
  const authorization = c.req.header('authorization');
  try {
    const CredentialBase64: string = authorization?.split(' ')[1] as string;
    const Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());
    AuthHelper.revokeCredential(Credential);
    return sendSuccess(c, 'Logged out successfully');
  } catch (_e) {
    return sendError(c, 'Logout failed');
  }
};

// 检查登录状态
export const checkHandler = async (c: Context) => {
  // 获取请求头中的Authorization
  const authorization = c.req.header('authorization');
  // 检查凭证
  try {
    // 从Authorization中获取凭证
    const CredentialBase64: string = authorization?.split(' ')[1] as string;
    // 解析凭证
    const Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());

    // 检查凭证是否已被注销
    if (AuthHelper.isCredentialRevoked(Credential)) {
      return sendError(c, 'Token has been revoked');
    }

    // 使用启动时缓存的token进行验证
    const initialToken = getInitialWebUiToken();
    if (!initialToken) {
      return sendError(c, 'Server token not initialized');
    }
    // 验证凭证是否在一小时内有效
    const valid = AuthHelper.validateCredentialWithinOneHour(initialToken, Credential);
    // 返回成功信息
    if (valid) return sendSuccess(c, null);
    // 返回错误信息
    return sendError(c, 'Authorization Failed');
  } catch (_e) {
    // 返回错误信息
    return sendError(c, 'Authorization Failed');
  }
};

// 修改密码（token）
export const UpdateTokenHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { oldToken, newToken } = body as { oldToken?: string; newToken?: string };
  const authorization = c.req.header('authorization');

  if (isEmpty(newToken)) {
    return sendError(c, 'newToken is empty');
  }

  // 强制要求旧密码
  if (isEmpty(oldToken)) {
    return sendError(c, 'oldToken is required');
  }

  // 检查新旧密码是否相同
  if (oldToken === newToken) {
    return sendError(c, '新密码不能与旧密码相同');
  }

  // 检查新密码强度
  if (newToken!.length < 6) {
    return sendError(c, '新密码至少需要6个字符');
  }

  // 检查是否包含字母
  if (!/[a-zA-Z]/.test(newToken!)) {
    return sendError(c, '新密码必须包含字母');
  }

  // 检查是否包含数字
  if (!/[0-9]/.test(newToken!)) {
    return sendError(c, '新密码必须包含数字');
  }

  try {
    // 注销当前的Token
    if (authorization) {
      const CredentialBase64: string = authorization.split(' ')[1] as string;
      const Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());
      AuthHelper.revokeCredential(Credential);
    }

    // 使用启动时缓存的token进行验证
    const initialToken = getInitialWebUiToken();
    if (!initialToken) {
      return sendError(c, 'Server token not initialized');
    }
    if (initialToken !== oldToken) {
      return sendError(c, '旧 token 不匹配');
    }
    // 直接更新配置文件中的token，不需要通过WebUiConfig.UpdateToken方法
    await WebUiConfig.UpdateWebUIConfig({ token: newToken! });
    // 更新内存中的缓存token，使新密码立即生效
    setInitialWebUiToken(newToken!);

    return sendSuccess(c, 'Token updated successfully');
  } catch (e: any) {
    return sendError(c, `Failed to update token: ${e.message}`);
  }
};

// 生成Passkey注册选项
export const GeneratePasskeyRegistrationOptionsHandler = async (c: Context) => {
  try {
    // 使用固定用户ID，因为WebUI只有一个用户
    const userId = 'napcat-user';
    const userName = 'NapCat User';

    // 从请求头获取host来确定RP_ID
    const host = c.req.header('host') || 'localhost';
    const hostname = host.split(':')[0] || 'localhost'; // 移除端口
    // 对于本地开发，使用localhost而不是IP地址
    const rpId = (hostname === '127.0.0.1' || hostname === 'localhost') ? 'localhost' : hostname;

    const options = await PasskeyHelper.generateRegistrationOptions(userId, userName, rpId);
    return sendSuccess(c, options);
  } catch (error) {
    return sendError(c, `Failed to generate registration options: ${(error as Error).message}`);
  }
};

// 验证Passkey注册
export const VerifyPasskeyRegistrationHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { response } = body as { response?: unknown };
    if (!response) {
      return sendError(c, 'Response is required');
    }

    const origin = c.req.header('origin') || `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host') || 'localhost'}`;
    const host = c.req.header('host') || 'localhost';
    const hostname = host.split(':')[0] || 'localhost'; // 移除端口
    // 对于本地开发，使用localhost而不是IP地址
    const rpId = (hostname === '127.0.0.1' || hostname === 'localhost') ? 'localhost' : hostname;
    const userId = 'napcat-user';
    const verification = await PasskeyHelper.verifyRegistration(userId, response, origin, rpId);

    if (verification.verified) {
      return sendSuccess(c, { verified: true });
    } else {
      return sendError(c, 'Registration failed');
    }
  } catch (error) {
    return sendError(c, `Registration verification failed: ${(error as Error).message}`);
  }
};

// 生成Passkey认证选项
export const GeneratePasskeyAuthenticationOptionsHandler = async (c: Context) => {
  try {
    const userId = 'napcat-user';

    if (!(await PasskeyHelper.hasPasskeys(userId))) {
      return sendError(c, 'No passkeys registered');
    }

    // 从请求头获取host来确定RP_ID
    const host = c.req.header('host') || 'localhost';
    const hostname = host.split(':')[0] || 'localhost'; // 移除端口
    // 对于本地开发，使用localhost而不是IP地址
    const rpId = (hostname === '127.0.0.1' || hostname === 'localhost') ? 'localhost' : hostname;

    const options = await PasskeyHelper.generateAuthenticationOptions(userId, rpId);
    return sendSuccess(c, options);
  } catch (error) {
    return sendError(c, `Failed to generate authentication options: ${(error as Error).message}`);
  }
};

// 验证Passkey认证
export const VerifyPasskeyAuthenticationHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { response } = body as { response?: unknown };
    if (!response) {
      return sendError(c, 'Response is required');
    }

    // 获取WebUI配置用于限速检查
    const WebUiConfigData = await WebUiConfig.GetWebUIConfig();
    // 获取客户端IP
    const clientIP = (c.env as any)?.incoming?.socket?.remoteAddress || '';

    // 检查登录频率
    if (!WebUiDataRuntime.checkLoginRate(clientIP, WebUiConfigData.loginRate)) {
      return sendError(c, 'login rate limit');
    }

    const origin = c.req.header('origin') || `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host') || 'localhost'}`;
    const host = c.req.header('host') || 'localhost';
    const hostname = host.split(':')[0] || 'localhost'; // 移除端口
    // 对于本地开发，使用localhost而不是IP地址
    const rpId = (hostname === '127.0.0.1' || hostname === 'localhost') ? 'localhost' : hostname;
    const userId = 'napcat-user';
    const verification = await PasskeyHelper.verifyAuthentication(userId, response, origin, rpId);

    if (verification.verified) {
      // 使用与普通登录相同的凭证签发
      const initialToken = getInitialWebUiToken();
      if (!initialToken) {
        return sendError(c, 'Server token not initialized');
      }
      const signCredential = Buffer.from(JSON.stringify(AuthHelper.signCredential(AuthHelper.generatePasswordHash(initialToken)))).toString('base64');
      return sendSuccess(c, {
        Credential: signCredential,
      });
    } else {
      return sendError(c, 'Authentication failed');
    }
  } catch (error) {
    return sendError(c, `Authentication verification failed: ${(error as Error).message}`);
  }
};
