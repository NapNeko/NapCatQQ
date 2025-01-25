import type { Selection } from '@react-types/shared'
import { useReactive } from 'ahooks'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import useWebSocket from 'react-use-websocket'
import { ReadyState } from 'react-use-websocket'

import { renderFilterMessageType } from '@/components/onebot/filter_message_type'

import { isOB11Event, isOB11RequestResponse } from '@/utils/onebot'

import type { AllOB11WsResponse } from '@/types/onebot'

export { ReadyState } from 'react-use-websocket'
export function useWebSocketDebug(url: string, token: string) {
  const messageHistory = useReactive<AllOB11WsResponse[]>([])
  const [filterTypes, setFilterTypes] = useState<Selection>('all')

  const filteredMessages = messageHistory.filter((msg) => {
    if (filterTypes === 'all' || filterTypes.size === 0) return true
    if (isOB11Event(msg)) return filterTypes.has(msg.post_type)
    if (isOB11RequestResponse(msg)) return filterTypes.has('request')
  })

  const { sendMessage, readyState } = useWebSocket(url, {
    onMessage: useCallback((event: WebSocketEventMap['message']) => {
      try {
        const data = JSON.parse(event.data)
        messageHistory.unshift(data)
      } catch (error) {
        toast.error('WebSocket 消息解析失败')
      }
    }, []),
    queryParams: {
      access_token: token
    },
    onError: (event) => {
      toast.error('WebSocket 连接失败')
      console.error('WebSocket error:', event)
    },
    onOpen: () => {
      messageHistory.splice(0, messageHistory.length)
    }
  })

  const _sendMessage = (msg: string) => {
    if (readyState !== ReadyState.OPEN) {
      throw new Error('WebSocket 连接未建立')
    }
    sendMessage(msg)
  }

  const FilterMessagesType = renderFilterMessageType(
    filterTypes,
    setFilterTypes
  )

  return {
    sendMessage: _sendMessage,
    readyState,
    messageHistory,
    filteredMessages,
    filterTypes,
    setFilterTypes,
    FilterMessagesType
  }
}
