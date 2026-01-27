import { serverRequest } from '@/utils/request';
import { PluginStoreList, PluginStoreItem } from '@/types/plugin-store';

export interface PluginItem {
  name: string;
  version: string;
  description: string;
  author: string;
  status: 'active' | 'disabled' | 'stopped';
  filename?: string;
}

export interface PluginListResponse {
  plugins: PluginItem[];
  pluginManagerNotFound: boolean;
}

export interface ServerResponse<T> {
  code: number;
  message: string;
  data: T;
}

export default class PluginManager {
  public static async getPluginList () {
    const { data } = await serverRequest.get<ServerResponse<PluginListResponse>>('/Plugin/List');
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

  // 插件商店相关方法
  public static async getPluginStoreList () {
    const { data } = await serverRequest.get<ServerResponse<PluginStoreList>>('/Plugin/Store/List');
    return data.data;
  }

  public static async getPluginStoreDetail (id: string) {
    const { data } = await serverRequest.get<ServerResponse<PluginStoreItem>>(`/Plugin/Store/Detail/${id}`);
    return data.data;
  }

  public static async installPluginFromStore (id: string, mirror?: string) {
    // 插件安装可能需要较长时间（下载+解压），设置5分钟超时
    await serverRequest.post<ServerResponse<void>>('/Plugin/Store/Install', { id, mirror }, {
      timeout: 300000, // 5分钟
    });
  }
}
