import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';

import { sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { WebUiConfig } from '@/napcat-webui-backend/index';
import { getLatestTag, getAllTags, compareSemVer } from 'napcat-common/src/helper';
import { getLatestActionArtifacts, getMirrorConfig } from '@/napcat-common/src/mirror';
import { NapCatCoreWorkingEnv } from '@/napcat-webui-backend/src/types';

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
  workflowRunId?: number;
  headSha?: string;
  workflowTitle?: string;
}

/**
 * 获取所有可用的版本（release + action artifacts）
 * 支持分页，懒加载：根据 type 参数只获取需要的版本类型
 */
export const getAllReleasesHandler: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const pageSize = parseInt(req.query['pageSize'] as string) || 20;
    const typeFilter = req.query['type'] as string | undefined; // 'release' | 'action' | 'all'
    const searchQuery = (req.query['search'] as string || '').toLowerCase().trim();
    const mirror = req.query['mirror'] as string | undefined;

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

export const GetMirrorsHandler: RequestHandler = (_, res) => {
  const config = getMirrorConfig();
  sendSuccess(res, { mirrors: config.fileMirrors });
};
