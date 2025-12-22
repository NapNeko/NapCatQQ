import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import key from '@/const/key';

import OneBotMessageList from '@/components/onebot/message_list';
import OneBotSendModal from '@/components/onebot/send_modal';
import WSStatus from '@/components/onebot/ws_status';

import { useWebSocketDebug } from '@/hooks/use-websocket-debug';

export default function WSDebug () {
  const url = new URL(window.location.origin);
  url.port = '3001';
  url.protocol = 'ws:';
  const defaultWsUrl = url.href;
  const [socketConfig, setSocketConfig] = useLocalStorage(key.wsDebugConfig, {
    url: defaultWsUrl,
    token: '',
  });
  const [inputUrl, setInputUrl] = useState(socketConfig.url);
  const [inputToken, setInputToken] = useState(socketConfig.token);
  const [shouldConnect, setShouldConnect] = useState(false);

  const { sendMessage, readyState, FilterMessagesType, filteredMessages, clearMessages } =
    useWebSocketDebug(socketConfig.url, socketConfig.token, shouldConnect);

  const handleConnect = useCallback(() => {
    if (!inputUrl.startsWith('ws://') && !inputUrl.startsWith('wss://')) {
      toast.error('WebSocket URL 不合法');
      return;
    }
    setSocketConfig({
      url: inputUrl,
      token: inputToken,
    });
    setShouldConnect(true);
  }, [inputUrl, inputToken, setSocketConfig]);

  const handleDisconnect = useCallback(() => {
    setShouldConnect(false);
  }, []);

  return (
    <>
      <title>Websocket调试 - NapCat WebUI</title>
      <div className='h-[calc(100vh-4rem)] overflow-hidden flex flex-col'>
        <Card className='mx-2 mt-2 flex-shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm'>
          <CardBody className='gap-2'>
            <div className='grid gap-2 items-center md:grid-cols-5'>
              <Input
                className='col-span-2'
                label='WebSocket URL'
                type='text'
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder='输入 WebSocket URL'
              />
              <Input
                className='col-span-2'
                label='Token'
                type='text'
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder='输入 Token'
              />
              <div className='flex-shrink-0 flex gap-2 col-span-2 md:col-span-1'>
                <Button
                  onPress={shouldConnect ? handleDisconnect : handleConnect}
                  size='lg'
                  radius='full'
                  color={shouldConnect ? 'danger' : 'primary'}
                  className='w-full md:w-auto'
                >
                  {shouldConnect ? '断开' : '连接'}
                </Button>
              </div>
            </div>
            <div className='p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-white/20 transition-colors'>
              <div className='grid gap-2 md:grid-cols-5 items-center md:w-fit'>
                <WSStatus state={readyState} />
                <div className='md:w-64 max-w-full col-span-2'>
                  {FilterMessagesType}
                </div>
                <div className='flex gap-2 justify-end col-span-2 md:col-span-2'>
                  <Button
                    size='sm'
                    color='danger'
                    variant='flat'
                    onPress={clearMessages}
                  >
                    清空日志
                  </Button>
                  <OneBotSendModal sendMessage={sendMessage} />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className='flex-1 overflow-hidden'>
          <OneBotMessageList messages={filteredMessages} />
        </div>
      </div>
    </>
  );
}
