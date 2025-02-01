import { useEffect, useRef } from 'react'

import WebUIManager from '@/controllers/webui_manager'

import XTerm, { XTermRef } from '../xterm'

interface TerminalInstanceProps {
  id: string
}

export function TerminalInstance({ id }: TerminalInstanceProps) {
  const termRef = useRef<XTermRef>(null)
  const wsRef = useRef<WebSocket>(null)

  useEffect(() => {
    const ws = WebUIManager.connectTerminal(id, (data) => {
      termRef.current?.write(data)
    })
    wsRef.current = ws

    // 添加连接状态监听
    ws.onopen = () => {
      console.log('Terminal connected:', id)
    }

    ws.onerror = (error) => {
      console.error('Terminal connection error:', error)
      termRef.current?.write(
        '\r\n\x1b[31mConnection error. Please try reconnecting.\x1b[0m\r\n'
      )
    }

    ws.onclose = () => {
      console.log('Terminal disconnected:', id)
      termRef.current?.write('\r\n\x1b[31mConnection closed.\x1b[0m\r\n')
    }

    return () => {
      ws.close()
    }
  }, [id])

  const handleInput = (data: string) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'input', data }))
      } catch (error) {
        console.error('Failed to send terminal input:', error)
      }
    } else {
      console.warn('WebSocket is not in OPEN state')
    }
  }

  return <XTerm ref={termRef} onInput={handleInput} className="h-full" />
}
