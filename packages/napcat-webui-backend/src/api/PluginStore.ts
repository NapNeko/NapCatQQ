import { RequestHandler } from 'express';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { PluginStoreList } from '@/napcat-webui-backend/src/types/PluginStore';

// Mock数据 - 模拟远程插件列表
const mockPluginStoreData: PluginStoreList = {
  version: '1.0.0',
  updateTime: new Date().toISOString(),
  plugins: [
    {
      id: 'napcat-plugin-example',
      name: '示例插件',
      version: '1.0.0',
      description: '这是一个示例插件，展示如何开发NapCat插件',
      author: 'NapCat Team',
      homepage: 'https://github.com/NapNeko/NapCatQQ',
      repository: 'https://github.com/NapNeko/NapCatQQ',
      downloadUrl: 'https://example.com/plugins/napcat-plugin-example-1.0.0.zip',
      tags: ['示例', '教程'],
      screenshots: ['https://picsum.photos/800/600?random=1'],
      minNapCatVersion: '1.0.0',
      downloads: 1234,
      rating: 4.5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
    {
      id: 'napcat-plugin-auto-reply',
      name: '自动回复插件',
      version: '2.1.0',
      description: '支持关键词匹配的自动回复功能，可配置多种回复规则',
      author: 'Community',
      homepage: 'https://github.com/example/auto-reply',
      repository: 'https://github.com/example/auto-reply',
      downloadUrl: 'https://example.com/plugins/napcat-plugin-auto-reply-2.1.0.zip',
      tags: ['自动回复', '消息处理'],
      minNapCatVersion: '1.0.0',
      downloads: 5678,
      rating: 4.8,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z',
    },
    {
      id: 'napcat-plugin-welcome',
      name: '入群欢迎插件',
      version: '1.2.3',
      description: '新成员入群时自动发送欢迎消息，支持自定义欢迎语',
      author: 'Developer',
      homepage: 'https://github.com/example/welcome',
      repository: 'https://github.com/example/welcome',
      downloadUrl: 'https://example.com/plugins/napcat-plugin-welcome-1.2.3.zip',
      tags: ['欢迎', '群管理'],
      minNapCatVersion: '1.0.0',
      downloads: 3456,
      rating: 4.3,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
    },
    {
      id: 'napcat-plugin-music',
      name: '音乐点歌插件',
      version: '3.0.1',
      description: '支持网易云、QQ音乐等平台的点歌功能',
      author: 'Music Lover',
      homepage: 'https://github.com/example/music',
      repository: 'https://github.com/example/music',
      downloadUrl: 'https://example.com/plugins/napcat-plugin-music-3.0.1.zip',
      tags: ['音乐', '娱乐'],
      screenshots: ['https://picsum.photos/800/600?random=4', 'https://picsum.photos/800/600?random=5'],
      minNapCatVersion: '1.1.0',
      downloads: 8901,
      rating: 4.9,
      createdAt: '2023-12-01T00:00:00Z',
      updatedAt: '2024-01-23T00:00:00Z',
    },
    {
      id: 'napcat-plugin-admin',
      name: '群管理插件',
      version: '2.5.0',
      description: '提供踢人、禁言、设置管理员等群管理功能',
      author: 'Admin Tools',
      homepage: 'https://github.com/example/admin',
      repository: 'https://github.com/example/admin',
      downloadUrl: 'https://example.com/plugins/napcat-plugin-admin-2.5.0.zip',
      tags: ['管理', '群管理', '工具'],
      minNapCatVersion: '1.0.0',
      downloads: 6789,
      rating: 4.6,
      createdAt: '2023-12-15T00:00:00Z',
      updatedAt: '2024-01-21T00:00:00Z',
    },
    {
      id: 'napcat-plugin-image-search',
      name: '以图搜图插件',
      version: '1.5.2',
      description: '支持多个搜图引擎，快速找到图片来源',
      author: 'Image Hunter',
      homepage: 'https://github.com/example/image-search',
      repository: 'https://github.com/example/image-search',
      downloadUrl: 'https://example.com/plugins/napcat-plugin-image-search-1.5.2.zip',
      tags: ['图片', '搜索', '工具'],
      minNapCatVersion: '1.0.0',
      downloads: 4567,
      rating: 4.4,
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-19T00:00:00Z',
    },
  ],
};

/**
 * 获取插件商店列表
 * 未来可以从远程URL读取
 */
export const GetPluginStoreListHandler: RequestHandler = async (_req, res) => {
  try {
    // TODO: 未来从远程URL读取
    // const remoteUrl = 'https://napcat.example.com/plugin-list.json';
    // const response = await fetch(remoteUrl);
    // const data = await response.json();

    // 目前返回Mock数据
    return sendSuccess(res, mockPluginStoreData);
  } catch (e: any) {
    return sendError(res, 'Failed to fetch plugin store list: ' + e.message);
  }
};

/**
 * 获取单个插件详情
 */
export const GetPluginStoreDetailHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const plugin = mockPluginStoreData.plugins.find(p => p.id === id);

    if (!plugin) {
      return sendError(res, 'Plugin not found');
    }

    return sendSuccess(res, plugin);
  } catch (e: any) {
    return sendError(res, 'Failed to fetch plugin detail: ' + e.message);
  }
};

/**
 * 安装插件（从商店）
 * TODO: 实现实际的下载和安装逻辑
 */
export const InstallPluginFromStoreHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return sendError(res, 'Plugin ID is required');
    }

    const plugin = mockPluginStoreData.plugins.find(p => p.id === id);

    if (!plugin) {
      return sendError(res, 'Plugin not found in store');
    }

    // TODO: 实现实际的下载和安装逻辑
    // 1. 下载插件文件
    // 2. 解压到插件目录
    // 3. 加载插件

    return sendSuccess(res, {
      message: 'Plugin installation started',
      plugin: plugin
    });
  } catch (e: any) {
    return sendError(res, 'Failed to install plugin: ' + e.message);
  }
};
