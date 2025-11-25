import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * NapCat Vite Plugin: fetches latest GitHub tag (not release) and injects into import.meta.env
 */
export default function vitePluginNapcatVersion () {
  const pluginDir = path.resolve(__dirname, 'dist');
  const cacheFile = path.join(pluginDir, '.napcat-version.json');
  const owner = 'NapNeko';
  const repo = 'NapCatQQ';
  const maxAgeMs = 24 * 60 * 60 * 1000; // cache 1 day
  const githubToken = process.env.GITHUB_TOKEN;

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
                resolve(json[0].name.replace(/^v/, ''));
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
    const cached = readCache();
    if (cached) return cached;
    try {
      const tag = await fetchLatestTag();
      writeCache(tag);
      return tag;
    } catch (e) {
      console.warn('[vite-plugin-napcat-version] Failed to fetch tag:', e.message);
      return cached ?? '0.0.0';
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
