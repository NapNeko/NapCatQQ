import { Chip } from '@nextui-org/chip'
import { Button, ButtonGroup } from '@nextui-org/button'
import { useState } from 'react'
import { Switch } from '@nextui-org/switch'
import { FiEdit3 } from 'react-icons/fi'
import { CgDebug } from 'react-icons/cg'
import { MdDeleteForever } from 'react-icons/md'

import DisplayCardContainer from './container'
interface WebsocketServerDisplayCardProps {
  data: OneBotConfig['network']['websocketServers'][0]
  onEdit: () => void
  onEnable: () => Promise<void>
  onDelete: () => Promise<void>
  onEnableDebug: () => Promise<void>
}

const WebsocketServerDisplayCard: React.FC<WebsocketServerDisplayCardProps> = ({
  data,
  onEdit,
  onEnable,
  onDelete,
  onEnableDebug
}) => {
  const {
    name,
    host,
    port,
    enable,
    debug,
    reportSelfMessage,
    enableForcePushEvent,
    heartInterval,
    messagePostFormat
  } = data
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
          <Button color="warning" startContent={<FiEdit3 />} onClick={onEdit}>
            编辑
          </Button>

          <Button
            color={debug ? 'success' : 'default'}
            startContent={<CgDebug />}
            onClick={handleEnableDebug}
          >
            {debug ? '关闭调试' : '开启调试'}
          </Button>
          <Button
            color="danger"
            startContent={<MdDeleteForever />}
            onClick={handleDelete}
          >
            删除
          </Button>
        </ButtonGroup>
      }
      enableSwitch={
        <Switch
          isDisabled={editing}
          isSelected={enable}
          onClick={handleEnable}
        />
      }
      title={name}
    >
      <div className="grid grid-cols-2 gap-1">
        <div className="flex items-center gap-2">
          <span className="text-default-400">主机</span>
          <span>{host}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-default-400">端口</span>
          <span>{port}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-default-400">心跳间隔</span>
          <span>{heartInterval}ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-default-400">消息格式</span>
          <span>{messagePostFormat}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-default-400">上报自身消息</span>
          <Chip
            color={reportSelfMessage ? 'success' : 'default'}
            size="sm"
            variant="flat"
          >
            {reportSelfMessage ? '是' : '否'}
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-default-400">强制推送事件</span>
          <Chip
            color={enableForcePushEvent ? 'success' : 'default'}
            size="sm"
            variant="flat"
          >
            {enableForcePushEvent ? '是' : '否'}
          </Chip>
        </div>
      </div>
    </DisplayCardContainer>
  )
}

export default WebsocketServerDisplayCard
