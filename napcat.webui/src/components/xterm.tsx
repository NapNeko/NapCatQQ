import { CanvasAddon } from '@xterm/addon-canvas'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
// import { WebglAddon } from '@xterm/addon-webgl'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import clsx from 'clsx'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { useTheme } from '@/hooks/use-theme'

export type XTermRef = {
  write: (
    ...args: Parameters<Terminal['write']>
  ) => ReturnType<Terminal['write']>
  writeAsync: (data: Parameters<Terminal['write']>[0]) => Promise<void>
  writeln: (
    ...args: Parameters<Terminal['writeln']>
  ) => ReturnType<Terminal['writeln']>
  writelnAsync: (data: Parameters<Terminal['writeln']>[0]) => Promise<void>
  clear: () => void
  terminalRef: React.RefObject<Terminal | null>
}

export interface XTermProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onInput' | 'onResize'> {
  onInput?: (data: string) => void
  onKey?: (key: string, event: KeyboardEvent) => void
  onResize?: (cols: number, rows: number) => void // 新增属性
}

const XTerm = forwardRef<XTermRef, XTermProps>((props, ref) => {
  const domRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const { className, onInput, onKey, onResize, ...rest } = props
  const { theme } = useTheme()
  useEffect(() => {
    const terminal = new Terminal({
      allowTransparency: true,
      fontFamily:
        '"JetBrains Mono", "Aa偷吃可爱长大的", "Noto Serif SC", monospace',
      cursorInactiveStyle: 'outline',
      drawBoldTextInBrightColors: false,
      fontSize: 14,
      lineHeight: 1.2
    })
    terminalRef.current = terminal
    const fitAddon = new FitAddon()
    terminal.loadAddon(
      new WebLinksAddon((event, uri) => {
        if (event.ctrlKey || event.metaKey) {
          window.open(uri, '_blank')
        }
      })
    )
    terminal.loadAddon(fitAddon)
    terminal.open(domRef.current!)

    terminal.loadAddon(new CanvasAddon())
    terminal.onData((data) => {
      if (onInput) {
        onInput(data)
      }
    })

    terminal.onKey((event) => {
      if (onKey) {
        onKey(event.key, event.domEvent)
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
      // 获取当前终端尺寸
      const cols = terminal.cols
      const rows = terminal.rows
      if (onResize) {
        onResize(cols, rows)
      }
    })

    // 字体加载完成后重新调整终端大小
    document.fonts.ready.then(() => {
      fitAddon.fit()

      resizeObserver.observe(domRef.current!)
    })

    return () => {
      resizeObserver.disconnect()
      setTimeout(() => {
        terminal.dispose()
      }, 0)
    }
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      if (theme === 'dark') {
        terminalRef.current.options.theme = {
          background: '#00000000',
          black: '#ffffff',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5',
          foreground: '#cccccc',
          selectionBackground: '#3a3d41',
          cursor: '#ffffff'
        }
      } else {
        terminalRef.current.options.theme = {
          background: '#ffffff00',
          black: '#000000',
          red: '#aa3731',
          green: '#448c27',
          yellow: '#cb9000',
          blue: '#325cc0',
          cyan: '#0083b2',
          white: '#7f7f7f',
          brightBlack: '#777777',
          brightRed: '#f05050',
          brightGreen: '#60cb00',
          brightYellow: '#ffbc5d',
          brightBlue: '#007acc',
          brightCyan: '#00aacb',
          brightWhite: '#b0b0b0',
          foreground: '#000000',
          selectionBackground: '#bfdbfe',
          cursor: '#007acc'
        }
      }
    }
  }, [theme])

  useImperativeHandle(
    ref,
    () => ({
      write: (...args) => {
        return terminalRef.current?.write(...args)
      },
      writeAsync: async (data) => {
        return new Promise((resolve) => {
          terminalRef.current?.write(data, resolve)
        })
      },
      writeln: (...args) => {
        return terminalRef.current?.writeln(...args)
      },
      writelnAsync: async (data) => {
        return new Promise((resolve) => {
          terminalRef.current?.writeln(data, resolve)
        })
      },
      clear: () => {
        terminalRef.current?.clear()
      },
      terminalRef: terminalRef
    }),
    []
  )

  return (
    <div
      className={clsx(
        'p-2 rounded-md shadow-sm border border-default-200 w-full h-full overflow-hidden bg-opacity-50 backdrop-blur-sm',
        theme === 'dark' ? 'bg-black' : 'bg-white',
        className
      )}
      {...rest}
    >
      <div
        style={{
          width: '100%',
          height: '100%'
        }}
        ref={domRef}
      ></div>
    </div>
  )
})

export default XTerm
