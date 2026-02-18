export interface AutoPasswordLoginConfigPatch {
  autoPasswordLoginAccount: string;
  autoPasswordLoginPasswordMd5?: string;
}

export function buildAutoPasswordLoginConfigPatch (uin: string, passwordMd5?: string): AutoPasswordLoginConfigPatch {
  const patch: AutoPasswordLoginConfigPatch = {
    autoPasswordLoginAccount: uin,
  };
  if (passwordMd5 && passwordMd5.trim()) {
    patch.autoPasswordLoginPasswordMd5 = passwordMd5;
  }
  return patch;
}
