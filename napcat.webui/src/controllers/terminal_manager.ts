import { serverRequest } from '@/utils/request'

type TerminalCallback = (data: string) => void

interface TerminalConnection {
  ws: WebSocket
  callbacks: Set<TerminalCallback>
  isConnected: boolean
  buffer: string[] // 添加缓存数组
}

export interface TerminalSession {
  id: string
}

export interface TerminalInfo {
  id: string
}

class TerminalManager {
  private connections: Map<string, TerminalConnection> = new Map()
  private readonly MAX_BUFFER_SIZE = 1000 // 限制缓存大小

  async createTerminal(cols: number, rows: number): Promise<TerminalSession> {
    const { data } = await serverRequest.post<ServerResponse<TerminalSession>>(
      '/Log/terminal/create',
      { cols, rows }
    )
    return data.data
  }

  async closeTerminal(id: string): Promise<void> {
    await serverRequest.post(`/Log/terminal/${id}/close`)
  }

  async getTerminalList(): Promise<TerminalInfo[]> {
    const { data } =
      await serverRequest.get<ServerResponse<TerminalInfo[]>>(
        '/Log/terminal/list'
      )
    return data.data
  }

  connectTerminal(
    id: string,
    callback: TerminalCallback,
    config?: {
      cols?: number
      rows?: number
    }
  ): WebSocket {
    let conn = this.connections.get(id)
    const { cols = 80, rows = 24 } = config || {}
    if (!conn) {
      const url = new URL(window.location.href)
      url.protocol = url.protocol.replace('http', 'ws')
      url.pathname = `/api/ws/terminal`
      url.searchParams.set('id', id)
      const token = JSON.parse(localStorage.getItem('token') || '')
      if (!token) {
        throw new Error('No token found')
      }
      url.searchParams.set('token', token)
      const ws = new WebSocket(url.toString())
      conn = {
        ws,
        callbacks: new Set([callback]),
        isConnected: false,
        buffer: [] // 初始化缓存
      }

      ws.onmessage = (event) => {
        const data = event.data
        // 保存到缓存
        conn?.buffer.push(data)
        if ((conn?.buffer.length ?? 0) > this.MAX_BUFFER_SIZE) {
          conn?.buffer.shift()
        }
        conn?.callbacks.forEach((cb) => cb(data))
      }

      ws.onopen = () => {
        if (conn) conn.isConnected = true
        this.sendResize(id, cols, rows)
      }

      ws.onclose = () => {
        if (conn) conn.isConnected = false
      }

      this.connections.set(id, conn)
    } else {
      conn.callbacks.add(callback)
      // 恢复历史内容
      conn.buffer.forEach((data) => callback(data))
    }

    return conn.ws
  }

  disconnectTerminal(id: string, callback: TerminalCallback) {
    const conn = this.connections.get(id)
    if (!conn) return

    conn.callbacks.delete(callback)
  }

  removeTerminal(id: string) {
    const conn = this.connections.get(id)
    if (conn?.ws.readyState === WebSocket.OPEN) {
      conn.ws.close()
    }
    this.connections.delete(id)
  }

  sendInput(id: string, data: string) {
    const conn = this.connections.get(id)
    if (conn?.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify({ type: 'input', data }))
    }
  }

  sendResize(id: string, cols: number, rows: number) {
    const conn = this.connections.get(id)
    if (conn?.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify({ type: 'resize', cols, rows }))
    }
  }
}

const terminalManager = new TerminalManager()

export default terminalManager
