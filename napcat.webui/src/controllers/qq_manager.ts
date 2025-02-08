import { serverRequest } from '@/utils/request'

import { SelfInfo } from '@/types/user'

export default class QQManager {
  public static async getOB11Config() {
    const data = await serverRequest.post<ServerResponse<OneBotConfig>>(
      '/OB11Config/GetConfig'
    )

    return data.data.data
  }

  public static async setOB11Config(config: OneBotConfig) {
    await serverRequest.post<ServerResponse<null>>('/OB11Config/SetConfig', {
      config: JSON.stringify(config)
    })
  }

  public static async checkQQLoginStatus() {
    const data = await serverRequest.post<
      ServerResponse<{
        isLogin: string
        qrcodeurl: string
      }>
    >('/QQLogin/CheckLoginStatus')

    return data.data.data
  }

  public static async checkQQLoginStatusWithQrcode() {
    const data = await serverRequest.post<
      ServerResponse<{ qrcodeurl: string; isLogin: string }>
    >('/QQLogin/CheckLoginStatus')

    return data.data.data
  }

  public static async getQQLoginQrcode() {
    const data = await serverRequest.post<
      ServerResponse<{
        qrcode: string
      }>
    >('/QQLogin/GetQQLoginQrcode')

    return data.data.data.qrcode
  }

  public static async getQQQuickLoginList() {
    const data = await serverRequest.post<ServerResponse<string[]>>(
      '/QQLogin/GetQuickLoginList'
    )

    return data.data.data
  }

  public static async getQQQuickLoginListNew() {
    const data = await serverRequest.post<ServerResponse<LoginListItem[]>>(
      '/QQLogin/GetQuickLoginListNew'
    )
    return data.data.data
  }

  public static async setQuickLogin(uin: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/SetQuickLogin', {
      uin
    })
  }

  public static async getQQLoginInfo() {
    const data = await serverRequest.post<ServerResponse<SelfInfo>>(
      '/QQLogin/GetQQLoginInfo'
    )
    return data.data.data
  }

  public static async getQuickLoginQQ() {
    const { data } = await serverRequest.post<ServerResponse<string>>(
      '/QQLogin/GetQuickLoginQQ'
    )
    return data.data
  }

  public static async setQuickLoginQQ(uin: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/SetQuickLoginQQ', {
      uin
    })
  }
}
