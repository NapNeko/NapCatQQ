import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { Input } from '@heroui/input'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import key from '@/const/key'

import OneBotMessageList from '@/components/onebot/message_list'
import OneBotSendModal from '@/components/onebot/send_modal'
import WSStatus from '@/components/onebot/ws_status'

import { useWebSocketDebug } from '@/hooks/use-websocket-debug'

export default function WSDebug() {
  const url = new URL(window.location.origin)
  url.port = '3001'
  url.protocol = 'ws:'
  const defaultWsUrl = url.href
  const [socketConfig, setSocketConfig] = useLocalStorage(key.wsDebugConfig, {
    url: defaultWsUrl,
    token: ''
  })
  const [inputUrl, setInputUrl] = useState(socketConfig.url)
  const [inputToken, setInputToken] = useState(socketConfig.token)

  const { sendMessage, readyState, FilterMessagesType, filteredMessages } =
    useWebSocketDebug(socketConfig.url, socketConfig.token)

  const handleConnect = useCallback(() => {
    if (!inputUrl.startsWith('ws://') && !inputUrl.startsWith('wss://')) {
      toast.error('WebSocket URL 不合法')
      return
    }
    setSocketConfig({
      url: inputUrl,
      token: inputToken
    })
  }, [inputUrl, inputToken])

  return (
    <>
      <title>Websocket调试 - NapCat WebUI</title>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
        <Card className="mx-2 mt-2 flex-shrink-0 bg-opacity-50 backdrop-blur-sm">
          <CardBody className="gap-2">
            <div className="grid gap-2 items-center md:grid-cols-5">
              <Input
                className="col-span-2"
                label="WebSocket URL"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="输入 WebSocket URL"
              />
              <Input
                className="col-span-2"
                label="Token"
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="输入 Token"
              />
              <div className="flex-shrink-0 flex gap-2 col-span-2 md:col-span-1">
                <Button
                  color="primary"
                  onPress={handleConnect}
                  size="lg"
                  radius="full"
                  className="w-full md:w-auto"
                >
                  连接
                </Button>
              </div>
            </div>
            <div className="p-2 border border-default-100 bg-content1 bg-opacity-50 rounded-md dark:bg-[rgb(30,30,30)]">
              <div className="grid gap-2 md:grid-cols-5 items-center md:w-fit">
                <WSStatus state={readyState} />
                <div className="md:w-64 max-w-full col-span-2">
                  {FilterMessagesType}
                </div>
                <OneBotSendModal sendMessage={sendMessage} />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex-1 overflow-hidden">
          <OneBotMessageList messages={filteredMessages} />
        </div>
      </div>
    </>
  )
}
