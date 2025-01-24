import { useEffect, useRef, useState } from 'react'
import { VariableSizeList } from 'react-window'

import OneBotItemRender, {
  getItemSize
} from '@/components/onebot/display_card/render'

import { isOB11Event } from '@/utils/onebot'

import type { AllOB11WsResponse } from '@/types/onebot'

export interface OneBotMessageListProps {
  messages: AllOB11WsResponse[]
}

const OneBotMessageList: React.FC<OneBotMessageListProps> = (props) => {
  const { messages } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<VariableSizeList>(null)
  const [containerHeight, setContainerHeight] = useState(400)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight)
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true)
    }
  }, [messages])

  return (
    <div className="w-full h-full overflow-hidden" ref={containerRef}>
      <VariableSizeList
        ref={listRef}
        itemCount={messages.length}
        width="100%"
        style={{
          overflowX: 'hidden'
        }}
        itemSize={(idx) => {
          const msg = messages[idx]
          if (isOB11Event(msg)) {
            const size = getItemSize(msg.post_type)
            return size
          } else {
            return 100
          }
        }}
        height={containerHeight}
        itemData={messages}
        itemKey={(index) => messages.length - index - 1}
      >
        {OneBotItemRender}
      </VariableSizeList>
    </div>
  )
}

export default OneBotMessageList
