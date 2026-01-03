import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SemVer 2.0 正则表达式
 * 格式: 主版本号.次版本号.修订号[-先行版本号][+版本编译信息]
 * 参考: https://semver.org/lang/zh-CN/
 */
const SEMVER_REGEX = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Validate version format according to SemVer 2.0 specification
 * @param {string} version - The version string to validate (with or without 'v' prefix)
 * @returns {{ valid: boolean, normalized: string, major: number, minor: number, patch: number, prerelease: string|null, buildmetadata: string|null }}
 */
function validateVersion (version) {
  if (!version || typeof version !== 'string') {
    return { valid: false, normalized: '1.0.0-dev', major: 1, minor: 0, patch: 0, prerelease: 'dev', buildmetadata: null };
  }

  const match = version.trim().match(SEMVER_REGEX);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    const patch = parseInt(match[3], 10);
    const prerelease = match[4] || null;
    const buildmetadata = match[5] || null;

    // 构建标准化版本号（不带 v 前缀）
    let normalized = `${major}.${minor}.${patch}`;
    if (prerelease) normalized += `-${prerelease}`;
    if (buildmetadata) normalized += `+${buildmetadata}`;

    return { valid: true, normalized, major, minor, patch, prerelease, buildmetadata };
  }
  return { valid: false, normalized: '1.0.0-dev', major: 1, minor: 0, patch: 0, prerelease: 'dev', buildmetadata: null };
}

/**
 * NapCat Vite Plugin: fetches latest GitHub tag (not release) and injects into import.meta.env
 * 
 * 版本号来源优先级:
 * 1. 环境变量 NAPCAT_VERSION (用于 CI 构建)
 * 2. 缓存的 GitHub tag
 * 3. 从 GitHub API 获取最新 tag
 * 4. 兆底版本号: 1.0.0-dev
 */
export default function vitePluginNapcatVersion () {
  const pluginDir = path.resolve(__dirname, 'dist');
  const cacheFile = path.join(pluginDir, '.napcat-version.json');
  const owner = 'NapNeko';
  const repo = 'NapCatQQ';
  const maxAgeMs = 24 * 60 * 60 * 1000; // cache 1 day
  const githubToken = process.env.GITHUB_TOKEN;
  // CI 构建时可通过环境变量直接指定版本号
  const envVersion = process.env.NAPCAT_VERSION;
  const fallbackVersion = '1.0.0-dev';

  fs.mkdirSync(pluginDir, { recursive: true });

  function readCache () {
    try {
      const stat = fs.statSync(cacheFile);
      if (Date.now() - stat.mtimeMs < maxAgeMs) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (data?.tag) return data.tag;
      }
    } catch { }
    return null;
  }

  function writeCache (tag) {
    try {
      fs.writeFileSync(
        cacheFile,
        JSON.stringify({ tag, time: new Date().toISOString() }, null, 2)
      );
    } catch { }
  }

  async function fetchLatestTag () {
    const url = `https://api.github.com/repos/${owner}/${repo}/tags`;
    return new Promise((resolve, reject) => {
      const req = https.get(
        url,
        {
          headers: {
            'User-Agent': 'vite-plugin-napcat-version',
            Accept: 'application/vnd.github.v3+json',
            ...(githubToken ? { Authorization: `token ${githubToken}` } : {}),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (Array.isArray(json) && json[0]?.name) {
                const tagName = json[0].name;
                const { valid, normalized } = validateVersion(tagName);
                if (valid) {
                  resolve(normalized);
                } else {
                  console.warn(`[vite-plugin-napcat-version] Invalid tag format: ${tagName}, expected vX.X.X`);
                  reject(new Error(`Invalid tag format: ${tagName}, expected vX.X.X`));
                }
              } else reject(new Error('Invalid GitHub tag response'));
            } catch (e) {
              reject(e);
            }
          });
        }
      );
      req.on('error', reject);
    });
  }

  async function getVersion () {
    // 优先使用环境变量指定的版本号 (CI 构建)
    if (envVersion) {
      const { valid, normalized } = validateVersion(envVersion);
      if (valid) {
        console.log(`[vite-plugin-napcat-version] Using version from NAPCAT_VERSION env: ${normalized}`);
        return normalized;
      } else {
        console.warn(`[vite-plugin-napcat-version] Invalid NAPCAT_VERSION format: ${envVersion}, falling back to fetch`);
      }
    }

    const cached = readCache();
    if (cached) return cached;
    try {
      const tag = await fetchLatestTag();
      writeCache(tag);
      return tag;
    } catch (e) {
      console.warn('[vite-plugin-napcat-version] Failed to fetch tag:', e.message);
      return cached ?? fallbackVersion;
    }
  }

  let lastTag = null;

  return {
    name: 'vite-plugin-napcat-version',
    enforce: 'pre',

    async config (userConfig) {
      const tag = await getVersion();
      console.log(`[vite-plugin-napcat-version] Using version: ${tag}`);
      lastTag = tag;
      return {
        define: {
          ...(userConfig.define || {}),
          'import.meta.env.VITE_NAPCAT_VERSION': JSON.stringify(tag),
        },
      };
    },

    handleHotUpdate (ctx) {
      if (path.resolve(ctx.file) === cacheFile) {
        try {
          const json = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          const tag = json?.tag;
          if (tag && tag !== lastTag) {
            lastTag = tag;
            ctx.server?.ws.send({ type: 'full-reload' });
          }
        } catch { }
      }
    },
  };
}

// Export validateVersion for external use
export { validateVersion };
