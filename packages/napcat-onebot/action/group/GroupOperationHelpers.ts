import type { GeneralCallResult } from 'napcat-core';

export function assertGroupManagementResults (
  operation: string,
  results: Array<{ setting: string, result: GeneralCallResult; }>
): void {
  const failure = results.find(item => item.result.result !== 0);
  if (!failure) return;
  throw new Error(
    `${operation}失败 Setting: ${failure.setting} ErrCode: ${failure.result.result} ` +
    `ErrMsg: ${failure.result.errMsg || '未知错误'}`
  );
}
