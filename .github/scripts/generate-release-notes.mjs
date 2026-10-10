import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

function parseVersion (tag) {
  const match = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/.exec(tag);
  if (!match) return null;
  const prerelease = match[4]?.split('.') ?? [];
  if (prerelease.some(identifier => !identifier || /^0\d+$/.test(identifier))) return null;
  return { tag, numbers: match.slice(1, 4).map(BigInt), prerelease };
}

function compareVersions (left, right) {
  for (let index = 0; index < 3; index++) {
    if (left.numbers[index] !== right.numbers[index]) {
      return left.numbers[index] > right.numbers[index] ? 1 : -1;
    }
  }
  if (!left.prerelease.length || !right.prerelease.length) {
    return Number(!left.prerelease.length) - Number(!right.prerelease.length);
  }
  for (let index = 0; index < Math.min(left.prerelease.length, right.prerelease.length); index++) {
    const leftIdentifier = left.prerelease[index];
    const rightIdentifier = right.prerelease[index];
    if (leftIdentifier === rightIdentifier) continue;
    const leftNumeric = /^\d+$/.test(leftIdentifier);
    const rightNumeric = /^\d+$/.test(rightIdentifier);
    if (leftNumeric && rightNumeric) return BigInt(leftIdentifier) > BigInt(rightIdentifier) ? 1 : -1;
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return leftIdentifier > rightIdentifier ? 1 : -1;
  }
  return left.prerelease.length - right.prerelease.length;
}

function git (...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const [tag, repository, outputFile] = process.argv.slice(2);
const currentVersion = parseVersion(tag);
if (process.argv.length !== 5 || !currentVersion || !repository || !outputFile) {
  throw new Error('Usage: node generate-release-notes.mjs <vX.Y.Z[-prerelease]> <owner/repo> <output.md>');
}
if (git('rev-parse', '--is-shallow-repository') === 'true') {
  throw new Error('Release notes require complete Git history and tags (fetch-depth: 0)');
}

const currentRef = `refs/tags/${currentVersion.tag}`;
const previousVersion = git('tag', '--merged', currentRef)
  .split('\n')
  .map(parseVersion)
  .filter(version => version && compareVersions(version, currentVersion) < 0)
  .sort((left, right) => compareVersions(right, left))[0];
if (!previousVersion) throw new Error(`No preceding version tag is reachable from ${currentVersion.tag}`);

const commits = git('log', '--reverse', '--format=%H%x09%s', `refs/tags/${previousVersion.tag}..${currentRef}`);
const repositoryUrl = `https://github.com/${repository}`;
const changes = commits.split('\n').filter(Boolean).map(commit => {
  const separator = commit.indexOf('\t');
  const hash = commit.slice(0, separator);
  const subject = commit.slice(separator + 1).replace(/[\\`*_[\]<>]/g, '\\$&');
  return `- ${subject} ([${hash.slice(0, 8)}](${repositoryUrl}/commit/${hash}))`;
});
const notes = [
  `# NapCat ${currentVersion.tag}`,
  '',
  '[使用文档](https://napneko.github.io/) · [Shell 安装与兼容说明](https://napneko.github.io/guide/boot/Shell)',
  '',
  '## 更新',
  '',
  ...changes,
  ...(changes.length ? [] : ['此标签范围内没有新增提交。']),
  '',
  `[完整变更](${repositoryUrl}/compare/${previousVersion.tag}...${currentVersion.tag})`,
  '',
].join('\n');
writeFileSync(outputFile, notes, 'utf8');
console.log(`Generated release notes: ${previousVersion.tag}...${currentVersion.tag}`);
