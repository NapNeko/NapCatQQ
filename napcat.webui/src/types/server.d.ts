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
