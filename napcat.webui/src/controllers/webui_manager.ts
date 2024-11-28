import { serverRequest } from '@/utils/request'

export default class WebUIManager {
  public static async checkWebUiLogined() {
    const data =
      await serverRequest.post<ServerResponse<boolean>>('/auth/check')

    return data.data.data
  }

  public static async loginWithToken(token: string) {
    const data = await serverRequest.post<ServerResponse<AuthResponse>>(
      '/auth/login',
      { token }
    )

    return data.data.data.Credential
  }
}
