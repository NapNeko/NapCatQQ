import { serverRequest } from '@/utils/request';

export interface RestartProcessResponse {
  message: string;
  restartType?: 'manual' | 'automatic';
}

export default class ProcessManager {
  /**
   * 重启进程
   * @param restartType 重启类型: 'manual' (用户手动触发) 或 'automatic' (系统自动触发)
   */
  public static async restartProcess (restartType: 'manual' | 'automatic' = 'manual') {
    const data = await serverRequest.post<ServerResponse<RestartProcessResponse>>(
      '/Process/Restart',
      { restartType }
    );

    return data.data.data;
  }
}
