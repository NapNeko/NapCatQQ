import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Select, SelectItem } from '@heroui/select'
import type { Selection } from '@react-types/shared'
import { useEffect, useRef, useState } from 'react'

import { colorizeLogLevel } from '@/utils/terminal'

import PageLoading from '../page_loading'
import XTerm from '../xterm'
import type { XTermRef } from '../xterm'
import LogLevelSelect from './log_level_select'

export interface HistoryLogsProps {
  list: string[]
  onSelect: (name: string) => void
  selectedLog?: string
  refreshList: () => void
  refreshLog: () => void
  listLoading?: boolean
  logLoading?: boolean
  listError?: Error
  logContent?: string
}
const HistoryLogs: React.FC<HistoryLogsProps> = (props) => {
  const {
    list,
    onSelect,
    selectedLog,
    refreshList,
    refreshLog,
    listLoading,
    logContent,
    listError,
    logLoading
  } = props
  const Xterm = useRef<XTermRef>(null)

  const [logLevel, setLogLevel] = useState<Selection>(
    new Set(['info', 'warn', 'error'])
  )

  const logToColored = (log: string) => {
    const logs = log
      .split('\n')
      .map((line) => {
        const colored = colorizeLogLevel(line)
        return colored
      })
      .filter((log) => {
        if (logLevel === 'all') {
          return true
        }
        return logLevel.has(log.level)
      })
      .map((log) => log.content)
      .join('\r\n')
    return logs
  }

  const onDownloadLog = () => {
    if (!logContent) {
      return
    }
    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedLog}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!Xterm.current || !logContent) {
      return
    }
    Xterm.current.clear()
    const _logContent = logToColored(logContent)
    Xterm.current.write(_logContent + '\r\nnapcat@webui:~$ ')
  }, [logContent, logLevel])

  return (
    <>
      <title>历史日志 - NapCat WebUI</title>
      <Card className="max-w-full h-full bg-opacity-50 backdrop-blur-sm">
        <CardHeader className="flex-row justify-start gap-3">
          <Select
            label="选择日志"
            size="sm"
            isLoading={listLoading}
            errorMessage={listError?.message}
            classNames={{
              trigger:
                'hover:!bg-content3 bg-opacity-50 backdrop-blur-sm hover:!bg-opacity-60'
            }}
            placeholder="选择日志"
            onChange={(e) => {
              const value = e.target.value
              if (!value) {
                return
              }
              onSelect(value)
            }}
            selectedKeys={[selectedLog || '']}
            items={list.map((name) => ({
              value: name,
              label: name
            }))}
          >
            {(item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            )}
          </Select>
          <LogLevelSelect
            selectedKeys={logLevel}
            onSelectionChange={setLogLevel}
          />
          <Button className="flex-shrink-0" onPress={onDownloadLog}>
            下载日志
          </Button>
          <Button onPress={refreshList}>刷新列表</Button>
          <Button onPress={refreshLog}>刷新日志</Button>
        </CardHeader>
        <CardBody className="relative">
          <PageLoading loading={logLoading} />
          <XTerm className="w-full h-full" ref={Xterm} />
        </CardBody>
      </Card>
    </>
  )
}

export default HistoryLogs
