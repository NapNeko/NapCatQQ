import { request } from './request';

const style = document.createElement('style');
document.head.appendChild(style);

// 用于主题配置页面实时预览字体的临时样式标签
const fontPreviewStyle = document.createElement('style');
fontPreviewStyle.id = 'font-preview-style';
document.head.appendChild(fontPreviewStyle);

export function loadTheme () {
  request('/files/theme.css?_t=' + Date.now())
    .then((res) => res.data)
    .then((css) => {
      style.innerHTML = css;
      // 清除预览样式，使用 theme.css 中的正式配置
      fontPreviewStyle.innerHTML = '';
      document.documentElement.style.removeProperty('--font-family-base');
    })
    .catch(() => {
      console.error('Failed to load theme.css');
    });
}

// 动态加载字体 CSS（用于预览）
const loadFontCSSForPreview = (mode: string) => {
  let css = '';

  if (mode === 'aacute') {
    css = `
@font-face {
  font-family: 'Aa偷吃可爱长大的';
  src: url('/webui/fonts/AaCute.woff') format('woff');
  font-display: swap;
}`;
  } else if (mode === 'custom') {
    css = `
@font-face {
  font-family: 'CustomFont';
  src: url('/webui/fonts/CustomFont.woff') format('woff');
  font-display: swap;
}`;
  }

  fontPreviewStyle.innerHTML = css;
};

export const colorKeys = [
  '--heroui-background',

  '--heroui-foreground-50',
  '--heroui-foreground-100',
  '--heroui-foreground-200',
  '--heroui-foreground-300',
  '--heroui-foreground-400',
  '--heroui-foreground-500',
  '--heroui-foreground-600',
  '--heroui-foreground-700',
  '--heroui-foreground-800',
  '--heroui-foreground-900',
  '--heroui-foreground',

  '--heroui-content1',
  '--heroui-content1-foreground',
  '--heroui-content2',
  '--heroui-content2-foreground',
  '--heroui-content3',
  '--heroui-content3-foreground',
  '--heroui-content4',
  '--heroui-content4-foreground',

  '--heroui-default-50',
  '--heroui-default-100',
  '--heroui-default-200',
  '--heroui-default-300',
  '--heroui-default-400',
  '--heroui-default-500',
  '--heroui-default-600',
  '--heroui-default-700',
  '--heroui-default-800',
  '--heroui-default-900',
  '--heroui-default-foreground',
  '--heroui-default',

  '--heroui-danger-50',
  '--heroui-danger-100',
  '--heroui-danger-200',
  '--heroui-danger-300',
  '--heroui-danger-400',
  '--heroui-danger-500',
  '--heroui-danger-600',
  '--heroui-danger-700',
  '--heroui-danger-800',
  '--heroui-danger-900',
  '--heroui-danger-foreground',
  '--heroui-danger',

  '--heroui-primary-50',
  '--heroui-primary-100',
  '--heroui-primary-200',
  '--heroui-primary-300',
  '--heroui-primary-400',
  '--heroui-primary-500',
  '--heroui-primary-600',
  '--heroui-primary-700',
  '--heroui-primary-800',
  '--heroui-primary-900',
  '--heroui-primary-foreground',
  '--heroui-primary',

  '--heroui-secondary-50',
  '--heroui-secondary-100',
  '--heroui-secondary-200',
  '--heroui-secondary-300',
  '--heroui-secondary-400',
  '--heroui-secondary-500',
  '--heroui-secondary-600',
  '--heroui-secondary-700',
  '--heroui-secondary-800',
  '--heroui-secondary-900',
  '--heroui-secondary-foreground',
  '--heroui-secondary',

  '--heroui-success-50',
  '--heroui-success-100',
  '--heroui-success-200',
  '--heroui-success-300',
  '--heroui-success-400',
  '--heroui-success-500',
  '--heroui-success-600',
  '--heroui-success-700',
  '--heroui-success-800',
  '--heroui-success-900',
  '--heroui-success-foreground',
  '--heroui-success',

  '--heroui-warning-50',
  '--heroui-warning-100',
  '--heroui-warning-200',
  '--heroui-warning-300',
  '--heroui-warning-400',
  '--heroui-warning-500',
  '--heroui-warning-600',
  '--heroui-warning-700',
  '--heroui-warning-800',
  '--heroui-warning-900',
  '--heroui-warning-foreground',
  '--heroui-warning',

  '--heroui-focus',
  '--heroui-overlay',
  '--heroui-divider',
  '--heroui-code-background',
  '--heroui-strong',
  '--heroui-code-mdx',
] as const;

export const generateTheme = (theme: ThemeConfig, validField?: string) => {
  let css = `:root ${validField ? `.${validField}` : ''}, .light ${validField ? `.${validField}` : ''}, [data-theme="light"] ${validField ? `.${validField}` : ''} {`;
  for (const key in theme.light) {
    const _key = key as keyof ThemeConfigItem;
    css += `${_key}: ${theme.light[_key]};`;
  }
  css += '}';
  css += `.dark ${validField ? `.${validField}` : ''}, [data-theme="dark"] ${validField ? `.${validField}` : ''} {`;
  for (const key in theme.dark) {
    const _key = key as keyof ThemeConfigItem;
    css += `${_key}: ${theme.dark[_key]};`;
  }
  css += '}';
  return css;
};

// 用于主题配置页面实时预览字体
export const applyFont = (mode: string) => {
  const root = document.documentElement;

  // 加载字体 CSS 用于预览
  loadFontCSSForPreview(mode);

  if (mode === 'aacute') {
    root.style.setProperty('--font-family-base', "'Aa偷吃可爱长大的', var(--font-family-fallbacks)", 'important');
  } else if (mode === 'custom') {
    root.style.setProperty('--font-family-base', "'CustomFont', var(--font-family-fallbacks)", 'important');
  } else {
    // system or default - restore default
    root.style.setProperty('--font-family-base', 'var(--font-family-fallbacks)', 'important');
  }
};

// 字体配置已通过 theme.css 加载，此函数仅用于兼容性保留
export const initFont = () => {
  // 字体现在由 theme.css 统一管理，无需单独初始化
};

// 保存主题后调用 loadTheme 会使用 theme.css 中的正式配置
// 此函数保留用于兼容性
export const updateFontCache = (_fontMode: string) => {
  // 不再需要缓存，字体配置已在 theme.css 中
};
