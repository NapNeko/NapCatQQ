import type { NodeIKernelRichMediaService } from '../services/NodeIKernelRichMediaService';

type GroupFileService = Pick<NodeIKernelRichMediaService, 'getGroupFileInfo' | 'deleteGroupFile'>;

function withTimeout<T> (promise: Promise<T>, operation: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${operation}超时，请重新查询群文件列表确认文件状态`)), 15000);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

function assertBusId (busId: number): void {
  if (!Number.isInteger(busId) || busId <= 0 || busId > 0xFFFFFFFF) {
    throw new Error('Invalid bus_id');
  }
}

export async function deleteGroupFiles (service: GroupFileService, groupCode: string, files: string[], busIds?: number[]) {
  if (!files.length || files.some(fileId => !fileId)) {
    throw new Error('Invalid file_id');
  }
  if (busIds && busIds.length !== files.length) {
    throw new Error('bus_id 数量必须与文件数量一致');
  }

  const resolvedBusIds: number[] = [];
  for (const [index, fileId] of files.entries()) {
    let busId = busIds?.[index];
    if (busId === undefined) {
      const info = await withTimeout(service.getGroupFileInfo(groupCode, fileId), '查询群文件信息');
      if (info?.result !== 0) {
        throw new Error(`查询群文件信息失败: ${info?.errMsg || info?.result}`);
      }
      const detail = info.groupFileInfoResult;
      if (detail?.retCode !== 0 || detail.fileInfo?.fileId !== fileId) {
        throw new Error(`查询群文件信息失败: ${detail?.clientWording || detail?.retMsg || '未返回目标文件信息'}`);
      }
      busId = detail.fileInfo.busId;
    }
    assertBusId(busId);
    resolvedBusIds.push(busId);
  }

  const response = await withTimeout(service.deleteGroupFile(groupCode, resolvedBusIds, files), '删除群文件');
  if (response?.result !== 0) {
    throw new Error(`删除群文件失败: ${response?.errMsg || response?.result}`);
  }
  const detail = response.transGroupFileResult;
  if (detail?.result?.retCode !== 0) {
    throw new Error(`删除群文件失败: ${detail?.result?.clientWording || detail?.result?.retMsg || detail?.result?.retCode || '缺少删除结果'}`);
  }
  if (!Array.isArray(detail.successFileIdList) || !Array.isArray(detail.failFileIdList)) {
    throw new Error('删除群文件失败: 缺少逐文件删除结果');
  }
  const missing = files.filter(fileId => !detail.successFileIdList.includes(fileId));
  if (detail.failFileIdList.length || missing.length) {
    const failed = [...new Set([...detail.failFileIdList, ...missing])];
    throw new Error(`删除群文件失败: ${failed.join(', ')}`);
  }
  return response;
}
