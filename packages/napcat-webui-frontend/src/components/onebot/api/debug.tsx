import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Snippet } from '@heroui/snippet';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoLink, IoSend, IoSettingsSharp } from 'react-icons/io5';
import { TbApi, TbCode } from 'react-icons/tb';

import key from '@/const/key';
import { OneBotHttpApiContent, OneBotHttpApiPath } from '@/const/ob_api';

import ChatInputModal from '@/components/chat_input/modal';
import CodeEditor from '@/components/code_editor';
import PageLoading from '@/components/page_loading';

import { request } from '@/utils/request';
import { parseAxiosResponse } from '@/utils/url';
import { generateDefaultJson, parse } from '@/utils/zod';

import DisplayStruct from './display_struct';

export interface OneBotApiDebugProps {
  path: OneBotHttpApiPath;
  data: OneBotHttpApiContent;
}

const OneBotApiDebug: React.FC<OneBotApiDebugProps> = (props) => {
  const { path, data } = props;
  const currentURL = new URL(window.location.origin);
  currentURL.port = '3000';
  const defaultHttpUrl = currentURL.href;
  const [httpConfig, setHttpConfig] = useLocalStorage(key.httpDebugConfig, {
    url: defaultHttpUrl,
    token: '',
  });
  const [requestBody, setRequestBody] = useState('{}');
  const [responseContent, setResponseContent] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isStructOpen, setIsStructOpen] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const parsedRequest = parse(data.request);
  const parsedResponse = parse(data.response);

  const sendRequest = async () => {
    if (isFetching) return;
    setIsFetching(true);
    const r = toast.loading('正在发送请求...');
    try {
      const parsedRequestBody = JSON.parse(requestBody);
      const requestURL = new URL(httpConfig.url);
      requestURL.pathname = path;
      request
        .post(requestURL.href, parsedRequestBody, {
          headers: {
            Authorization: `Bearer ${httpConfig.token}`,
          },
          responseType: 'text',
        })
        .then((res) => {
          setResponseContent(parseAxiosResponse(res));
          toast.success('请求发送完成，请查看响应');
        })
        .catch((err) => {
          toast.error('请求发送失败：' + err.message);
          setResponseContent(parseAxiosResponse(err.response));
        })
        .finally(() => {
          setIsFetching(false);
          responseRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          toast.dismiss(r);
        });
    } catch (_error) {
      toast.error('请求体 JSON 格式错误');
      setIsFetching(false);
      toast.dismiss(r);
    }
  };

  useEffect(() => {
    setRequestBody(generateDefaultJson(data.request));
    setResponseContent('');
  }, [path]);

  return (
    <section className='h-full flex flex-col gap-3 md:gap-4 p-3 md:p-6 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm rounded-2xl overflow-hidden'>
      <div className='flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-3 md:pb-4 gap-3'>
        <div className='flex items-center gap-2 md:gap-4 overflow-hidden'>
          <h1 className='text-lg md:text-xl font-bold flex items-center gap-2 text-primary-500 flex-shrink-0'>
            <TbApi size={24} />
            <span className='truncate'>{data.description}</span>
          </h1>
          <Snippet
            className='bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-sm border border-white/20 hidden md:flex'
            symbol={<IoLink size={16} className='inline-block mr-1' />}
            tooltipProps={{ content: '点击复制地址' }}
            size="sm"
          >
            {path}
          </Snippet>
        </div>

        <div className='flex gap-2 items-center flex-shrink-0'>
          <Button
            size='sm'
            variant='flat'
            color='default'
            radius='full'
            isIconOnly
            className='bg-white/40 dark:bg-white/10 md:hidden font-medium text-default-700'
            onPress={() => setIsStructOpen(true)}
          >
            <TbCode className="text-lg" />
          </Button>
          <Button
            size='sm'
            variant='flat'
            color='default'
            radius='full'
            className='bg-white/40 dark:bg-white/10 hidden md:flex font-medium text-default-700'
            startContent={<TbCode className="text-lg" />}
            onPress={() => setIsStructOpen(true)}
          >
            数据定义
          </Button>

          <Popover placement='bottom-end'>
            <PopoverTrigger>
              <Button
                size='sm'
                variant='flat'
                color='default'
                radius='full'
                className='bg-white/40 dark:bg-white/10 text-default-700 font-medium'
                startContent={<IoSettingsSharp className="animate-spin-slow-on-hover text-lg" />}
              >
                配置
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[340px] p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl'>
              <div className='flex flex-col gap-4 w-full'>
                <h3 className='font-bold text-lg text-default-700'>请求配置</h3>
                <Input
                  label='HTTP URL'
                  placeholder='输入 HTTP URL'
                  value={httpConfig.url}
                  onChange={(e) => setHttpConfig({ ...httpConfig, url: e.target.value })}
                  variant='bordered'
                  labelPlacement='outside'
                  classNames={{
                    inputWrapper: 'bg-default-100/50 backdrop-blur-sm border-default-200/50',
                  }}
                />
                <Input
                  label='Token'
                  placeholder='输入 Token'
                  value={httpConfig.token}
                  onChange={(e) => setHttpConfig({ ...httpConfig, token: e.target.value })}
                  variant='bordered'
                  labelPlacement='outside'
                  classNames={{
                    inputWrapper: 'bg-default-100/50 backdrop-blur-sm border-default-200/50',
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onPress={sendRequest}
            color='primary'
            radius='full'
            className='font-bold px-6 shadow-lg shadow-primary/30'
            isLoading={isFetching}
            startContent={!isFetching && <IoSend />}
          >
            发送
          </Button>
        </div>
      </div>

      <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 min-h-0 overflow-auto'>
        {/* Request Column */}
        <Card className='bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-sm h-full flex flex-col'>
          <CardHeader className='font-bold text-lg gap-2 pb-2 px-4 pt-4 border-b border-white/10 flex-shrink-0 justify-between items-center'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-6 rounded-full bg-primary-500'></span>
              请求体 (Request)
            </div>
            <div className='flex gap-2'>
              <ChatInputModal />
              <Button
                size='sm'
                color='primary'
                variant='flat'
                radius='full'
                className="bg-primary/10 text-primary"
                onPress={() => setRequestBody(generateDefaultJson(data.request))}
              >
                内置示例
              </Button>
            </div>
          </CardHeader>
          <CardBody className='p-0 flex-1 relative'>
            <div className='absolute inset-0'>
              <CodeEditor
                value={requestBody}
                onChange={(value) => setRequestBody(value ?? '')}
                language='json'
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  padding: { top: 10, bottom: 10 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </CardBody>
        </Card>

        <Card className='bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-sm h-full flex flex-col'>
          <PageLoading loading={isFetching} />
          <CardHeader className='font-bold text-lg gap-2 pb-2 px-4 pt-4 border-b border-white/10 flex-shrink-0 justify-between items-center'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-6 rounded-full bg-secondary-500'></span>
              响应 (Response)
            </div>
            <Button
              size='sm'
              color='primary'
              variant='flat'
              radius='full'
              className="bg-primary/10 text-primary"
              onPress={() => {
                navigator.clipboard.writeText(responseContent);
                toast.success('已复制');
              }}
            >
              复制内容
            </Button>
          </CardHeader>
          <CardBody className='p-0 flex-1 relative bg-black/5 dark:bg-black/30'>
            <div className='absolute inset-0 overflow-auto p-4'>
              <pre className='text-xs font-mono whitespace-pre-wrap break-all'>
                {responseContent || <span className='text-default-400 italic'>等待请求响应...</span>}
              </pre>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Struct Display - maybe put in a modal or separate tab? 
          For now, putting it in a collapsed/compact area at bottom is tricky with "h-[calc(100vh)]".
          User wants "Thorough optimization".
          I will make Struct Display a Drawer or Modal, OR put it below if we want scrolling.
          But I set height to fixed full screen.
          Let's put Struct Display in a Tab or Toggle at Top?
          Or just let the main container scroll and remove fixed height?
          Layout choice: Fixed height editors are good for workflow. Structure is reference.
          I will leave Struct Display OUT of the fixed view, or add a toggle to show it.
          Let's add a "View Structure" button in header that opens a Modal.
          Yes, that's cleaner.
      */}
      <Modal
        isOpen={isStructOpen}
        onOpenChange={setIsStructOpen}
        size='5xl'
        scrollBehavior='inside'
        backdrop='blur'
        classNames={{
          base: 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20',
          header: 'border-b border-white/10',
          body: 'p-6',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                API 数据结构定义
              </ModalHeader>
              <ModalBody>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h2 className='text-xl font-bold mb-4 text-primary-500'>请求体结构 (Request)</h2>
                    <DisplayStruct schema={parsedRequest} />
                  </div>
                  <div>
                    <h2 className='text-xl font-bold mb-4 text-secondary-500'>响应体结构 (Response)</h2>
                    <DisplayStruct schema={parsedResponse} />
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>

  );
};

export default OneBotApiDebug;
