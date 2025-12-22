import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { IoFlash, IoFlashOff } from 'react-icons/io5';

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
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

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
      <div className='h-[calc(100vh-4rem)] overflow-hidden flex flex-col p-2 md:p-4 gap-2 md:gap-4'>
        {/* Config Card */}
        <Card className={clsx(
          'flex-shrink-0 backdrop-blur-xl border shadow-sm',
          hasBackground
            ? 'bg-white/10 dark:bg-black/10 border-white/40 dark:border-white/10'
            : 'bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10'
        )}>
          <CardBody className='gap-3 p-3 md:p-4'>
            {/* Connection Config */}
            <div className='grid gap-3 items-end md:grid-cols-[1fr_1fr_auto]'>
              <Input
                label='WebSocket URL'
                type='text'
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder='输入 WebSocket URL'
                size='sm'
                variant='bordered'
                classNames={{
                  inputWrapper: clsx(
                    'backdrop-blur-sm border',
                    hasBackground
                      ? 'bg-white/10 border-white/20'
                      : 'bg-default-100/50 border-default-200/50'
                  ),
                  label: hasBackground ? 'text-white/80' : '',
                  input: hasBackground ? 'text-white placeholder:text-white/50' : '',
                }}
              />
              <Input
                label='Token'
                type='text'
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder='输入 Token (可选)'
                size='sm'
                variant='bordered'
                classNames={{
                  inputWrapper: clsx(
                    'backdrop-blur-sm border',
                    hasBackground
                      ? 'bg-white/10 border-white/20'
                      : 'bg-default-100/50 border-default-200/50'
                  ),
                  label: hasBackground ? 'text-white/80' : '',
                  input: hasBackground ? 'text-white placeholder:text-white/50' : '',
                }}
              />
              <Button
                onPress={shouldConnect ? handleDisconnect : handleConnect}
                size='md'
                radius='full'
                color={shouldConnect ? 'danger' : 'primary'}
                className='font-bold shadow-lg min-w-[100px]'
                startContent={shouldConnect ? <IoFlashOff /> : <IoFlash />}
              >
                {shouldConnect ? '断开' : '连接'}
              </Button>
            </div>

            {/* Status Bar */}
            <div className={clsx(
              'p-2.5 rounded-xl border transition-colors flex flex-col md:flex-row gap-3 md:items-center md:justify-between',
              hasBackground
                ? 'bg-white/10 border-white/20'
                : 'bg-white/50 dark:bg-white/5 border-white/20'
            )}>
              <div className='flex items-center gap-3 w-full md:w-auto'>
                <div className="flex-shrink-0">
                  <WSStatus state={readyState} />
                </div>
                <div className='flex-1 md:w-56 overflow-hidden'>
                  {FilterMessagesType}
                </div>
              </div>
              <div className='flex gap-2 justify-end w-full md:w-auto pt-1 md:pt-0 border-t border-white/5 md:border-t-0'>
                <Button
                  size='sm'
                  color='danger'
                  variant='flat'
                  radius='full'
                  className='font-medium'
                  onPress={clearMessages}
                >
                  清空日志
                </Button>
                <OneBotSendModal sendMessage={sendMessage} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Message List */}
        <div className={clsx(
          'flex-1 overflow-hidden rounded-2xl border backdrop-blur-xl',
          hasBackground
            ? 'bg-white/10 dark:bg-black/10 border-white/40 dark:border-white/10'
            : 'bg-white/60 dark:bg-black/40 border-white/40 dark:border-white/10'
        )}>
          <OneBotMessageList messages={filteredMessages} />
        </div>
      </div>
    </>
  );
}
