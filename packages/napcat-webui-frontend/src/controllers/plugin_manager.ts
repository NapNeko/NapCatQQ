import { serverRequest } from '@/utils/request';
import { PluginStoreList, PluginStoreItem } from '@/types/plugin-store';

export interface PluginItem {
  name: string;
  version: string;
  description: string;
  author: string;
  status: 'active' | 'disabled' | 'stopped';
  filename?: string;
  hasConfig?: boolean;
}

export interface PluginListResponse {
  plugins: PluginItem[];
  pluginManagerNotFound: boolean;
}

export interface PluginConfigSchemaItem {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'html' | 'text';
  label: string;
  description?: string;
  default?: any;
  options?: { label: string; value: string | number; }[];
  placeholder?: string;
}

export interface PluginConfigResponse {
  schema: PluginConfigSchemaItem[];
  config: any;
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

  /**
   * 手动注册插件管理器到 NetworkManager
   */
  public static async registerPluginManager () {
    const { data } = await serverRequest.post<ServerResponse<{ message: string; }>>('/Plugin/RegisterManager');
    return data.data;
  }



  public static async setPluginStatus (name: string, enable: boolean, filename?: string) {
    await serverRequest.post<ServerResponse<void>>('/Plugin/SetStatus', { name, enable, filename });
  }

  public static async uninstallPlugin (name: string, filename?: string, cleanData?: boolean) {
    await serverRequest.post<ServerResponse<void>>('/Plugin/Uninstall', { name, filename, cleanData });
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

  // 插件配置相关方法
  public static async getPluginConfig (name: string) {
    const { data } = await serverRequest.get<ServerResponse<PluginConfigResponse>>('/Plugin/Config', { params: { name } });
    return data.data;
  }

  public static async setPluginConfig (name: string, config: any) {
    await serverRequest.post<ServerResponse<void>>('/Plugin/Config', { name, config });
  }
}
