/**
 * 打开链接
 * @param url 链接地址
 * @param newTab 是否在新标签页打开
 */
export function openUrl(url: string, newTab = true) {
  if (newTab) {
    window.open(url)
  } else {
    window.location.href = url
  }
}
