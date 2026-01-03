import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';

import { sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { WebUiConfig } from '@/napcat-webui-backend/index';
import { getLatestTag, getAllTags, compareSemVer } from 'napcat-common/src/helper';
import { getLatestActionArtifacts } from '@/napcat-common/src/mirror';

export const GetNapCatVersion: RequestHandler = (_, res) => {
  const data = WebUiDataRuntime.GetNapCatVersion();
  sendSuccess(res, { version: data });
};

export const getLatestTagHandler: RequestHandler = async (_, res) => {
  try {
    const latestTag = await getLatestTag();
    sendSuccess(res, latestTag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest tag', details: (error as Error).message });
  }
};

/**
 * 版本信息接口
 */
export interface VersionInfo {
  tag: string;
  type: 'release' | 'prerelease' | 'action';
  /** Action artifact 专用字段 */
  artifactId?: number;
  artifactName?: string;
  createdAt?: string;
  expiresAt?: string;
  size?: number;
}

/**
 * 获取所有可用的版本（release + action artifacts）
 * 支持分页
 */
export const getAllReleasesHandler: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const pageSize = parseInt(req.query['pageSize'] as string) || 20;
    const includeActions = req.query['includeActions'] !== 'false';
    const typeFilter = req.query['type'] as string | undefined; // 'release' | 'action' | 'all'
    const searchQuery = (req.query['search'] as string || '').toLowerCase().trim();

    let tags: string[] = [];
    let usedMirror = '';
    try {
      const result = await getAllTags();
      tags = result.tags;
      usedMirror = result.mirror;
    } catch {
      // 如果获取 tags 失败，返回空列表而不是抛出错误
      tags = [];
    }

    // 解析版本信息
    const versions: VersionInfo[] = tags.map(tag => {
      // 检查是否是预发布版本
      const isPrerelease = /-(alpha|beta|rc|dev|pre|snapshot)/i.test(tag);
      return {
        tag,
        type: isPrerelease ? 'prerelease' : 'release',
      };
    });

    // 使用语义化版本排序（最新的在前）
    versions.sort((a, b) => -compareSemVer(a.tag, b.tag));

    // 获取 Action Artifacts（如果请求）
    let actionVersions: VersionInfo[] = [];
    if (includeActions) {
      try {
        const artifacts = await getLatestActionArtifacts('NapNeko', 'NapCatQQ', 'build.yml', 'main');
        actionVersions = artifacts
          .filter(a => a.name.includes('NapCat'))
          .map(a => ({
            tag: `action-${a.id}`,
            type: 'action' as const,
            artifactId: a.id,
            artifactName: a.name,
            createdAt: a.created_at,
            expiresAt: a.expires_at,
            size: a.size_in_bytes,
          }));
      } catch {
        // 忽略 action artifacts 获取失败
      }
    }

    // 合并版本列表（action 在最前面）
    let allVersions = [...actionVersions, ...versions];

    // 按类型过滤
    if (typeFilter && typeFilter !== 'all') {
      if (typeFilter === 'release') {
        allVersions = allVersions.filter(v => v.type === 'release' || v.type === 'prerelease');
      } else if (typeFilter === 'action') {
        allVersions = allVersions.filter(v => v.type === 'action');
      }
    }

    // 搜索过滤
    if (searchQuery) {
      allVersions = allVersions.filter(v => {
        const tagMatch = v.tag.toLowerCase().includes(searchQuery);
        const nameMatch = v.artifactName?.toLowerCase().includes(searchQuery);
        return tagMatch || nameMatch;
      });
    }

    // 分页
    const total = allVersions.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedVersions = allVersions.slice(start, end);

    sendSuccess(res, {
      versions: paginatedVersions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      mirror: usedMirror
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
};

export const QQVersionHandler: RequestHandler = (_, res) => {
  const data = WebUiDataRuntime.getQQVersion();
  sendSuccess(res, data);
};

export const GetThemeConfigHandler: RequestHandler = async (_, res) => {
  const data = await WebUiConfig.GetTheme();
  sendSuccess(res, data);
};

export const SetThemeConfigHandler: RequestHandler = async (req, res) => {
  const { theme } = req.body;
  await WebUiConfig.UpdateTheme(theme);
  sendSuccess(res, { message: '更新成功' });
};
