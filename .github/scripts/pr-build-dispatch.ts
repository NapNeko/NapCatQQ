/**
 * PR Build - Dispatch untrusted build workflow
 *
 * 环境变量:
 * - GITHUB_TOKEN: GitHub API Token
 * - PR_NUMBER: PR 编号
 * - PR_SHA: PR HEAD SHA
 * - PR_HEAD_REPO: PR 源仓库
 * - PR_HEAD_REF: PR 源分支
 * - WORKFLOW_FILE: 工作流文件名，默认 build-pr.yml
 * - DISPATCH_REF: 触发分支，默认当前分支
 */

import { GitHubAPI, getEnv, getRepository } from './lib/github.ts';

declare const process: { exit(code?: number): never; };

async function main (): Promise<void> {
  console.log('🚀 Dispatching PR build workflow\n');

  const token = getEnv('GITHUB_TOKEN', true)!;
  const prNumber = getEnv('PR_NUMBER', true)!;
  const prSha = getEnv('PR_SHA', true)!;
  const prHeadRepo = getEnv('PR_HEAD_REPO', true)!;
  const prHeadRef = getEnv('PR_HEAD_REF') || '';
  const workflowFile = getEnv('WORKFLOW_FILE') || 'build-pr.yml';
  const dispatchRef = getEnv('DISPATCH_REF') || getEnv('GITHUB_REF_NAME') || 'main';
  const { owner, repo } = getRepository();

  console.log(`PR: #${prNumber}`);
  console.log(`SHA: ${prSha}`);
  console.log(`Head repo: ${prHeadRepo}`);
  console.log(`Workflow: ${workflowFile}`);
  console.log(`Ref: ${dispatchRef}\n`);

  const github = new GitHubAPI(token);
  await github.createWorkflowDispatch(owner, repo, workflowFile, dispatchRef, {
    pr_number: prNumber,
    pr_sha: prSha,
    pr_head_repo: prHeadRepo,
    pr_head_ref: prHeadRef,
  });

  console.log('✅ Dispatch created');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
