import { EventSourcePolyfill } from 'event-source-polyfill'

import { LogLevel } from '@/const/enum'

import { serverRequest } from '@/utils/request'

export interface Log {
  level: LogLevel
  message: string
}

export interface TerminalSession {
  id: string
}

export interface TerminalInfo {
  id: string
}

export default class WebUIManager {
  public static async checkWebUiLogined() {
    const { data } =
      await serverRequest.post<ServerResponse<boolean>>('/auth/check')
    return data.data
  }

  public static async loginWithToken(token: string) {
    const { data } = await serverRequest.post<ServerResponse<AuthResponse>>(
      '/auth/login',
      { token }
    )
    return data.data.Credential
  }

  public static async changePassword(oldToken: string, newToken: string) {
    const { data } = await serverRequest.post<ServerResponse<boolean>>(
      '/auth/update_token',
      { oldToken, newToken }
    )
    return data.data
  }

  public static async proxy<T>(url = '') {
    const data = await serverRequest.get<ServerResponse<string>>(
      '/base/proxy?url=' + encodeURIComponent(url)
    )
    data.data.data = JSON.parse(data.data.data)
    return data.data as ServerResponse<T>
  }

  public static async getPackageInfo() {
    const { data } =
      await serverRequest.get<ServerResponse<PackageInfo>>('/base/PackageInfo')
    return data.data
  }

  public static async getQQVersion() {
    const { data } =
      await serverRequest.get<ServerResponse<string>>('/base/QQVersion')
    return data.data
  }

  public static async getLogList() {
    const { data } =
      await serverRequest.get<ServerResponse<string[]>>('/Log/GetLogList')
    return data.data
  }

  public static async getLogContent(logName: string) {
    const { data } = await serverRequest.get<ServerResponse<string>>(
      `/Log/GetLog?id=${logName}`
    )
    return data.data
  }

  public static getRealTimeLogs(writer: (data: Log[]) => void) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未登录')
    }
    const _token = JSON.parse(token)
    const eventSource = new EventSourcePolyfill('/api/Log/GetLogRealTime', {
      headers: {
        Authorization: `Bearer ${_token}`,
        Accept: 'text/event-stream'
      },
      withCredentials: true
    })

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        data.message = data.message.replace(/\n/g, '\r\n')
        writer([data])
      } catch (error) {
        console.error(error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE连接出错:', error)
      eventSource.close()
    }

    return eventSource
  }

  public static getSystemStatus(writer: (data: SystemStatus) => void) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未登录')
    }
    const _token = JSON.parse(token)
    const eventSource = new EventSourcePolyfill(
      '/api/base/GetSysStatusRealTime',
      {
        headers: {
          Authorization: `Bearer ${_token}`,
          Accept: 'text/event-stream'
        },
        withCredentials: true
      }
    )

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SystemStatus
        writer(data)
      } catch (error) {
        console.error(error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE连接出错:', error)
      eventSource.close()
    }

    return eventSource
  }
}
