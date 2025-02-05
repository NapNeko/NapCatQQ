import clsx from 'clsx'
import { ReadyState } from 'react-use-websocket'

export interface WSStatusProps {
  state: ReadyState
}

function StatusTag({
  title,
  color
}: {
  title: string
  color: 'success' | 'primary' | 'warning'
}) {
  const textClassName = `text-${color} text-sm`
  const bgClassName = `bg-${color}`
  return (
    <div className="flex flex-col justify-center items-center gap-1 rounded-md px-2 col-span-2 md:col-span-1">
      <div className={clsx('w-4 h-4 rounded-full', bgClassName)}></div>
      <div className={textClassName}>{title}</div>
    </div>
  )
}

export default function WSStatus({ state }: WSStatusProps) {
  if (state === ReadyState.OPEN) {
    return <StatusTag title="已连接" color="success" />
  }
  if (state === ReadyState.CLOSED) {
    return <StatusTag title="已关闭" color="primary" />
  }
  if (state === ReadyState.CONNECTING) {
    return <StatusTag title="连接中" color="warning" />
  }
  if (state === ReadyState.CLOSING) {
    return <StatusTag title="关闭中" color="warning" />
  }
  return null
}
