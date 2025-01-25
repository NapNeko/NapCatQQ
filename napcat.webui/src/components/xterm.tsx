import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { WebglAddon } from '@xterm/addon-webgl'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import clsx from 'clsx'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { useTheme } from '@/hooks/use-theme'

import { gradientText } from '@/utils/terminal'

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
}
const XTerm = forwardRef<XTermRef, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const domRef = useRef<HTMLDivElement>(null)
    const terminalRef = useRef<Terminal | null>(null)
    const { className, ...rest } = props
    const { theme } = useTheme()
    useEffect(() => {
      if (!domRef.current) {
        return
      }
      const terminal = new Terminal({
        allowTransparency: true,
        fontFamily: '"Fira Code", "Harmony", "Noto Serif SC", monospace'
      })
      terminalRef.current = terminal
      const fitAddon = new FitAddon()
      terminal.loadAddon(new WebLinksAddon())
      terminal.loadAddon(fitAddon)
      terminal.loadAddon(new WebglAddon())
      terminal.open(domRef.current)
      fitAddon.fit()

      terminal.writeln(
        gradientText(
          'Welcome to NapCat WebUI',
          [255, 0, 0],
          [0, 255, 0],
          true,
          true,
          true
        )
      )

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit()
      })
      resizeObserver.observe(domRef.current)

      const handleFontLoad = () => {
        terminal.refresh(0, terminal.rows - 1)
      }
      document.fonts.addEventListener('loadingdone', handleFontLoad)

      return () => {
        resizeObserver.disconnect()
        document.fonts.removeEventListener('loadingdone', handleFontLoad)
        setTimeout(() => {
          terminal.dispose()
        }, 0)
      }
    }, [])

    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.options.theme = {
          background:
            theme === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)',
          foreground: theme === 'dark' ? '#fff' : '#000',
          selectionBackground: theme === 'dark' ? '#666' : '#ddd',
          cursor: theme === 'dark' ? '#fff' : '#000',
          cursorAccent: theme === 'dark' ? '#000' : '#fff',
          black: theme === 'dark' ? '#fff' : '#000'
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
        }
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
  }
)

export default XTerm
