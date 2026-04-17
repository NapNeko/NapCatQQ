/**
 * PR Build - 发布构建产物到 napcat-pr-release 仓库
 *
 * 功能：
 *   1. 将 CI 构建产物（Framework / Shell）打包为 zip
 *   2. 从 NapCat-Installer 仓库拉取 install.sh 并替换下载链接
 *   3. 发布到 napcat-pr-release 仓库的 GitHub Release
 *
 * 环境变量：
 *   RELEASE_PAT       - 具备目标仓库 release 写权限的 PAT
 *   PR_NUMBER         - PR 编号
 *   PR_SHA            - PR HEAD 提交 SHA
 *   NAPCAT_VERSION    - 构建版本号
 *   ARTIFACTS_DIR     - 构建产物目录 (默认 ./artifacts)
 *   RELEASE_REPO      - 发布仓库 (默认 NapNeko/napcat-pr-release)
 *   INSTALLER_REPO    - 安装脚本仓库 (默认 NapNeko/NapCat-Installer)
 *   INSTALLER_BRANCH  - 安装脚本分支 (默认 main)
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { GitHubAPI, getEnv, setOutput } from './lib/github.ts';

interface AssetEntry {
  name: string;
  path: string;
  contentType: string;
}

async function main (): Promise<void> {
  console.log('📦 PR Release Publisher\n');

  const token = getEnv('RELEASE_PAT', true);
  const prNumber = getEnv('PR_NUMBER', true);
  const prSha = getEnv('PR_SHA', true);
  const version = getEnv('NAPCAT_VERSION') || 'unknown';
  const artifactsDir = getEnv('ARTIFACTS_DIR') || './artifacts';
  const releaseRepo = getEnv('RELEASE_REPO') || 'NapNeko/napcat-pr-release';
  const installerRepo = getEnv('INSTALLER_REPO') || 'NapNeko/NapCat-Installer';
  const installerBranch = getEnv('INSTALLER_BRANCH') || 'main';

  const [releaseOwner, releaseRepoName] = releaseRepo.split('/');
  const shortSha = prSha.substring(0, 7);
  const tag = `pr-${prNumber}-${shortSha}`;
  const releaseName = `PR #${prNumber} (${shortSha})`;
  const downloadBase = `https://github.com/${releaseRepo}/releases/download/${tag}`;

  console.log(`  Tag:      ${tag}`);
  console.log(`  Repo:     ${releaseRepo}`);
  console.log(`  Version:  ${version}`);
  console.log(`  SHA:      ${shortSha}\n`);

  const github = new GitHubAPI(token);
  const releaseDir = resolve('./release-assets'); // 使用绝对路径，避免 zip cwd 切换后相对路径解析错误
  mkdirSync(releaseDir, { recursive: true });

  // ---- 打包构建产物 ----
  const artifacts = ['NapCat.Framework', 'NapCat.Shell'];
  for (const name of artifacts) {
    const dir = join(artifactsDir, name);
    if (existsSync(dir)) {
      const zipPath = join(releaseDir, `${name}.zip`);
      console.log(`📦 Packing ${name}...`);
      execSync(`zip -qr "${zipPath}" .`, { cwd: dir, stdio: 'inherit' });
      console.log(`  ✓ ${name}.zip\n`);
    } else {
      console.log(`  ⚠ ${name} 目录不存在，跳过\n`);
    }
  }

  // ---- 拉取并修改安装脚本 ----
  console.log('📜 Fetching install.sh...');
  const scriptUrl = `https://raw.githubusercontent.com/${installerRepo}/${installerBranch}/script/install.sh`;
  try {
    const response = await fetch(scriptUrl);
    if (response.ok) {
      let script = await response.text();
      // 替换下载链接（保留代理前缀 ${target_proxy:+${target_proxy}/}）
      const shellUrl = `${downloadBase}/NapCat.Shell.zip`;
      const originalScript = script;
      script = script.replace(
        /napcat_download_url="\$\{target_proxy:\+\$\{target_proxy\}\/\}https:\/\/github\.com\/NapNeko\/NapCatQQ\/releases\/latest\/download\/NapCat\.Shell\.zip"/g,
        `napcat_download_url="\${target_proxy:+\${target_proxy}/}${shellUrl}"`
      );
      if (script === originalScript) {
        console.log('  ⚠ Warning: URL replacement did not match - install.sh format may have changed');
      }
      const scriptPath = join(releaseDir, 'install.sh');
      writeFileSync(scriptPath, script, { mode: 0o755 });
      console.log(`  ✓ Patched download URL -> ${shellUrl}\n`);
    } else {
      console.log(`  ⚠ Failed to fetch install.sh: ${response.status}\n`);
    }
  } catch (e) {
    console.log(`  ⚠ Failed to fetch install.sh: ${(e as Error).message}\n`);
  }

  // ---- 收集所有要上传的文件 ----
  const assets: AssetEntry[] = [];
  for (const file of readdirSync(releaseDir)) {
    const ext = file.split('.').pop()?.toLowerCase();
    const contentType = ext === 'zip' ? 'application/zip' : ext === 'sh' ? 'application/x-sh' : 'application/octet-stream';
    assets.push({ name: file, path: join(releaseDir, file), contentType });
  }
  console.log(`📋 Assets to upload: ${assets.map(a => a.name).join(', ')}\n`);

  // ---- 删除旧 release ----
  console.log('🗑️ Checking for existing release...');
  const existing = await github.getReleaseByTag(releaseOwner, releaseRepoName, tag);
  if (existing) {
    console.log(`  Deleting existing release (id=${existing.id})...`);
    await github.deleteRelease(releaseOwner, releaseRepoName, existing.id);
    await github.deleteRef(releaseOwner, releaseRepoName, `tags/${tag}`);
    console.log('  ✓ Deleted\n');
  } else {
    console.log('  No existing release\n');
  }

  // ---- 创建 Release ----
  const releaseBody = [
    `## NapCat PR #${prNumber} 测试版本`,
    '',
    `- **版本**: \`${version}\``,
    `- **提交**: \`${prSha}\``,
    `- **来源**: [NapCatQQ PR #${prNumber}](https://github.com/NapNeko/NapCatQQ/pull/${prNumber})`,
    '',
    '### 快速安装 (Linux)',
    '',
    '```bash',
    `curl -sSL ${downloadBase}/install.sh | bash`,
    '```',
    '',
    '> ⚠️ 此为 PR 测试版本，约 24 小时后会被自动清理。',
  ].join('\n');

  console.log('🚀 Creating release...');
  const release = await github.createRelease(
    releaseOwner, releaseRepoName, tag, releaseName, releaseBody, true
  );
  console.log(`  ✓ Release created: ${release.html_url}\n`);

  // ---- 上传资产 ----
  console.log('📤 Uploading assets...');
  for (const asset of assets) {
    const data = readFileSync(asset.path);
    const uploaded = await github.uploadReleaseAsset(
      release.upload_url, asset.name, data, asset.contentType
    );
    console.log(`  ✓ ${asset.name} -> ${uploaded.browser_download_url}`);
  }

  console.log(`\n✅ Release published: ${release.html_url}`);

  // 输出供后续 job 使用
  setOutput('release_url', release.html_url);
  setOutput('release_tag', tag);
  setOutput('install_url', `${downloadBase}/install.sh`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
