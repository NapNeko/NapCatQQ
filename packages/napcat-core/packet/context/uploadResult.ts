export interface UploadResultLogger {
  warn (message: string): unknown;
  error (message: string): unknown;
}

export function assertUploadResults (
  results: PromiseSettledResult<unknown>[],
  logger: UploadResultLogger
): void {
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (failures.length === 0) return;

  logger.warn(`上传资源${results.length}个，失败${failures.length}个`);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const reason = result.reason instanceof Error
        ? result.reason.stack ?? result.reason.message
        : String(result.reason);
      logger.error(`上传第${index + 1}个资源失败：${reason}`);
    }
  });
  throw new AggregateError(
    failures.map(result => result.reason),
    `上传转发消息资源失败：${failures.length}/${results.length}`
  );
}
