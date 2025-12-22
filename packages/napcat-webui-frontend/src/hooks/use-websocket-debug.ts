import type { Selection } from '@react-types/shared';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { renderFilterMessageType } from '@/components/onebot/filter_message_type';

import { isOB11Event, isOB11RequestResponse } from '@/utils/onebot';

import type { AllOB11WsResponse } from '@/types/onebot';

export { ReadyState } from 'react-use-websocket';
export function useWebSocketDebug (url: string, token: string, connectOnMount: boolean = true) {
  const [messageHistory, setMessageHistory] = useState<AllOB11WsResponse[]>([]);
  const [filterTypes, setFilterTypes] = useState<Selection>('all');

  const filteredMessages = messageHistory.filter((msg) => {
    if (filterTypes === 'all' || filterTypes.size === 0) return true;
    if (isOB11Event(msg)) return filterTypes.has(msg.post_type);
    if (isOB11RequestResponse(msg)) return filterTypes.has('request');
    return false;
  });

  const { sendMessage, readyState } = useWebSocket(connectOnMount ? url : null, {
    share: false,
    onMessage: useCallback((event: WebSocketEventMap['message']) => {
      try {
        const data = JSON.parse(event.data);
        setMessageHistory((prev) => {
          const newHistory = [data, ...prev];
          if (newHistory.length > 500) {
            return newHistory.slice(0, 500);
          }
          return newHistory;
        });
      } catch (_error) {
        toast.error('WebSocket 消息解析失败');
      }
    }, []),
    queryParams: {
      access_token: token,
    },
    onError: (event) => {
      toast.error('WebSocket 连接失败');
      console.error('WebSocket error:', event);
    },
    onOpen: () => {
      setMessageHistory([]);
    },
  });

  const _sendMessage = (msg: string) => {
    if (readyState !== ReadyState.OPEN) {
      throw new Error('WebSocket 连接未建立');
    }
    sendMessage(msg);
  };

  const clearMessages = useCallback(() => {
    setMessageHistory([]);
  }, []);

  const FilterMessagesType = renderFilterMessageType(
    filterTypes,
    setFilterTypes
  );

  return {
    sendMessage: _sendMessage,
    readyState,
    messageHistory,
    filteredMessages,
    filterTypes,
    setFilterTypes,
    FilterMessagesType,
    clearMessages,
  };
}
