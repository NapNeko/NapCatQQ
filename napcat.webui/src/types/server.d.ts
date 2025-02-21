interface ServerResponse<T> {
  code: number
  data: T
  message: string
}

interface AuthResponse {
  Credential: string
}

interface LoginListItem {
  uin: string
  uid: string
  nickName: string
  faceUrl: string
  facePath: string
  loginType: 1 // 1是二维码登录？
  isQuickLogin: boolean // 是否可以快速登录
  isAutoLogin: boolean // 是否可以自动登录
}

interface PackageInfo {
  name: string
  version: string
  private: boolean
  type: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

interface SystemStatus {
  cpu: {
    core: number
    model: string
    speed: string
    usage: {
      system: string
      qq: string
    }
  }
  memory: {
    total: string
    usage: {
      system: string
      qq: string
    }
  }
  arch: string
}

interface ThemeConfigItem {
  '--heroui-background': string
  '--heroui-foreground-50': string
  '--heroui-foreground-100': string
  '--heroui-foreground-200': string
  '--heroui-foreground-300': string
  '--heroui-foreground-400': string
  '--heroui-foreground-500': string
  '--heroui-foreground-600': string
  '--heroui-foreground-700': string
  '--heroui-foreground-800': string
  '--heroui-foreground-900': string
  '--heroui-foreground': string
  '--heroui-focus': string
  '--heroui-overlay': string
  '--heroui-divider': string
  '--heroui-divider-opacity': string
  '--heroui-content1': string
  '--heroui-content1-foreground': string
  '--heroui-content2': string
  '--heroui-content2-foreground': string
  '--heroui-content3': string
  '--heroui-content3-foreground': string
  '--heroui-content4': string
  '--heroui-content4-foreground': string
  '--heroui-default-50': string
  '--heroui-default-100': string
  '--heroui-default-200': string
  '--heroui-default-300': string
  '--heroui-default-400': string
  '--heroui-default-500': string
  '--heroui-default-600': string
  '--heroui-default-700': string
  '--heroui-default-800': string
  '--heroui-default-900': string
  '--heroui-default-foreground': string
  '--heroui-default': string
  // 新增 danger
  '--heroui-danger-50': string
  '--heroui-danger-100': string
  '--heroui-danger-200': string
  '--heroui-danger-300': string
  '--heroui-danger-400': string
  '--heroui-danger-500': string
  '--heroui-danger-600': string
  '--heroui-danger-700': string
  '--heroui-danger-800': string
  '--heroui-danger-900': string
  '--heroui-danger-foreground': string
  '--heroui-danger': string
  // 新增 primary
  '--heroui-primary-50': string
  '--heroui-primary-100': string
  '--heroui-primary-200': string
  '--heroui-primary-300': string
  '--heroui-primary-400': string
  '--heroui-primary-500': string
  '--heroui-primary-600': string
  '--heroui-primary-700': string
  '--heroui-primary-800': string
  '--heroui-primary-900': string
  '--heroui-primary-foreground': string
  '--heroui-primary': string
  // 新增 secondary
  '--heroui-secondary-50': string
  '--heroui-secondary-100': string
  '--heroui-secondary-200': string
  '--heroui-secondary-300': string
  '--heroui-secondary-400': string
  '--heroui-secondary-500': string
  '--heroui-secondary-600': string
  '--heroui-secondary-700': string
  '--heroui-secondary-800': string
  '--heroui-secondary-900': string
  '--heroui-secondary-foreground': string
  '--heroui-secondary': string
  // 新增 success
  '--heroui-success-50': string
  '--heroui-success-100': string
  '--heroui-success-200': string
  '--heroui-success-300': string
  '--heroui-success-400': string
  '--heroui-success-500': string
  '--heroui-success-600': string
  '--heroui-success-700': string
  '--heroui-success-800': string
  '--heroui-success-900': string
  '--heroui-success-foreground': string
  '--heroui-success': string
  // 新增 warning
  '--heroui-warning-50': string
  '--heroui-warning-100': string
  '--heroui-warning-200': string
  '--heroui-warning-300': string
  '--heroui-warning-400': string
  '--heroui-warning-500': string
  '--heroui-warning-600': string
  '--heroui-warning-700': string
  '--heroui-warning-800': string
  '--heroui-warning-900': string
  '--heroui-warning-foreground': string
  '--heroui-warning': string
  // 其它配置
  '--heroui-code-background': string
  '--heroui-strong': string
  '--heroui-code-mdx': string
  '--heroui-divider-weight': string
  '--heroui-disabled-opacity': string
  '--heroui-font-size-tiny': string
  '--heroui-font-size-small': string
  '--heroui-font-size-medium': string
  '--heroui-font-size-large': string
  '--heroui-line-height-tiny': string
  '--heroui-line-height-small': string
  '--heroui-line-height-medium': string
  '--heroui-line-height-large': string
  '--heroui-radius-small': string
  '--heroui-radius-medium': string
  '--heroui-radius-large': string
  '--heroui-border-width-small': string
  '--heroui-border-width-medium': string
  '--heroui-border-width-large': string
  '--heroui-box-shadow-small': string
  '--heroui-box-shadow-medium': string
  '--heroui-box-shadow-large': string
  '--heroui-hover-opacity': string
}

interface ThemeConfig {
  dark: ThemeConfigItem
  light: ThemeConfigItem
}
