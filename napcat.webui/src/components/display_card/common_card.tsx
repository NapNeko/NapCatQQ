import { Button, ButtonGroup } from '@heroui/button'
import { Switch } from '@heroui/switch'
import { useState } from 'react'
import { CgDebug } from 'react-icons/cg'
import { FiEdit3 } from 'react-icons/fi'
import { MdDeleteForever } from 'react-icons/md'

import DisplayCardContainer from './container'

type NetworkType = OneBotConfig['network']

export type NetworkDisplayCardFields<T extends keyof NetworkType> = Array<{
  label: string
  value: NetworkType[T][0][keyof NetworkType[T][0]]
  render?: (
    value: NetworkType[T][0][keyof NetworkType[T][0]]
  ) => React.ReactNode
}>

export interface NetworkDisplayCardProps<T extends keyof NetworkType> {
  data: NetworkType[T][0]
  showType?: boolean
  typeLabel: string
  fields: NetworkDisplayCardFields<T>
  onEdit: () => void
  onEnable: () => Promise<void>
  onDelete: () => Promise<void>
  onEnableDebug: () => Promise<void>
}

const NetworkDisplayCard = <T extends keyof NetworkType>({
  data,
  showType,
  typeLabel,
  fields,
  onEdit,
  onEnable,
  onDelete,
  onEnableDebug
}: NetworkDisplayCardProps<T>) => {
  const { name, enable, debug } = data
  const [editing, setEditing] = useState(false)

  const handleEnable = () => {
    setEditing(true)
    onEnable().finally(() => setEditing(false))
  }

  const handleDelete = () => {
    setEditing(true)
    onDelete().finally(() => setEditing(false))
  }

  const handleEnableDebug = () => {
    setEditing(true)
    onEnableDebug().finally(() => setEditing(false))
  }

  return (
    <DisplayCardContainer
      action={
        <ButtonGroup
          fullWidth
          isDisabled={editing}
          radius="full"
          size="sm"
          variant="shadow"
        >
          <Button color="warning" startContent={<FiEdit3 />} onPress={onEdit}>
            编辑
          </Button>

          <Button
            color={debug ? 'success' : 'default'}
            startContent={<CgDebug />}
            onPress={handleEnableDebug}
          >
            {debug ? '关闭调试' : '开启调试'}
          </Button>
          <Button
            color="primary"
            startContent={<MdDeleteForever />}
            onPress={handleDelete}
          >
            删除
          </Button>
        </ButtonGroup>
      }
      enableSwitch={
        <Switch
          isDisabled={editing}
          isSelected={enable}
          onChange={handleEnable}
        />
      }
      tag={showType && typeLabel}
      title={name}
    >
      <div className="grid grid-cols-2 gap-1">
        {fields.map((field, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 ${
              field.label === 'URL' ? 'col-span-2' : ''
            }`}
          >
            <span className="text-default-400">{field.label}</span>
            {field.render ? (
              field.render(field.value)
            ) : (
              <span>{field.value}</span>
            )}
          </div>
        ))}
      </div>
    </DisplayCardContainer>
  )
}

export default NetworkDisplayCard
