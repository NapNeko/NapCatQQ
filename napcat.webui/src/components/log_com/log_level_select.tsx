import { Chip } from '@heroui/chip'
import { Select, SelectItem } from '@heroui/select'
import { SharedSelection } from '@heroui/system'
import type { Selection } from '@react-types/shared'

import { LogLevel } from '@/const/enum'

export interface LogLevelSelectProps {
  selectedKeys: Selection
  onSelectionChange: (keys: SharedSelection) => void
}
const logLevelColor: {
  [key in LogLevel]:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'primary'
} = {
  [LogLevel.DEBUG]: 'default',
  [LogLevel.INFO]: 'primary',
  [LogLevel.WARN]: 'warning',
  [LogLevel.ERROR]: 'primary',
  [LogLevel.FATAL]: 'primary'
}
const LogLevelSelect = (props: LogLevelSelectProps) => {
  const { selectedKeys, onSelectionChange } = props
  return (
    <Select
      selectedKeys={selectedKeys}
      onSelectionChange={(selectedKeys) => {
        if (selectedKeys !== 'all' && selectedKeys?.size === 0) {
          selectedKeys = 'all'
        }
        onSelectionChange(selectedKeys)
      }}
      label="日志级别"
      selectionMode="multiple"
      aria-label="Log Level"
      classNames={{
        label: 'mb-2',
        trigger: 'bg-opacity-50 backdrop-blur-sm hover:!bg-opacity-60',
        popoverContent: 'bg-opacity-50 backdrop-blur-sm'
      }}
      size="sm"
      items={[
        { label: 'Debug', value: LogLevel.DEBUG },
        { label: 'Info', value: LogLevel.INFO },
        { label: 'Warn', value: LogLevel.WARN },
        { label: 'Error', value: LogLevel.ERROR },
        { label: 'Fatal', value: LogLevel.FATAL }
      ]}
      renderValue={(value) => {
        if (value.length === 5) {
          return (
            <Chip size="sm" color="primary" variant="flat">
              全部
            </Chip>
          )
        }
        return (
          <div className="flex gap-2">
            {value.map((v) => (
              <Chip
                size="sm"
                key={v.key}
                color={logLevelColor[v.data?.value as LogLevel]}
                variant="flat"
              >
                {v.data?.label}
              </Chip>
            ))}
          </div>
        )
      }}
    >
      {(item) => (
        <SelectItem key={item.value} value={item.value}>
          {item.label}
        </SelectItem>
      )}
    </Select>
  )
}

export default LogLevelSelect
