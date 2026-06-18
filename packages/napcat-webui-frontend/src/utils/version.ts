/**
 * SemVer 2.0 正则表达式
 * 格式: 主版本号.次版本号.修订号[-先行版本号][+版本编译信息]
 * 参考: https://semver.org/lang/zh-CN/
 */
const SEMVER_REGEX = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

interface SemVerInfo {
  valid: boolean;
  normalized: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  buildmetadata: string | null;
}

/**
 * 解析版本号
 * @param version 版本字符串
 * @returns SemVer 解析结果
 */
export const parseSemVer = (version: string | undefined | null): SemVerInfo => {
  if (!version || typeof version !== 'string') {
    return { valid: false, normalized: '1.0.0-dev', major: 1, minor: 0, patch: 0, prerelease: 'dev', buildmetadata: null };
  }

  const match = version.trim().match(SEMVER_REGEX);
  if (match) {
    const major = parseInt(match[1]!, 10);
    const minor = parseInt(match[2]!, 10);
    const patch = parseInt(match[3]!, 10);
    const prerelease = match[4] || null;
    const buildmetadata = match[5] || null;

    let normalized = `${major}.${minor}.${patch}`;
    if (prerelease) normalized += `-${prerelease}`;
    if (buildmetadata) normalized += `+${buildmetadata}`;

    return { valid: true, normalized, major, minor, patch, prerelease, buildmetadata };
  }
  return { valid: false, normalized: '1.0.0-dev', major: 1, minor: 0, patch: 0, prerelease: 'dev', buildmetadata: null };
};

/**
 * 版本号转为数字 (兼容旧代码)
 * @param version 版本号
 * @returns 版本号数字
 */
export const versionToNumber = (version: string): number => {
  const info = parseSemVer(version);
  return info.patch + info.minor * 100 + info.major * 10000;
};

/**
 * 比较版本号 (SemVer 2.0 规范)
 * @param version1 版本号1
 * @param version2 版本号2
 * @returns 比较结果
 * 0: 相等
 * 1: version1 > version2
 * -1: version1 < version2
 */
export const compareVersion = (version1: string, version2: string): -1 | 0 | 1 => {
  const a = parseSemVer(version1);
  const b = parseSemVer(version2);

  if (!a.valid || !b.valid) {
    return 0;
  }

  // 比较主版本号
  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  // 比较次版本号
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  // 比较修订号
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;

  // 有先行版本号的版本优先级较低
  if (a.prerelease && !b.prerelease) return -1;
  if (!a.prerelease && b.prerelease) return 1;

  // 两者都有先行版本号时，按规则比较
  if (a.prerelease && b.prerelease) {
    const aParts = a.prerelease.split('.');
    const bParts = b.prerelease.split('.');
    const len = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < len; i++) {
      const aPart = aParts[i];
      const bPart = bParts[i];

      if (aPart === undefined) return -1;
      if (bPart === undefined) return 1;

      const aNum = /^\d+$/.test(aPart) ? parseInt(aPart, 10) : NaN;
      const bNum = /^\d+$/.test(bPart) ? parseInt(bPart, 10) : NaN;

      // 数字 vs 数字
      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) return aNum > bNum ? 1 : -1;
        continue;
      }
      // 数字优先级低于字符串
      if (!isNaN(aNum)) return -1;
      if (!isNaN(bNum)) return 1;
      // 字符串 vs 字符串
      if (aPart !== bPart) return aPart > bPart ? 1 : -1;
    }
  }

  return 0;
};

/**
 * 判断是否有新版本可用
 * 只比较正式版本 (不带先行版本号的)
 * 当前版本是先行版本时，与相同基础版本的正式版相比认为需要更新
 * @param currentVersion 当前版本
 * @param latestVersion 最新版本 (release tag)
 * @returns 是否有新版本
 */
export const hasNewVersion = (currentVersion: string, latestVersion: string): boolean => {
  const current = parseSemVer(currentVersion);
  const latest = parseSemVer(latestVersion);

  if (!current.valid || !latest.valid) {
    return false;
  }

  // 使用 compareVersion 比较
  return compareVersion(latestVersion, currentVersion) > 0;
};
