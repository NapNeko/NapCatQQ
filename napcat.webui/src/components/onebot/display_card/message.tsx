import { Avatar } from '@heroui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import clsx from 'clsx'

import { isOB11GroupMessage } from '@/utils/onebot'

import type {
  OB11GroupMessage,
  OB11Message,
  OB11PrivateMessage
} from '@/types/onebot'

import { renderMessageContent } from '../render_message'

export interface OneBotMessageProps {
  data: OB11Message
}

export interface OneBotMessageGroupProps {
  data: OB11GroupMessage
}

export interface OneBotMessagePrivateProps {
  data: OB11PrivateMessage
}

const MessageContent: React.FC<{ data: OB11Message }> = ({ data }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden flex-1">
      <div className="flex gap-2 items-center flex-shrink-0">
        <div className="font-bold">
          {isOB11GroupMessage(data) && data.sender.card && (
            <span className="mr-1">{data.sender.card}</span>
          )}
          <span
            className={clsx(
              isOB11GroupMessage(data) &&
                data.sender.card &&
                'text-default-400 font-normal'
            )}
          >
            {data.sender.nickname}
          </span>
        </div>
        <div>({data.sender.user_id})</div>
        <div className="text-sm">消息ID: {data.message_id}</div>
      </div>
      <Popover showArrow triggerScaleOnOpen={false}>
        <PopoverTrigger>
          <div className="flex-1 break-all overflow-hidden whitespace-pre-wrap border border-default-100 p-2 rounded-md hover:bg-content2 md:cursor-pointer transition-background relative group">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-default-300">
              点击查看完整消息
            </div>
            {Array.isArray(data.message)
              ? renderMessageContent(data.message, true)
              : data.raw_message}
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2">
            {Array.isArray(data.message)
              ? renderMessageContent(data.message)
              : data.raw_message}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

const OneBotMessageGroup: React.FC<OneBotMessageGroupProps> = ({ data }) => {
  return (
    <div className="h-full overflow-hidden flex flex-col w-full">
      <div className="flex items-center p-1 flex-shrink-0">
        <Avatar
          src={`https://p.qlogo.cn/gh/${data.group_id}/${data.group_id}/640/`}
          alt="群头像"
          size="sm"
          className="flex-shrink-0 mr-2"
        />
        <div>群 {data.group_id}</div>
      </div>
      <div className="flex items-start p-1 rounded-md h-full flex-1 border border-default-100">
        <Avatar
          src={`https://q1.qlogo.cn/g?b=qq&nk=${data.sender.user_id}&s=100`}
          alt="用户头像"
          size="md"
          className="flex-shrink-0 mr-2"
        />
        <MessageContent data={data} />
      </div>
    </div>
  )
}

const OneBotMessagePrivate: React.FC<OneBotMessagePrivateProps> = ({
  data
}) => {
  return (
    <div className="flex items-start p-2 rounded-md h-full flex-1">
      <Avatar
        src={`https://q1.qlogo.cn/g?b=qq&nk=${data.sender.user_id}&s=100`}
        alt="用户头像"
        size="md"
        className="flex-shrink-0 mr-2"
      />
      <MessageContent data={data} />
    </div>
  )
}

const OneBotMessage: React.FC<OneBotMessageProps> = ({ data }) => {
  if (data.message_type === 'group') {
    return <OneBotMessageGroup data={data} />
  } else if (data.message_type === 'private') {
    return <OneBotMessagePrivate data={data} />
  } else {
    return <div>未知消息类型</div>
  }
}

export default OneBotMessage
