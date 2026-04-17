/**
 * GitHub API 工具库
 */

import { appendFileSync } from 'node:fs';

// ============== 类型定义 ==============

export interface PullRequest {
  number: number;
  state: string;
  head: {
    sha: string;
    ref: string;
    repo: {
      full_name: string;
    };
  };
}

export interface Repository {
  owner: {
    type: string;
  };
}

export interface Artifact {
  id: number;
  name: string;
  size_in_bytes: number;
  archive_download_url: string;
}

export interface Release {
  id: number;
  tag_name: string;
  name: string;
  upload_url: string;
  html_url: string;
  created_at: string;
}

export interface ReleaseAsset {
  id: number;
  name: string;
  browser_download_url: string;
}

// ============== GitHub API Client ==========================

export class GitHubAPI {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor (token: string) {
    this.token = token;
  }

  private async request<T> (endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getPullRequest (owner: string, repo: string, pullNumber: number): Promise<PullRequest> {
    return this.request<PullRequest>(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  }

  async getCollaboratorPermission (owner: string, repo: string, username: string): Promise<string> {
    const data = await this.request<{ permission: string; }>(
      `/repos/${owner}/${repo}/collaborators/${username}/permission`
    );
    return data.permission;
  }

  async getRepository (owner: string, repo: string): Promise<Repository> {
    return this.request(`/repos/${owner}/${repo}`);
  }

  async checkOrgMembership (org: string, username: string): Promise<boolean> {
    try {
      await this.request(`/orgs/${org}/members/${username}`);
      return true;
    } catch {
      return false;
    }
  }

  async getRunArtifacts (owner: string, repo: string, runId: string): Promise<Artifact[]> {
    const data = await this.request<{ artifacts: Artifact[]; }>(
      `/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`
    );
    return data.artifacts;
  }

  async createComment (owner: string, repo: string, issueNumber: number, body: string): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async findComment (owner: string, repo: string, issueNumber: number, marker: string): Promise<number | null> {
    let page = 1;
    const perPage = 100;

    while (page <= 10) { // 最多检查 1000 条评论
      const comments = await this.request<Array<{ id: number, body: string; }>>(
        `/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=${perPage}&page=${page}`
      );

      if (comments.length === 0) {
        return null;
      }

      const found = comments.find(c => c.body.includes(marker));
      if (found) {
        return found.id;
      }

      if (comments.length < perPage) {
        return null;
      }

      page++;
    }

    return null;
  }

  async updateComment (owner: string, repo: string, commentId: number, body: string): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/issues/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async createOrUpdateComment (
    owner: string,
    repo: string,
    issueNumber: number,
    body: string,
    marker: string
  ): Promise<void> {
    const existingId = await this.findComment(owner, repo, issueNumber, marker);
    if (existingId) {
      await this.updateComment(owner, repo, existingId, body);
      console.log(`✓ Updated comment #${existingId}`);
    } else {
      await this.createComment(owner, repo, issueNumber, body);
      console.log('✓ Created new comment');
    }
  }

  // ============== Release API ==============

  async getReleaseByTag (owner: string, repo: string, tag: string): Promise<Release | null> {
    try {
      return await this.request<Release>(`/repos/${owner}/${repo}/releases/tags/${tag}`);
    } catch {
      return null;
    }
  }

  async deleteRelease (owner: string, repo: string, releaseId: number): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/releases/${releaseId}`, { method: 'DELETE' });
  }

  async deleteRef (owner: string, repo: string, ref: string): Promise<void> {
    try {
      await this.request(`/repos/${owner}/${repo}/git/refs/${ref}`, { method: 'DELETE' });
    } catch {
      // ref may not exist, ignore
    }
  }

  async createRelease (
    owner: string,
    repo: string,
    tag: string,
    name: string,
    body: string,
    prerelease = true
  ): Promise<Release> {
    return this.request<Release>(`/repos/${owner}/${repo}/releases`, {
      method: 'POST',
      body: JSON.stringify({ tag_name: tag, name, body, prerelease }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async uploadReleaseAsset (
    uploadUrl: string,
    fileName: string,
    data: Buffer,
    contentType = 'application/octet-stream'
  ): Promise<ReleaseAsset> {
    const url = uploadUrl.replace(/\{[^}]*\}/g, '') + `?name=${encodeURIComponent(fileName)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': contentType,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: data,
    });
    if (!response.ok) {
      throw new Error(`Upload ${fileName} failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<ReleaseAsset>;
  }

  // ============== Dispatch API ==============

  async repositoryDispatch (
    owner: string,
    repo: string,
    eventType: string,
    clientPayload: Record<string, string>
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type: eventType, client_payload: clientPayload }),
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(`Dispatch failed: ${response.status} ${response.statusText}`);
    }
  }

  // ============== Release Cleanup API ==============

  async listReleases (owner: string, repo: string, perPage = 100, page = 1): Promise<Release[]> {
    return this.request<Release[]>(
      `/repos/${owner}/${repo}/releases?per_page=${perPage}&page=${page}`
    );
  }
}

// ============== Output 工具 ==============

export function setOutput (name: string, value: string): void {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${name}=${value}\n`);
  }
  console.log(`  ${name}=${value}`);
}

export function setMultilineOutput (name: string, value: string): void {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const delimiter = `EOF_${Date.now()}`;
    appendFileSync(outputFile, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
  }
}

// ============== 环境变量工具 ==============

export function getEnv (name: string, required: true): string;
export function getEnv (name: string, required?: false): string | undefined;
export function getEnv (name: string, required = false): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

export function getRepository (): { owner: string, repo: string; } {
  const repository = getEnv('GITHUB_REPOSITORY', true);
  const [owner, repo] = repository.split('/');
  return { owner, repo };
}
