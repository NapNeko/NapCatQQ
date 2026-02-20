import key from '@/const/key';

/**
 * 将后端返回的插件 icon 路径拼接上 webui_token 查询参数
 * 后端 /api/Plugin/Icon/:pluginId 需要鉴权，img src 无法携带 Authorization header，
 * 所以通过 query 参数传递 token
 */
export function getPluginIconUrl (iconPath?: string): string | undefined {
  if (!iconPath) return undefined;
  try {
    const raw = localStorage.getItem(key.token);
    if (!raw) return iconPath;
    const token = JSON.parse(raw);
    const url = new URL(iconPath, window.location.origin);
    url.searchParams.set('webui_token', token);
    return url.pathname + url.search;
  } catch {
    return iconPath;
  }
}
