/**
 * PR Build Check Script
 * 检查 PR 构建触发条件和用户权限
 *
 * 环境变量:
 * - GITHUB_TOKEN: GitHub API Token
 * - GITHUB_EVENT_NAME: 事件名称
 * - GITHUB_EVENT_PATH: 事件 payload 文件路径
 * - GITHUB_REPOSITORY: 仓库名称 (owner/repo)
 * - GITHUB_OUTPUT: 输出文件路径
 */

import { readFileSync } from 'node:fs';
import { GitHubAPI, getEnv, getRepository, setOutput, PullRequest } from './lib/github.ts';

// ============== 类型定义 ==============

interface GitHubPayload {
  pull_request?: PullRequest;
  issue?: {
    number: number;
    pull_request?: object;
  };
  comment?: {
    body: string;
    user: { login: string; };
  };
}

interface CheckResult {
  should_build: boolean;
  pr_number?: number;
  pr_sha?: string;
  pr_head_repo?: string;
  pr_head_ref?: string;
}

// ============== 权限检查 ==============

async function checkUserPermission (
  github: GitHubAPI,
  owner: string,
  repo: string,
  username: string
): Promise<boolean> {
  // 方法1：检查仓库协作者权限
  try {
    const permission = await github.getCollaboratorPermission(owner, repo, username);
    if (['admin', 'write', 'maintain'].includes(permission)) {
      console.log(`✓ User ${username} has ${permission} permission`);
      return true;
    }
    console.log(`✗ User ${username} has ${permission} permission (insufficient)`);
  } catch (e) {
    console.log(`✗ Failed to get collaborator permission: ${(e as Error).message}`);
  }

  // 方法2：检查组织成员身份
  try {
    const repoInfo = await github.getRepository(owner, repo);
    if (repoInfo.owner.type === 'Organization') {
      const isMember = await github.checkOrgMembership(owner, username);
      if (isMember) {
        console.log(`✓ User ${username} is organization member`);
        return true;
      }
      console.log(`✗ User ${username} is not organization member`);
    }
  } catch (e) {
    console.log(`✗ Failed to check org membership: ${(e as Error).message}`);
  }

  return false;
}

// ============== 事件处理 ==============

function handlePullRequestTarget (payload: GitHubPayload): CheckResult {
  const pr = payload.pull_request;

  if (!pr) {
    console.log('✗ No pull_request in payload');
    return { should_build: false };
  }

  if (pr.state !== 'open') {
    console.log(`✗ PR is not open (state: ${pr.state})`);
    return { should_build: false };
  }

  console.log(`✓ PR #${pr.number} is open, triggering build`);
  return {
    should_build: true,
    pr_number: pr.number,
    pr_sha: pr.head.sha,
    pr_head_repo: pr.head.repo.full_name,
    pr_head_ref: pr.head.ref,
  };
}

async function handleIssueComment (
  payload: GitHubPayload,
  github: GitHubAPI,
  owner: string,
  repo: string
): Promise<CheckResult> {
  const { issue, comment } = payload;

  if (!issue || !comment) {
    console.log('✗ No issue or comment in payload');
    return { should_build: false };
  }

  // 检查是否是 PR 的评论
  if (!issue.pull_request) {
    console.log('✗ Comment is not on a PR');
    return { should_build: false };
  }

  // 检查是否是 /build 命令
  if (!comment.body.trim().startsWith('/build')) {
    console.log('✗ Comment is not a /build command');
    return { should_build: false };
  }

  console.log(`→ /build command from @${comment.user.login}`);

  // 获取 PR 详情
  const pr = await github.getPullRequest(owner, repo, issue.number);

  // 检查 PR 状态
  if (pr.state !== 'open') {
    console.log(`✗ PR is not open (state: ${pr.state})`);
    await github.createComment(owner, repo, issue.number, '⚠️ 此 PR 已关闭，无法触发构建。');
    return { should_build: false };
  }

  // 检查用户权限
  const username = comment.user.login;
  const hasPermission = await checkUserPermission(github, owner, repo, username);

  if (!hasPermission) {
    console.log(`✗ User ${username} has no permission`);
    await github.createComment(
      owner,
      repo,
      issue.number,
      `⚠️ @${username} 您没有权限使用 \`/build\` 命令，仅仓库协作者或组织成员可使用。`
    );
    return { should_build: false };
  }

  console.log(`✓ Build triggered by @${username}`);
  return {
    should_build: true,
    pr_number: issue.number,
    pr_sha: pr.head.sha,
    pr_head_repo: pr.head.repo.full_name,
    pr_head_ref: pr.head.ref,
  };
}

// ============== 主函数 ==============

async function main (): Promise<void> {
  console.log('🔍 PR Build Check\n');

  const token = getEnv('GITHUB_TOKEN', true);
  const eventName = getEnv('GITHUB_EVENT_NAME', true);
  const eventPath = getEnv('GITHUB_EVENT_PATH', true);
  const { owner, repo } = getRepository();

  console.log(`Event: ${eventName}`);
  console.log(`Repository: ${owner}/${repo}\n`);

  const payload = JSON.parse(readFileSync(eventPath, 'utf-8')) as GitHubPayload;
  const github = new GitHubAPI(token);

  let result: CheckResult;

  switch (eventName) {
    case 'pull_request_target':
      result = handlePullRequestTarget(payload);
      break;
    case 'issue_comment':
      result = await handleIssueComment(payload, github, owner, repo);
      break;
    default:
      console.log(`✗ Unsupported event: ${eventName}`);
      result = { should_build: false };
  }

  // 输出结果
  console.log('\n=== Outputs ===');
  setOutput('should_build', String(result.should_build));
  setOutput('pr_number', String(result.pr_number ?? ''));
  setOutput('pr_sha', result.pr_sha ?? '');
  setOutput('pr_head_repo', result.pr_head_repo ?? '');
  setOutput('pr_head_ref', result.pr_head_ref ?? '');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
