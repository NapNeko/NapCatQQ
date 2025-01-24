import { Chip } from '@heroui/chip'

import NetworkDisplayCard from './common_card'
import type { NetworkDisplayCardFields } from './common_card'

interface HTTPClientDisplayCardProps {
  data: OneBotConfig['network']['httpClients'][0]
  showType?: boolean
  onEdit: () => void
  onEnable: () => Promise<void>
  onDelete: () => Promise<void>
  onEnableDebug: () => Promise<void>
}

const HTTPClientDisplayCard: React.FC<HTTPClientDisplayCardProps> = (props) => {
  const { data, showType, onEdit, onEnable, onDelete, onEnableDebug } = props
  const { url, reportSelfMessage, messagePostFormat } = data

  const fields: NetworkDisplayCardFields<'httpClients'> = [
    { label: 'URL', value: url },
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
      typeLabel="HTTP客户端"
      fields={fields}
      onEdit={onEdit}
      onEnable={onEnable}
      onDelete={onDelete}
      onEnableDebug={onEnableDebug}
    />
  )
}

export default HTTPClientDisplayCard
