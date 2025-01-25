import { Chip } from '@heroui/chip'

import NetworkDisplayCard from './common_card'
import type { NetworkDisplayCardFields } from './common_card'

interface WebsocketClientDisplayCardProps {
  data: OneBotConfig['network']['websocketClients'][0]
  showType?: boolean
  onEdit: () => void
  onEnable: () => Promise<void>
  onDelete: () => Promise<void>
  onEnableDebug: () => Promise<void>
}

const WebsocketClientDisplayCard: React.FC<WebsocketClientDisplayCardProps> = (
  props
) => {
  const { data, showType, onEdit, onEnable, onDelete, onEnableDebug } = props
  const {
    url,
    heartInterval,
    reconnectInterval,
    messagePostFormat,
    reportSelfMessage
  } = data

  const fields: NetworkDisplayCardFields<'websocketClients'> = [
    { label: 'URL', value: url },
    { label: '重连间隔', value: `${reconnectInterval}ms` },
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
    }
  ]

  return (
    <NetworkDisplayCard
      data={data}
      showType={showType}
      typeLabel="Websocket客户端"
      fields={fields}
      onEdit={onEdit}
      onEnable={onEnable}
      onDelete={onDelete}
      onEnableDebug={onEnableDebug}
    />
  )
}

export default WebsocketClientDisplayCard
