import { serverRequest } from '@/utils/request';

export default class ProcessManager {
  /**
   * 重启进程
   */
  public static async restartProcess () {
    const data = await serverRequest.post<ServerResponse<{ message: string; }>>(
      '/Process/Restart'
    );

    return data.data.data;
  }
}
