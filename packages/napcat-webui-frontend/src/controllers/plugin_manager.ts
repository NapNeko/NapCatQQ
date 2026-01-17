import { serverRequest } from '@/utils/request';

export interface PluginItem {
  name: string;
  version: string;
  description: string;
  author: string;
  status: 'active' | 'disabled';
  filename?: string;
}

export interface ServerResponse<T> {
  code: number;
  message: string;
  data: T;
}

export default class PluginManager {
  public static async getPluginList () {
    const { data } = await serverRequest.get<ServerResponse<PluginItem[]>>('/Plugin/List');
    return data.data;
  }

  public static async reloadPlugin (name: string) {
    await serverRequest.post<ServerResponse<void>>('/Plugin/Reload', { name });
  }

  public static async setPluginStatus (name: string, enable: boolean, filename?: string) {
    await serverRequest.post<ServerResponse<void>>('/Plugin/SetStatus', { name, enable, filename });
  }

  public static async uninstallPlugin (name: string, filename?: string) {
    await serverRequest.post<ServerResponse<void>>('/Plugin/Uninstall', { name, filename });
  }
}
