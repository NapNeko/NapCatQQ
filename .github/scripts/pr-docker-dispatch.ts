/**
 * PR Build - 触发 NapCat-Docker 仓库构建 PR 测试镜像
 *
 * 功能：
 *   1. 在 PR 中创建 Docker 构建中评论
 *   2. 触发 NapCat-Docker 仓库的 repository_dispatch 事件
 *
 * 环境变量：
 *   DISPATCH_PAT   - 具备目标仓库 dispatch 权限的 PAT
 *   GITHUB_TOKEN   - GitHub API Token (用于写 PR 评论)
 *   PR_NUMBER      - PR 编号
 *   PR_SHA         - PR HEAD 提交 SHA
 *   PR_HEAD_REPO   - PR 源仓库 (owner/repo)
 *   SOURCE_REPO    - 当前仓库 (默认 NapNeko/NapCatQQ)
 *   RELEASE_REPO   - PR release 仓库 (默认 NapNeko/napcat-pr-release)
 *   TARGET_REPO    - Docker 仓库 (默认 NapNeko/NapCat-Docker)
 */

import { GitHubAPI, getEnv } from './lib/github.ts';
import { generateDockerBuildingComment, DOCKER_COMMENT_MARKER } from './lib/comment.ts';

async function main (): Promise<void> {
  console.log('🐳 Dispatching Docker build\n');

  const token = getEnv('DISPATCH_PAT', true);
  const githubToken = getEnv('GITHUB_TOKEN', true);
  const prNumber = getEnv('PR_NUMBER', true);
  const prSha = getEnv('PR_SHA', true);
  const prHeadRepo = getEnv('PR_HEAD_REPO') || '';
  const sourceRepo = getEnv('SOURCE_REPO') || 'NapNeko/NapCatQQ';
  const releaseRepo = getEnv('RELEASE_REPO') || 'NapNeko/napcat-pr-release';
  const targetRepo = getEnv('TARGET_REPO') || 'NapNeko/NapCat-Docker';

  const [targetOwner, targetRepoName] = targetRepo.split('/');
  const [sourceOwner, sourceRepoName] = sourceRepo.split('/');
  const shortSha = prSha.substring(0, 7);

  console.log(`  PR:       #${prNumber}`);
  console.log(`  SHA:      ${shortSha}`);
  console.log(`  Target:   ${targetRepo}`);
  console.log(`  Release:  ${releaseRepo}\n`);

  // 在 PR 中创建 Docker 构建中评论
  console.log('💬 Creating Docker building comment...');
  const prGithub = new GitHubAPI(githubToken);
  const dockerComment = generateDockerBuildingComment(prNumber, prSha);
  await prGithub.createOrUpdateComment(
    sourceOwner, sourceRepoName, parseInt(prNumber, 10), dockerComment, DOCKER_COMMENT_MARKER
  );

  // 触发 Docker 仓库构建
  const github = new GitHubAPI(token);

  await github.repositoryDispatch(targetOwner, targetRepoName, 'napcatqq-pr-build', {
    pr_number: prNumber,
    pr_sha: prSha,
    pr_short_sha: shortSha,
    pr_head_repo: prHeadRepo,
    source_repo: sourceRepo,
    release_repo: releaseRepo,
  });

  console.log('✅ Dispatch succeeded');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
