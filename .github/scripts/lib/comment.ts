/**
 * 构建状态评论模板
 */

export const COMMENT_MARKER = '<!-- napcat-pr-build -->';
export const DOCKER_COMMENT_MARKER = '<!-- napcat-pr-docker -->';

// 默认代理前缀（加速中国大陆访问 GitHub Release）
export const PROXY_BASE = 'https://nclatest.znin.net';

export type BuildStatus = 'success' | 'failure' | 'cancelled' | 'pending' | 'unknown';

export interface BuildTarget {
  name: string;
  status: BuildStatus;
  error?: string;
  downloadUrl?: string;  // Artifact 直接下载链接
}

// ============== 辅助函数 ==============

function formatSha (sha: string): string {
  return sha && sha.length >= 7 ? sha.substring(0, 7) : sha || 'unknown';
}

function escapeCodeBlock (text: string): string {
  // 替换 ``` 为转义形式，避免破坏 Markdown 代码块
  return text.replace(/```/g, '\\`\\`\\`');
}

function getTimeString (): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

// ============== 状态图标 ==============

export function getStatusIcon (status: BuildStatus): string {
  switch (status) {
    case 'success':
      return '✅ 成功';
    case 'pending':
      return '⏳ 构建中...';
    case 'cancelled':
      return '⚪ 已取消';
    case 'failure':
      return '❌ 失败';
    default:
      return '❓ 未知';
  }
}

function getStatusEmoji (status: BuildStatus): string {
  switch (status) {
    case 'success': return '✅';
    case 'pending': return '⏳';
    case 'cancelled': return '⚪';
    case 'failure': return '❌';
    default: return '❓';
  }
}

// ============== 构建中评论 ==============

export function generateBuildingComment (prSha: string, targets: string[]): string {
  const time = getTimeString();
  const shortSha = formatSha(prSha);

  const lines: string[] = [
    COMMENT_MARKER,
    '',
    '<div align="center">',
    '',
    '# 🔨 NapCat 构建中',
    '',
    '![Building](https://img.shields.io/badge/状态-构建中-yellow?style=for-the-badge&logo=github-actions&logoColor=white)',
    '',
    '</div>',
    '',
    '---',
    '',
    '## 📦 构建目标',
    '',
    '| 包名 | 状态 | 说明 |',
    '| :--- | :---: | :--- |',
    ...targets.map(name => `| \`${name}\` | ⏳ | 正在构建... |`),
    '',
    '---',
    '',
    '## 📋 构建信息',
    '',
    '| 项目 | 值 |',
    '| :--- | :--- |',
    `| 📝 提交 | \`${shortSha}\` |`,
    `| 🕐 开始时间 | ${time} |`,
    '',
    '---',
    '',
    '<div align="center">',
    '',
    '> ⏳ **构建进行中，请稍候...**',
    '>',
    '> 构建完成后将自动更新此评论',
    '',
    '</div>',
  ];

  return lines.join('\n');
}

// ============== 构建结果评论 ==============

export interface InstallInfo {
  installUrl: string;
  releaseUrl: string;
}

export function generateResultComment (
  targets: BuildTarget[],
  prSha: string,
  runId: string,
  repository: string,
  version?: string,
  installInfo?: InstallInfo,
  publishFailed?: boolean
): string {
  const runUrl = `https://github.com/${repository}/actions/runs/${runId}`;
  const shortSha = formatSha(prSha);
  const time = getTimeString();

  const allSuccess = targets.every(t => t.status === 'success');
  const anyCancelled = targets.some(t => t.status === 'cancelled');
  const anyFailure = targets.some(t => t.status === 'failure');

  // 状态徽章
  let statusBadge: string;
  let headerTitle: string;
  if (allSuccess) {
    statusBadge = '![Success](https://img.shields.io/badge/状态-构建成功-success?style=for-the-badge&logo=github-actions&logoColor=white)';
    headerTitle = '# ✅ NapCat 构建成功';
  } else if (anyCancelled && !anyFailure) {
    statusBadge = '![Cancelled](https://img.shields.io/badge/状态-已取消-lightgrey?style=for-the-badge&logo=github-actions&logoColor=white)';
    headerTitle = '# ⚪ NapCat 构建已取消';
  } else {
    statusBadge = '![Failed](https://img.shields.io/badge/状态-构建失败-critical?style=for-the-badge&logo=github-actions&logoColor=white)';
    headerTitle = '# ❌ NapCat 构建失败';
  }

  const downloadLink = (target: BuildTarget) => {
    if (target.status !== 'success') return '—';
    if (target.downloadUrl) {
      return `[📥 下载](${target.downloadUrl})`;
    }
    return `[📥 下载](${runUrl}#artifacts)`;
  };

  const lines: string[] = [
    COMMENT_MARKER,
    '',
    '<div align="center">',
    '',
    headerTitle,
    '',
    statusBadge,
    '',
    '</div>',
    '',
    '---',
    '',
    '## 📦 构建产物',
    '',
    '| 包名 | 状态 | 下载 |',
    '| :--- | :---: | :---: |',
    ...targets.map(t => `| \`${t.name}\` | ${getStatusEmoji(t.status)} ${t.status === 'success' ? '成功' : t.status === 'failure' ? '失败' : t.status === 'cancelled' ? '已取消' : '未知'} | ${downloadLink(t)} |`),
    '',
    '---',
    '',
    '## 📋 构建信息',
    '',
    '| 项目 | 值 |',
    '| :--- | :--- |',
    ...(version ? [`| 🏷️ 版本号 | \`${version}\` |`] : []),
    `| 📝 提交 | \`${shortSha}\` |`,
    `| 🔗 构建日志 | [查看详情](${runUrl}) |`,
    `| 🕐 完成时间 | ${time} |`,
  ];

  // 添加快速安装命令
  if (installInfo) {
    const proxyInstallUrl = installInfo.installUrl.replace('https://github.com', PROXY_BASE);
    lines.push(
      '',
      '---',
      '',
      '## 🚀 快速安装 (Linux)',
      '',
      '```bash',
      `curl -sSL ${proxyInstallUrl} | bash`,
      '```',
      '',
      `> 📦 [查看 Release 页面](${installInfo.releaseUrl})`,
      '> ⚠️ 此为 PR 测试版本，约 5 天后会被自动清理。'
    );
  } else if (publishFailed) {
    lines.push(
      '',
      '---',
      '',
      '## ⚠️ Release 发布失败',
      '',
      '> ❌ PR Release 发布过程中出现错误，无法提供快速安装命令。',
      `> 🔗 [查看构建日志](${runUrl}) 了解详情。`
    );
  }

  // 添加错误详情
  const failedTargets = targets.filter(t => t.status === 'failure' && t.error);
  if (failedTargets.length > 0) {
    lines.push('', '---', '', '## ⚠️ 错误详情', '');
    for (const target of failedTargets) {
      lines.push(
        '<details>',
        `<summary>🔴 <b>${target.name}</b> 构建错误</summary>`,
        '',
        '```',
        escapeCodeBlock(target.error!),
        '```',
        '',
        '</details>',
        ''
      );
    }
  }

  // 添加底部提示
  lines.push('---', '');
  if (allSuccess) {
    lines.push(
      '<div align="center">',
      '',
      '> 🎉 **所有构建均已成功完成！**',
      '>',
      '> 点击上方下载链接获取构建产物进行测试',
      '',
      '</div>'
    );
  } else if (anyCancelled && !anyFailure) {
    lines.push(
      '<div align="center">',
      '',
      '> ⚪ **构建已被取消**',
      '>',
      '> 可能是由于新的提交触发了新的构建',
      '',
      '</div>'
    );
  } else {
    lines.push(
      '<div align="center">',
      '',
      '> ⚠️ **部分构建失败**',
      '>',
      '> 请查看上方错误详情或点击构建日志查看完整输出',
      '',
      '</div>'
    );
  }

  return lines.join('\n');
}

// ============== Docker 构建评论 ==============

export function generateDockerBuildingComment (prNumber: string, prSha: string): string {
  const time = getTimeString();
  const shortSha = formatSha(prSha);

  const lines: string[] = [
    DOCKER_COMMENT_MARKER,
    '',
    '<div align="center">',
    '',
    '# 🐳 Docker 测试镜像构建中',
    '',
    '![Building](https://img.shields.io/badge/Docker-构建中-yellow?style=for-the-badge&logo=docker&logoColor=white)',
    '',
    '</div>',
    '',
    '---',
    '',
    '## 📋 构建信息',
    '',
    '| 项目 | 值 |',
    '| :--- | :--- |',
    `| 📝 提交 | \`${shortSha}\` |`,
    `| 🔗 PR | #${prNumber} |`,
    `| 🕐 触发时间 | ${time} |`,
    '',
    '---',
    '',
    '<div align="center">',
    '',
    '> ⏳ **Docker 镜像正在构建中，请稍候...**',
    '>',
    '> 构建完成后将自动更新此评论',
    '',
    '</div>',
  ];

  return lines.join('\n');
}

export function generateDockerResultComment (
  prNumber: string,
  prSha: string,
  success: boolean,
  dockerImage?: string,
  error?: string
): string {
  const time = getTimeString();
  const shortSha = formatSha(prSha);

  const statusBadge = success
    ? '![Success](https://img.shields.io/badge/Docker-构建成功-success?style=for-the-badge&logo=docker&logoColor=white)'
    : '![Failed](https://img.shields.io/badge/Docker-构建失败-critical?style=for-the-badge&logo=docker&logoColor=white)';
  const headerTitle = success ? '# ✅ Docker 测试镜像就绪' : '# ❌ Docker 测试镜像构建失败';

  const lines: string[] = [
    DOCKER_COMMENT_MARKER,
    '',
    '<div align="center">',
    '',
    headerTitle,
    '',
    statusBadge,
    '',
    '</div>',
    '',
    '---',
    '',
    '## 📋 构建信息',
    '',
    '| 项目 | 值 |',
    '| :--- | :--- |',
    `| 📝 提交 | \`${shortSha}\` |`,
    `| 🔗 PR | #${prNumber} |`,
    `| 🕐 完成时间 | ${time} |`,
  ];

  if (success && dockerImage) {
    lines.push(
      '',
      '---',
      '',
      '## 🚀 快速使用',
      '',
      '```bash',
      `docker pull ${dockerImage}`,
      '```',
      '',
      '> ⚠️ 此为 PR 测试镜像，保留 5 天后自动清理。'
    );
  }

  if (!success && error) {
    lines.push(
      '',
      '---',
      '',
      '<details>',
      '<summary>🔴 <b>错误详情</b></summary>',
      '',
      '```',
      escapeCodeBlock(error),
      '```',
      '',
      '</details>'
    );
  }

  lines.push('', '---', '');
  if (success) {
    lines.push(
      '<div align="center">',
      '',
      '> 🎉 **Docker 测试镜像已就绪！**',
      '>',
      '> 使用上方命令拉取镜像进行测试',
      '',
      '</div>'
    );
  } else {
    lines.push(
      '<div align="center">',
      '',
      '> ⚠️ **Docker 镜像构建失败**',
      '>',
      '> 请检查错误详情',
      '',
      '</div>'
    );
  }

  return lines.join('\n');
}
