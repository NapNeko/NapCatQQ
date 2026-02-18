export interface AutoLoginFallbackConfig {
  autoLoginAccount?: string;
  autoPasswordLoginAccount?: string;
  autoPasswordLoginPasswordMd5?: string;
}

export interface AutoLoginActionResult {
  result: boolean;
  message: string;
}

export interface AutoLoginRunnerDeps {
  quickLogin: (uin: string) => Promise<AutoLoginActionResult>;
  passwordLogin: (uin: string, passwordMd5: string) => Promise<AutoLoginActionResult>;
  log: (message: string) => void;
}

export interface AutoLoginRunnerResult {
  quickLoginTried: boolean;
  quickLoginSuccess: boolean;
  passwordLoginTried: boolean;
  passwordLoginSuccess: boolean;
}

export async function runAutoLoginWithFallback (
  config: AutoLoginFallbackConfig,
  deps: AutoLoginRunnerDeps
): Promise<AutoLoginRunnerResult> {
  const result: AutoLoginRunnerResult = {
    quickLoginTried: false,
    quickLoginSuccess: false,
    passwordLoginTried: false,
    passwordLoginSuccess: false,
  };

  const quickLoginAccount = config.autoLoginAccount?.trim();
  if (!quickLoginAccount) {
    deps.log('[NapCat] [WebUi] 未配置自动快速登录账号，跳过自动登录流程。');
    return result;
  }

  result.quickLoginTried = true;
  try {
    deps.log(`[NapCat] [WebUi] 正在尝试自动快速登录: ${quickLoginAccount}`);
    const quickLoginResult = await deps.quickLogin(quickLoginAccount);
    if (quickLoginResult.result) {
      result.quickLoginSuccess = true;
      deps.log(`[NapCat] [WebUi] 自动快速登录成功: ${quickLoginAccount}`);
      return result;
    }
    deps.log(`[NapCat] [WebUi] 自动快速登录失败: ${quickLoginResult.message || '未知错误'}`);
  } catch (error) {
    deps.log(`[NapCat] [WebUi] 自动快速登录异常: ${(error as Error).message}`);
  }

  const passwordLoginAccount = config.autoPasswordLoginAccount?.trim();
  const passwordMd5 = config.autoPasswordLoginPasswordMd5?.trim();
  if (!passwordLoginAccount || !passwordMd5) {
    deps.log('[NapCat] [WebUi] 未配置自动密码回退登录账号或密码，保持二维码登录兜底。');
    return result;
  }

  result.passwordLoginTried = true;
  try {
    deps.log(`[NapCat] [WebUi] 正在尝试自动密码回退登录: ${passwordLoginAccount}`);
    const passwordLoginResult = await deps.passwordLogin(passwordLoginAccount, passwordMd5);
    if (passwordLoginResult.result) {
      result.passwordLoginSuccess = true;
      deps.log(`[NapCat] [WebUi] 自动密码回退登录成功: ${passwordLoginAccount}`);
      return result;
    }
    deps.log(`[NapCat] [WebUi] 自动密码回退登录失败: ${passwordLoginResult.message || '未知错误'}`);
  } catch (error) {
    deps.log(`[NapCat] [WebUi] 自动密码回退登录异常: ${(error as Error).message}`);
  }

  deps.log('[NapCat] [WebUi] 自动登录回退结束，将保持二维码登录兜底。');
  return result;
}
