import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Tooltip } from '@heroui/tooltip';
import { Tab, Tabs } from '@heroui/tabs';
import { Chip } from '@heroui/chip';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { IoChevronDown, IoSend, IoSettingsSharp, IoCopy } from 'react-icons/io5';
import { TbCode, TbMessageCode } from 'react-icons/tb';

import key from '@/const/key';
import { OneBotHttpApiContent, OneBotHttpApiPath } from '@/const/ob_api';

import ChatInputModal from '@/components/chat_input/modal';
import CodeEditor from '@/components/code_editor';
import PageLoading from '@/components/page_loading';

import { request } from '@/utils/request';

import { generateDefaultJson, parse } from '@/utils/zod';

import DisplayStruct from './display_struct';

export interface OneBotApiDebugProps {
  path: OneBotHttpApiPath;
  data: OneBotHttpApiContent;
  adapterName?: string;
}

const OneBotApiDebug: React.FC<OneBotApiDebugProps> = (props) => {
  const { path, data, adapterName } = props;
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
  const [activeTab, setActiveTab] = useState<any>('request');
  const [responseExpanded, setResponseExpanded] = useState(true);
  const [responseStatus, setResponseStatus] = useState<{ code: number; text: string; } | null>(null);
  const [responseHeight, setResponseHeight] = useLocalStorage('napcat_debug_response_height', 240); // 默认高度

  const parsedRequest = parse(data.request);
  const parsedResponse = parse(data.response);
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  const sendRequest = async () => {
    if (isFetching) return;
    setIsFetching(true);
    setResponseStatus(null);
    const r = toast.loading('正在发送请求...');

    try {
      const parsedRequestBody = JSON.parse(requestBody);

      // 如果有 adapterName，走后端转发
      if (adapterName) {
        request.post(`/api/Debug/call/${adapterName}`, {
          action: path.replace(/^\//, ''), // 去掉开头的 /
          params: parsedRequestBody
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }).then((res) => {
          if (res.data.code === 0) {
            setResponseContent(JSON.stringify(res.data.data, null, 2));
            setResponseStatus({ code: 200, text: 'OK' });
          } else {
            setResponseContent(JSON.stringify(res.data, null, 2));
            setResponseStatus({ code: 500, text: res.data.message });
          }
          setResponseExpanded(true);
          toast.success('请求成功');
        }).catch((err) => {
          toast.error('请求失败：' + err.message);
          setResponseContent(JSON.stringify({ error: err.message }, null, 2));
          setResponseStatus({ code: 500, text: 'Error' });
          setResponseExpanded(true);
        }).finally(() => {
          setIsFetching(false);
          toast.dismiss(r);
        });
        return;
      }

      // 回退到旧逻辑 (直接请求)
      const requestURL = new URL(httpConfig.url);
      requestURL.pathname = path;
      request
        .post(requestURL.href, parsedRequestBody, {
          headers: {
            Authorization: `Bearer ${httpConfig.token}`,
          },
        }) // 移除 responseType: 'text'，以便 axios 自动解析 JSON
        .then((res) => {
          setResponseContent(JSON.stringify(res.data, null, 2));
          setResponseStatus({ code: res.status, text: res.statusText });
          setResponseExpanded(true);
          toast.success('请求成功');
        })
        .catch((err) => {
          toast.error('请求失败：' + err.message);
          setResponseContent(JSON.stringify(err.response?.data || { error: err.message }, null, 2));
          if (err.response) {
            setResponseStatus({ code: err.response.status, text: err.response.statusText });
          }
          setResponseExpanded(true);
        })
        .finally(() => {
          setIsFetching(false);
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
    setResponseStatus(null);
  }, [path]);

  // Height Resizing Logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = responseHeight;

    const handleMouseMove = (mv: MouseEvent) => {
      const delta = startY - mv.clientY;
      // 向上拖动 -> 增加高度
      setResponseHeight(Math.max(100, Math.min(window.innerHeight - 200, startHeight + delta)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [responseHeight, setResponseHeight]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 阻止默认滚动行为可能需要谨慎，这里尽量只阻止 handle 上的
    // e.preventDefault(); 
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startHeight = responseHeight;

    const handleTouchMove = (mv: TouchEvent) => {
      const mvTouch = mv.touches[0];
      const delta = startY - mvTouch.clientY;
      setResponseHeight(Math.max(100, Math.min(window.innerHeight - 200, startHeight + delta)));
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [responseHeight, setResponseHeight]);


  return (
    <section className='h-full flex flex-col overflow-hidden bg-transparent'>
      {/* URL Bar */}
      <div className='flex flex-wrap md:flex-nowrap items-center gap-2 p-2 md:p-4 pb-2 flex-shrink-0'>
        <div className={clsx(
          'flex-grow flex items-center gap-2 px-3 md:px-4 h-10 rounded-xl transition-all w-full md:w-auto',
          hasBackground ? 'bg-white/5' : 'bg-black/5 dark:bg-white/5'
        )}>
          <Chip size="sm" variant="shadow" color="primary" className="font-bold text-[10px] h-5 min-w-[40px]">POST</Chip>
          <span className={clsx(
            'text-xs font-mono truncate select-all flex-1 opacity-50',
            hasBackground ? 'text-white' : 'text-default-600'
          )}>{path}</span>
        </div>

        <div className='flex items-center gap-2 flex-shrink-0 ml-auto'>
          <Popover placement='bottom-end' backdrop='blur'>
            <PopoverTrigger>
              <Button size='sm' variant='light' radius='full' isIconOnly className='h-10 w-10 opacity-40 hover:opacity-100'>
                <IoSettingsSharp className="text-lg" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[260px] p-3 rounded-xl border border-white/10 shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl'>
              <div className='flex flex-col gap-2'>
                <p className='text-[10px] font-bold opacity-30 uppercase tracking-widest'>Debug Setup</p>
                <Input label='Base URL' value={httpConfig.url} onChange={(e) => setHttpConfig({ ...httpConfig, url: e.target.value })} size='sm' variant='flat' />
                <Input label='Token' value={httpConfig.token} onChange={(e) => setHttpConfig({ ...httpConfig, token: e.target.value })} size='sm' variant='flat' />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onPress={sendRequest}
            color='primary'
            radius='full'
            size='sm'
            className='h-10 px-6 font-bold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
            isLoading={isFetching}
            startContent={!isFetching && <IoSend className="text-xs" />}
          >
            发送
          </Button>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-h-0 bg-transparent'>
        <div className='px-4 flex flex-wrap items-center justify-between flex-shrink-0 min-h-[36px] gap-2 py-1'>
          <Tabs
            size="sm"
            variant="underlined"
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            classNames={{
              cursor: 'bg-primary h-0.5',
              tab: 'px-0 mr-5 h-8',
              tabList: 'p-0 border-none',
              tabContent: 'text-[11px] font-bold opacity-30 group-data-[selected=true]:opacity-80 transition-opacity'
            }}
          >
            <Tab key="request" title="请求参数" />
            <Tab key="docs" title="接口定义" />
          </Tabs>
          <div className='flex items-center gap-1 ml-auto'>
            <ChatInputModal>
              {(onOpen) => (
                <Tooltip content="构造消息 (CQ码)" closeDelay={0}>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    radius='full'
                    className='h-7 w-7 text-primary/80 bg-primary/10 hover:bg-primary/20'
                    onPress={onOpen}
                  >
                    <TbMessageCode size={16} />
                  </Button>
                </Tooltip>
              )}
            </ChatInputModal>

            <Tooltip content="生成示例参数" closeDelay={0}>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                radius='full'
                className='h-7 w-7 text-default-400 hover:text-primary hover:bg-default-100/50'
                onPress={() => setRequestBody(generateDefaultJson(data.request))}
              >
                <TbCode size={16} />
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className='flex-1 min-h-0 relative px-3 pb-2 mt-1'>
          <div className={clsx(
            'h-full rounded-xl overflow-y-auto no-scrollbar transition-all',
            hasBackground ? 'bg-transparent' : 'bg-white/10 dark:bg-black/10'
          )}>
            {activeTab === 'request' ? (
              <CodeEditor
                value={requestBody}
                onChange={(value) => setRequestBody(value ?? '')}
                language='json'
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 12 },
                  lineNumbersMinChars: 3
                }}
              />
            ) : (
              <div className='p-6 space-y-10'>
                <section>
                  <h3 className='text-[10px] font-bold opacity-20 uppercase tracking-[0.2em] mb-4'>Request - 请求数据结构</h3>
                  <DisplayStruct schema={parsedRequest} />
                </section>
                <div className='h-px bg-white/5 w-full' />
                <section>
                  <h3 className='text-[10px] font-bold opacity-20 uppercase tracking-[0.2em] mb-4'>Response - 返回数据结构</h3>
                  <DisplayStruct schema={parsedResponse} />
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Area */}
      <div className='flex-shrink-0 px-3 pb-3'>
        <div
          className={clsx(
            'rounded-xl transition-all overflow-hidden border border-white/5 flex flex-col',
            hasBackground ? 'bg-white/5' : 'bg-white/5 dark:bg-black/5'
          )}
        >
          {/* Header & Resize Handle */}
          <div
            className='flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-white/5 transition-all select-none relative group'
            onClick={() => setResponseExpanded(!responseExpanded)}
          >
            {/* Invisble Resize Area that becomes visible/active */}
            {responseExpanded && (
              <div
                className="absolute -top-1 left-0 w-full h-3 cursor-ns-resize z-50 flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e); }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>
            )}

            <div className='flex items-center gap-2'>
              <IoChevronDown className={clsx('text-[10px] transition-transform duration-300 opacity-20', !responseExpanded && '-rotate-90')} />
              <span className='text-[10px] font-semibold tracking-wide opacity-30 uppercase'>Response</span>
            </div>
            <div className='flex items-center gap-2'>
              {responseStatus && (
                <Chip size="sm" variant="flat" color={responseStatus.code >= 200 && responseStatus.code < 300 ? 'success' : 'danger'} className="h-4 text-[9px] font-mono px-1.5 opacity-50">
                  {responseStatus.code}
                </Chip>
              )}
              <Button size='sm' variant='light' isIconOnly radius='full' className='h-6 w-6 opacity-20 hover:opacity-80 transition-opacity' onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(responseContent); toast.success('已复制'); }}>
                <IoCopy size={10} />
              </Button>
            </div>
          </div>

          {/* Response Content - Code Editor */}
          {responseExpanded && (
            <div style={{ height: responseHeight }} className="relative bg-black/5 dark:bg-black/20">
              <PageLoading loading={isFetching} />
              <CodeEditor
                value={responseContent || '// Waiting for response...'}
                language='json'
                options={{
                  minimap: { enabled: false },
                  fontSize: 11,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  readOnly: true,
                  folding: true,
                  padding: { top: 8, bottom: 8 },
                  renderLineHighlight: 'none',
                  automaticLayout: true
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OneBotApiDebug;
