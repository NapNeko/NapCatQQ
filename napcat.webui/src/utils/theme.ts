import { request } from './request'

const style = document.createElement('style')
document.head.appendChild(style)

export function loadTheme() {
  request('/files/theme.css?_t=' + Date.now())
    .then((res) => res.data)
    .then((css) => {
      style.innerHTML = css
    })
    .catch(() => {
      console.error('Failed to load theme.css')
    })
}
