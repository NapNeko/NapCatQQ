import type { Context } from 'hono';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';

import { sendSuccess, sendError } from '@/napcat-webui-backend/src/utils/response';
import { WebUiConfig, webUiPathWrapper } from '@/napcat-webui-backend/index';
import { getLatestTag, getAllTags, compareSemVer } from 'napcat-common/src/helper';
import { getLatestActionArtifacts, getMirrorConfig } from '@/napcat-common/src/mirror';
import { NapCatCoreWorkingEnv } from '@/napcat-webui-backend/src/types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const GetNapCatVersion = (c: Context) => {
  const data = WebUiDataRuntime.GetNapCatVersion();
  return sendSuccess(c, { version: data });
};

export const getLatestTagHandler = async (c: Context) => {
  try {
    const latestTag = await getLatestTag();
    return sendSuccess(c, latestTag);
  } catch (error) {
    return c.json({ error: 'Failed to fetch latest tag', details: (error as Error).message }, 500);
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
  workflowRunId?: number;
  headSha?: string;
  workflowTitle?: string;
}

/**
 * 获取所有可用的版本（release + action artifacts）
 * 支持分页，懒加载：根据 type 参数只获取需要的版本类型
 */
export const getAllReleasesHandler = async (c: Context) => {
  try {
    const page = parseInt(c.req.query('page') || '1') || 1;
    const pageSize = parseInt(c.req.query('pageSize') || '20') || 20;
    const typeFilter = c.req.query('type'); // 'release' | 'action' | 'all'
    const searchQuery = (c.req.query('search') || '').toLowerCase().trim();
    const mirror = c.req.query('mirror');

    let versions: VersionInfo[] = [];
    let actionVersions: VersionInfo[] = [];
    let usedMirror = '';

    // If mirror is specified, report it as used (will be confirmed by actual fetching response)
    if (mirror) {
      usedMirror = mirror;
    }

    // 懒加载：只获取需要的版本类型
    const needReleases = !typeFilter || typeFilter === 'all' || typeFilter === 'release';
    const needActions = typeFilter === 'action' || typeFilter === 'all';

    // 获取正式版本（仅当需要时）
    if (needReleases) {
      try {
        const result = await getAllTags(mirror);
        // 如果没有指定镜像，使用实际上使用的镜像
        if (!mirror) {
          usedMirror = result.mirror;
        }

        versions = result.tags.map(tag => {
          const isPrerelease = /-(alpha|beta|rc|dev|pre|snapshot)/i.test(tag);
          return {
            tag,
            type: isPrerelease ? 'prerelease' : 'release',
          } as VersionInfo;
        });

        // 使用语义化版本排序（最新的在前）
        versions.sort((a, b) => -compareSemVer(a.tag, b.tag));
      } catch {
        // 如果获取 tags 失败，返回空列表而不是抛出错误
        versions = [];
      }
    }

    // 获取 Action Artifacts（仅当需要时）
    if (needActions) {
      try {
        const { artifacts, mirror: actionMirror } = await getLatestActionArtifacts('NapNeko', 'NapCatQQ', 'build.yml', 'main', 10, mirror);

        // 根据当前工作环境自动过滤对应的 artifact 类型
        const isFramework = WebUiDataRuntime.getWorkingEnv() === NapCatCoreWorkingEnv.Framework;
        const targetArtifactName = isFramework ? 'NapCat.Framework' : 'NapCat.Shell';

        // 如果没有指定镜像，且 action 实际上用了一个镜像（自动选择的），更新 usedMirror
        if (!mirror && actionMirror) {
          usedMirror = actionMirror;
        }

        actionVersions = artifacts
          .filter(a => a && a.name === targetArtifactName)
          .map(a => ({
            tag: `action-${a.id}`,
            type: 'action' as const,
            artifactId: a.id,
            artifactName: a.name,
            createdAt: a.created_at,
            expiresAt: a.expires_at,
            size: a.size_in_bytes,
            workflowRunId: a.workflow_run_id,
            headSha: a.head_sha,
            workflowTitle: a.workflow_title,
          }));
      } catch {
        // 获取失败时返回空列表
        actionVersions = [];
      }
    }

    // 合并版本列表（action 在最前面）
    let allVersions = [...actionVersions, ...versions];

    // 搜索过滤
    if (searchQuery) {
      allVersions = allVersions.filter(v => {
        const tagMatch = v.tag.toLowerCase().includes(searchQuery);
        const nameMatch = v.artifactName?.toLowerCase().includes(searchQuery);
        const titleMatch = v.workflowTitle?.toLowerCase().includes(searchQuery);
        const shaMatch = v.headSha?.toLowerCase().includes(searchQuery);
        return tagMatch || nameMatch || titleMatch || shaMatch;
      });
    }

    // 分页
    const total = allVersions.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedVersions = allVersions.slice(start, end);

    return sendSuccess(c, {
      versions: paginatedVersions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      mirror: usedMirror,
    });
  } catch (_error) {
    return c.json({ error: 'Failed to fetch releases' }, 500);
  }
};

export const QQVersionHandler = (c: Context) => {
  const data = WebUiDataRuntime.getQQVersion();
  return sendSuccess(c, data);
};

export const GetThemeConfigHandler = async (c: Context) => {
  const data = await WebUiConfig.GetTheme();
  return sendSuccess(c, data);
};

export const SetThemeConfigHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { theme } = body as { theme?: unknown };
  if (theme === undefined || theme === null || typeof theme !== 'object') {
    return sendError(c, 'theme is required and must be an object');
  }
  await WebUiConfig.UpdateTheme(theme as Parameters<typeof WebUiConfig.UpdateTheme>[0]);
  return sendSuccess(c, { message: '更新成功' });
};

export const GetMirrorsHandler = (c: Context) => {
  const config = getMirrorConfig();
  return sendSuccess(c, { mirrors: config.fileMirrors });
};

export const GetNapCatFileHashHandler = (c: Context) => {
  try {
    const filePath = path.join(webUiPathWrapper.binaryPath, 'napcat.mjs');
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha512').update(fileBuffer).digest('hex');
    return sendSuccess(c, { hash, file: 'napcat.mjs', algorithm: 'sha512' });
  } catch (error) {
    return sendError(c, `无法计算 napcat.mjs 的 hash：${(error as Error).message}`);
  }
};
