import { Image } from '@heroui/image'
import qface from 'qface'
import { FaReply } from 'react-icons/fa6'

import { OB11Segment } from '@/types/onebot'

export const renderMessageContent = (
  segments: OB11Segment[],
  small = false
): React.ReactElement[] => {
  return segments.map((segment, index) => {
    switch (segment.type) {
      case 'text':
        return <span key={index}>{segment.data.text}</span>
      case 'face':
        return (
          <Image
            removeWrapper
            classNames={{
              img: 'w-6 h-6 inline !text-[0px] m-0 -mt-1.5 !p-0'
            }}
            key={index}
            src={qface.getUrl(segment.data.id)}
            alt={`face-${segment.data.id}`}
          />
        )
      case 'image':
        return (
          <Image
            classNames={{
              wrapper: 'block !text-[0px] !m-0 !p-0',
              img: 'block'
            }}
            radius="sm"
            className={
              small
                ? 'max-h-16 object-cover'
                : 'max-w-64 max-h-96 h-auto object-cover'
            }
            key={index}
            src={segment.data.url || segment.data.file}
            alt="image"
            referrerPolicy="no-referrer"
          />
        )
      case 'record':
        return (
          <audio
            key={index}
            controls
            src={segment.data.url || segment.data.file}
          />
        )
      case 'video':
        return (
          <video
            key={index}
            controls
            src={segment.data.url || segment.data.file}
          />
        )
      case 'at':
        return (
          <span key={index} className="text-blue-500">
            @
            {segment.data.qq === 'all' ? (
              '所有人'
            ) : (
              <span>
                {segment.data.name}({segment.data.qq})
              </span>
            )}
          </span>
        )
      case 'rps':
        return <span key={index}>[猜拳]</span>
      case 'dice':
        return <span key={index}>[掷骰子]</span>
      case 'shake':
        return <span key={index}>[窗口抖动]</span>
      case 'poke':
        return (
          <span key={index}>
            [戳一戳: {segment.data.name || segment.data.id}]
          </span>
        )
      case 'anonymous':
        return <span key={index}>[匿名消息]</span>
      case 'share':
        return (
          <a
            key={index}
            href={segment.data.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {segment.data.title}
          </a>
        )
      case 'contact':
        return (
          <span key={index}>
            [推荐{segment.data.type === 'qq' ? '好友' : '群'}: {segment.data.id}
            ]
          </span>
        )
      case 'location':
        return <span key={index}>[位置: {segment.data.title || '未知'}]</span>
      case 'music':
        if (segment.data.type === 'custom') {
          return (
            <a
              key={index}
              href={segment.data.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {segment.data.title}
            </a>
          )
        }
        return (
          <span key={index}>
            [音乐: {segment.data.type} - {segment.data.id}]
          </span>
        )
      case 'reply':
        return (
          <div
            key={index}
            className="bg-content3 py-1 px-2 rounded-md flex items-center gap-1"
          >
            <FaReply className="text-default-500" />
            回复消息ID: {segment.data.id}
          </div>
        )
      case 'forward':
        return <span key={index}>[合并转发: {segment.data.id}]</span>
      case 'node':
        return <span key={index}>[消息节点]</span>
      case 'xml':
        return <pre key={index}>{segment.data.data}</pre>
      case 'json':
        return (
          <pre key={index} className="break-all whitespace-break-spaces">
            {segment.data.data}
          </pre>
        )
      case 'file':
        return (
          <a
            key={index}
            href={segment.data.file}
            target="_blank"
            rel="noopener noreferrer"
          >
            [文件]
          </a>
        )
      default:
        return <span key={index}>[不支持的消息类型]</span>
    }
  })
}
