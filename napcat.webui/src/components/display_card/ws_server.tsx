import { Chip } from '@heroui/chip'

import NetworkDisplayCard from './common_card'
import type { NetworkDisplayCardFields } from './common_card'

interface WebsocketServerDisplayCardProps {
  data: OneBotConfig['network']['websocketServers'][0]
  showType?: boolean
  onEdit: () => void
  onEnable: () => Promise<void>
  onDelete: () => Promise<void>
  onEnableDebug: () => Promise<void>
}

const WebsocketServerDisplayCard: React.FC<WebsocketServerDisplayCardProps> = (
  props
) => {
  const { data, showType, onEdit, onEnable, onDelete, onEnableDebug } = props
  const {
    host,
    port,
    heartInterval,
    messagePostFormat,
    reportSelfMessage,
    enableForcePushEvent
  } = data

  const fields: NetworkDisplayCardFields<'websocketServers'> = [
    { label: '主机', value: host },
    { label: '端口', value: port },
    { label: '心跳间隔', value: `${heartInterval}ms` },
    { label: '消息格式', value: messagePostFormat },
    {
      label: '上报自身消息',
      value: reportSelfMessage,
      render: (value) => (
        <Chip color={value ? 'success' : 'default'} size="sm" variant="flat">
          {value ? '是' : '否'}
        </Chip>
      )
    },
    {
      label: '强制推送事件',
      value: enableForcePushEvent,
      render: (value) => (
        <Chip color={value ? 'success' : 'default'} size="sm" variant="flat">
          {value ? '是' : '否'}
        </Chip>
      )
    }
  ]

  return (
    <NetworkDisplayCard
      data={data}
      showType={showType}
      typeLabel="Websocket服务器"
      fields={fields}
      onEdit={onEdit}
      onEnable={onEnable}
      onDelete={onDelete}
      onEnableDebug={onEnableDebug}
    />
  )
}

export default WebsocketServerDisplayCard
