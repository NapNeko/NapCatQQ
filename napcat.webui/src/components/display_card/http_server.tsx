import { Chip } from '@nextui-org/chip'
import { Button, ButtonGroup } from '@nextui-org/button'
import { useState } from 'react'
import { Switch } from '@nextui-org/switch'
import { FiEdit3 } from 'react-icons/fi'
import { CgDebug } from 'react-icons/cg'
import { MdDeleteForever } from 'react-icons/md'

import DisplayCardContainer, { DisplayCardProps } from './container'
interface HTTPServerDisplayCardProps extends DisplayCardProps {
  data: OneBotConfig['network']['httpServers'][0]
}

const HTTPServerDisplayCard: React.FC<HTTPServerDisplayCardProps> = ({
  data,
  showType,
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
    enableCors,
    enableWebsocket,
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
      tag={showType && 'HTTP服务器'}
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
          <span className="text-default-400">消息格式</span>
          <span>{messagePostFormat}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-default-400">CORS</span>
          <Chip
            color={enableCors ? 'success' : 'default'}
            size="sm"
            variant="flat"
          >
            {enableCors ? '已启用' : '未启用'}
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-default-400">WS</span>
          <Chip
            color={enableWebsocket ? 'success' : 'default'}
            size="sm"
            variant="flat"
          >
            {enableWebsocket ? '已启用' : '未启用'}
          </Chip>
        </div>
      </div>
    </DisplayCardContainer>
  )
}

export default HTTPServerDisplayCard
