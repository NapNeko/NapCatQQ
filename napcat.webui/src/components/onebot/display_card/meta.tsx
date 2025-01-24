import { Chip } from '@heroui/chip'

import { getLifecycleColor, getLifecycleName } from '@/utils/onebot'

import type {
  OB11Meta,
  OneBot11Heartbeat,
  OneBot11Lifecycle
} from '@/types/onebot'

export interface OneBotDisplayMetaProps {
  data: OB11Meta
}

export interface OneBotDisplayMetaHeartbeatProps {
  data: OneBot11Heartbeat
}

export interface OneBotDisplayMetaLifecycleProps {
  data: OneBot11Lifecycle
}

const OneBotDisplayMetaHeartbeat: React.FC<OneBotDisplayMetaHeartbeatProps> = ({
  data
}) => {
  return (
    <div className="flex gap-2">
      <Chip>心跳</Chip>
      <Chip>间隔 {data.status.interval}ms</Chip>
    </div>
  )
}

const OneBotDisplayMetaLifecycle: React.FC<OneBotDisplayMetaLifecycleProps> = ({
  data
}) => {
  return (
    <div className="flex gap-2">
      <Chip>生命周期</Chip>
      <Chip color={getLifecycleColor(data.sub_type)}>
        {getLifecycleName(data.sub_type)}
      </Chip>
    </div>
  )
}

const OneBotDisplayMeta: React.FC<OneBotDisplayMetaProps> = ({ data }) => {
  return (
    <div className="h-full flex items-center">
      {data.meta_event_type === 'lifecycle' && (
        <OneBotDisplayMetaLifecycle data={data} />
      )}
      {data.meta_event_type === 'heartbeat' && (
        <OneBotDisplayMetaHeartbeat data={data} />
      )}
    </div>
  )
}

export default OneBotDisplayMeta
