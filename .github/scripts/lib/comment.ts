/**
 * 构建状态评论模板
 */

export const COMMENT_MARKER = '<!-- napcat-pr-build -->';

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

// ============== 状态图标 ==============

export function getStatusIcon (status: BuildStatus): string {
  switch (status) {
    case 'success':
      return '✅ 成功';
    case 'pending':
      return '⏳ 构建中...';
    case 'cancelled':
      return '⚪ 已取消';
    default:
      return '❌ 失败';
  }
}

// ============== 构建中评论 ==============

export function generateBuildingComment (prSha: string, targets: string[]): string {
  const time = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const lines: string[] = [
    COMMENT_MARKER,
    '## 🔨 构建状态',
    '',
    '| 构建目标 | 状态 |',
    '| :--- | :--- |',
    ...targets.map(name => `| ${name} | ⏳ 构建中... |`),
    '',
    '---',
    '',
    `📝 **提交**: \`${formatSha(prSha)}\``,
    `🕐 **开始时间**: ${time}`,
    '',
    '> 构建进行中，请稍候...',
  ];

  return lines.join('\n');
}

// ============== 构建结果评论 ==============

export function generateResultComment (
  targets: BuildTarget[],
  prSha: string,
  runId: string,
  repository: string
): string {
  // 链接到 run 详情页，页面底部有 Artifacts 下载区域
  const runUrl = `https://github.com/${repository}/actions/runs/${runId}`;

  const allSuccess = targets.every(t => t.status === 'success');
  const anyCancelled = targets.some(t => t.status === 'cancelled');

  const headerIcon = allSuccess
    ? '✅ 构建成功'
    : anyCancelled
      ? '⚪ 构建已取消'
      : '❌ 构建失败';

  const downloadLink = (target: BuildTarget) => {
    if (target.status !== 'success') return '—';
    if (target.downloadUrl) {
      return `[📦 下载](${target.downloadUrl})`;
    }
    // 回退到 run 详情页
    return `[📦 下载](${runUrl}#artifacts)`;
  };

  const lines: string[] = [
    COMMENT_MARKER,
    `## ${headerIcon}`,
    '',
    '| 构建目标 | 状态 | 下载 |',
    '| :--- | :--- | :--- |',
    ...targets.map(t => `| ${t.name} | ${getStatusIcon(t.status)} | ${downloadLink(t)} |`),
    '',
    '---',
    '',
    `📝 **提交**: \`${formatSha(prSha)}\``,
    `🔗 **构建日志**: [查看详情](${runUrl})`,
  ];

  // 添加错误详情
  const failedTargets = targets.filter(t => t.status === 'failure' && t.error);
  if (failedTargets.length > 0) {
    lines.push('', '---', '', '## ⚠️ 错误详情');
    for (const target of failedTargets) {
      lines.push('', `### ${target.name} 构建错误`, '```', escapeCodeBlock(target.error!), '```');
    }
  }

  // 添加底部提示
  if (allSuccess) {
    lines.push('', '> 🎉 所有构建均已成功完成，可点击上方下载链接获取构建产物进行测试。');
  } else if (anyCancelled) {
    lines.push('', '> ⚪ 构建已被取消，可能是由于新的提交触发了新的构建。');
  } else {
    lines.push('', '> ⚠️ 部分构建失败，请查看上方错误详情或点击构建日志查看完整输出。');
  }

  return lines.join('\n');
}
