/**
 * PR Build - 更新构建结果评论
 *
 * 环境变量:
 * - GITHUB_TOKEN: GitHub API Token
 * - PR_NUMBER: PR 编号
 * - PR_SHA: PR 提交 SHA
 * - RUN_ID: GitHub Actions Run ID
 * - FRAMEWORK_STATUS: Framework 构建状态
 * - FRAMEWORK_ERROR: Framework 构建错误信息
 * - SHELL_STATUS: Shell 构建状态
 * - SHELL_ERROR: Shell 构建错误信息
 */

import { GitHubAPI, getEnv, getRepository } from './lib/github.ts';
import { generateResultComment, COMMENT_MARKER } from './lib/comment.ts';
import type { BuildTarget, BuildStatus } from './lib/comment.ts';

function parseStatus (value: string | undefined): BuildStatus {
  if (value === 'success' || value === 'failure' || value === 'cancelled') {
    return value;
  }
  return 'unknown';
}

async function main (): Promise<void> {
  console.log('📝 Updating build result comment\n');

  const token = getEnv('GITHUB_TOKEN', true);
  const prNumber = parseInt(getEnv('PR_NUMBER', true), 10);
  const prSha = getEnv('PR_SHA') || 'unknown';
  const runId = getEnv('RUN_ID', true);
  const { owner, repo } = getRepository();

  const frameworkStatus = parseStatus(getEnv('FRAMEWORK_STATUS'));
  const frameworkError = getEnv('FRAMEWORK_ERROR');
  const shellStatus = parseStatus(getEnv('SHELL_STATUS'));
  const shellError = getEnv('SHELL_ERROR');

  console.log(`PR: #${prNumber}`);
  console.log(`SHA: ${prSha}`);
  console.log(`Run: ${runId}`);
  console.log(`Framework: ${frameworkStatus}${frameworkError ? ` (${frameworkError})` : ''}`);
  console.log(`Shell: ${shellStatus}${shellError ? ` (${shellError})` : ''}\n`);

  const targets: BuildTarget[] = [
    { name: 'NapCat.Framework', status: frameworkStatus, error: frameworkError },
    { name: 'NapCat.Shell', status: shellStatus, error: shellError },
  ];

  const github = new GitHubAPI(token);
  const repository = `${owner}/${repo}`;
  const comment = generateResultComment(targets, prSha, runId, repository);

  await github.createOrUpdateComment(owner, repo, prNumber, comment, COMMENT_MARKER);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
