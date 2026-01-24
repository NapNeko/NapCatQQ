// 插件商店相关类型定义

export interface PluginStoreItem {
  id: string; // 插件唯一标识
  name: string; // 插件名称
  version: string; // 最新版本
  description: string; // 插件描述
  author: string; // 作者
  homepage?: string; // 主页链接
  repository?: string; // 仓库地址
  downloadUrl: string; // 下载地址
  tags?: string[]; // 标签
  icon?: string; // 图标URL
  screenshots?: string[]; // 截图
  minNapCatVersion?: string; // 最低NapCat版本要求
  dependencies?: Record<string, string>; // 依赖
  downloads?: number; // 下载次数
  rating?: number; // 评分
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

export interface PluginStoreList {
  version: string; // 索引版本
  updateTime: string; // 更新时间
  plugins: PluginStoreItem[]; // 插件列表
}
