import { Chip } from '@heroui/chip'

import NetworkDisplayCard from './common_card'
import type { NetworkDisplayCardFields } from './common_card'

interface HTTPServerDisplayCardProps {
  data: OneBotConfig['network']['httpServers'][0]
  showType?: boolean
  onEdit: () => void
  onEnable: () => Promise<void>
  onDelete: () => Promise<void>
  onEnableDebug: () => Promise<void>
}

const HTTPServerDisplayCard: React.FC<HTTPServerDisplayCardProps> = (props) => {
  const { data, showType, onEdit, onEnable, onDelete, onEnableDebug } = props
  const { host, port, enableCors, enableWebsocket, messagePostFormat } = data

  const fields: NetworkDisplayCardFields<'httpServers'> = [
    { label: '主机', value: host },
    { label: '端口', value: port },
    { label: '消息格式', value: messagePostFormat },
    {
      label: 'CORS',
      value: enableCors,
      render: (value) => (
        <Chip color={value ? 'success' : 'default'} size="sm" variant="flat">
          {value ? '已启用' : '未启用'}
        </Chip>
      )
    },
    {
      label: 'WS',
      value: enableWebsocket,
      render: (value) => (
        <Chip color={value ? 'success' : 'default'} size="sm" variant="flat">
          {value ? '已启用' : '未启用'}
        </Chip>
      )
    }
  ]

  return (
    <NetworkDisplayCard
      data={data}
      showType={showType}
      typeLabel="HTTP服务器"
      fields={fields}
      onEdit={onEdit}
      onEnable={onEnable}
      onDelete={onDelete}
      onEnableDebug={onEnableDebug}
    />
  )
}

export default HTTPServerDisplayCard
