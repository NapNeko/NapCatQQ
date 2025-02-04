import { useEffect, useRef } from 'react'

import TerminalManager from '@/controllers/terminal_manager'

import XTerm, { XTermRef } from '../xterm'

interface TerminalInstanceProps {
  id: string
}

export function TerminalInstance({ id }: TerminalInstanceProps) {
  const termRef = useRef<XTermRef>(null)
  const connected = useRef(false)

  const handleData = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.data) {
        termRef.current?.write(parsed.data)
      }
    } catch (e) {
      termRef.current?.write(data)
    }
  }

  useEffect(() => {
    return () => {
      if (connected.current) {
        TerminalManager.disconnectTerminal(id, handleData)
      }
    }
  }, [id])

  const handleInput = (data: string) => {
    TerminalManager.sendInput(id, data)
  }

  const handleResize = (cols: number, rows: number) => {
    if (!connected.current) {
      connected.current = true
      console.log('instance', rows, cols)
      TerminalManager.connectTerminal(id, handleData, { rows, cols })
    } else {
      TerminalManager.sendResize(id, cols, rows)
    }
  }

  return (
    <XTerm
      ref={termRef}
      onInput={handleInput}
      onResize={handleResize} // 使用 fitAddon 改变后触发的 resize 回调
      className="w-full h-full"
    />
  )
}
