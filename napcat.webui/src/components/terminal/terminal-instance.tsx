import { useEffect, useRef } from 'react'

import TerminalManager from '@/controllers/terminal_manager'

import XTerm, { XTermRef } from '../xterm'

interface TerminalInstanceProps {
  id: string
}

export function TerminalInstance({ id }: TerminalInstanceProps) {
  const termRef = useRef<XTermRef>(null)

  useEffect(() => {
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

    TerminalManager.connectTerminal(id, handleData)

    return () => {
      TerminalManager.disconnectTerminal(id, handleData)
    }
  }, [id])

  const handleInput = (data: string) => {
    TerminalManager.sendInput(id, data)
  }

  return <XTerm ref={termRef} onInput={handleInput} className="w-full h-full" />
}
