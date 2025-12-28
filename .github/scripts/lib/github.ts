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
