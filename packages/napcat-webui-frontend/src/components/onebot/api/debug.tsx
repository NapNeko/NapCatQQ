import { Button } from '@heroui/button';

import { Input } from '@heroui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover';
import { Tooltip } from '@heroui/tooltip';
import { Tab, Tabs } from '@heroui/tabs';
import { Chip } from '@heroui/chip';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { forwardRef, useEffect, useImperativeHandle, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { IoChevronDown, IoSend, IoSettingsSharp, IoCopy } from 'react-icons/io5';
import { TbCode, TbMessageCode } from 'react-icons/tb';

import key from '@/const/key';
import { OneBotHttpApiContent, OneBotHttpApiPath } from '@/const/ob_api';

import ChatInputModal from '@/components/chat_input/modal';
import CodeEditor from '@/components/code_editor';
import PageLoading from '@/components/page_loading';

import { request } from '@/utils/request';

import { BaseResponseSchema, parseTypeBox, generateDefaultFromTypeBox } from '@/utils/typebox';
import { Type } from '@sinclair/typebox';

import DisplayStruct from './display_struct';

export interface OneBotApiDebugProps {
  path: OneBotHttpApiPath;
  data: OneBotHttpApiContent;
  adapterName?: string;
}

export interface OneBotApiDebugRef {
  setRequestBody: (value: string) => void;
  sendWithBody: (value: string) => void;
  focusRequestEditor: () => void;
}

const OneBotApiDebug = forwardRef<OneBotApiDebugRef, OneBotApiDebugProps>((props, ref) => {
  const { path, data, adapterName } = props;
  const currentURL = new URL(window.location.origin);
  currentURL.port = '3000';
  const defaultHttpUrl = currentURL.href;
  const defaultToken = localStorage.getItem('token') || '';
  const [httpConfig, setHttpConfig] = useLocalStorage(key.httpDebugConfig, {
    url: defaultHttpUrl,
    token: defaultToken,
  });

  const [requestBody, setRequestBody] = useState('{}');
  const [responseContent, setResponseContent] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<any>('request');
  const [responseExpanded, setResponseExpanded] = useState(true);
  const [responseStatus, setResponseStatus] = useState<{ code: number; text: string; } | null>(null);
  // Height Resizing Logic
  const [responseHeight, setResponseHeight] = useState(240);
  const [storedHeight, setStoredHeight] = useLocalStorage('napcat_debug_response_height', 240);

  // 使用 useMemo 缓存解析结果，避免每次渲染都重新解析
  const parsedRequest = useMemo(() => {
    try {
      return parseTypeBox(data?.payload);
    } catch (e) {
      console.error('Error parsing request schema:', e);
      return [];
    }
  }, [data?.payload]);

  // 将返回值的 data 结构包装进 BaseResponseSchema 进行展示
  // 使用解构属性的方式重新构建对象，确保 parseTypeBox 能够识别为 object 类型
  const parsedResponse = useMemo(() => {
    try {
      const wrappedResponseSchema = Type.Object({
        ...BaseResponseSchema.properties,
        data: data?.response || Type.Any({ description: '数据' })
      });
      return parseTypeBox(wrappedResponseSchema);
    } catch (e) {
      console.error('Error parsing response schema:', e);
      return [];
    }
  }, [data?.response]);
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  const sendRequest = async (bodyOverride?: string) => {
    if (isFetching) return;
    setIsFetching(true);
    setResponseStatus(null);
    const r = toast.loading('正在发送请求...');

    try {
      const parsedRequestBody = JSON.parse(bodyOverride ?? requestBody);

      // 如果有 adapterName，走后端转发
      if (adapterName) {
        request.post(`/api/Debug/call/${adapterName}`, {
          action: path,
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

  useImperativeHandle(ref, () => ({
    setRequestBody: (value: string) => {
      setActiveTab('request');
      setRequestBody(value);
    },
    sendWithBody: (value: string) => {
      setActiveTab('request');
      setRequestBody(value);
      // 直接用 override 发送，避免 setState 异步导致拿到旧值
      void sendRequest(value);
    },
    focusRequestEditor: () => {
      setActiveTab('request');
    }
  }));

  useEffect(() => {
    if (data?.payloadExample) {
      setRequestBody(JSON.stringify(data.payloadExample, null, 2));
    } else {
      try {
        setRequestBody(JSON.stringify(generateDefaultFromTypeBox(data?.payload), null, 2));
      } catch (e) {
        console.error('Error generating default:', e);
        setRequestBody('{}');
      }
    }
    setResponseContent('');
    setResponseStatus(null);
  }, [path]);

  // Sync from storage on mount
  useEffect(() => {
    setResponseHeight(storedHeight);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = responseHeight;
    let currentH = startHeight;
    let frameId: number;

    const handleMouseMove = (mv: MouseEvent) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const delta = startY - mv.clientY;
        currentH = Math.max(100, Math.min(window.innerHeight - 200, startHeight + delta));
        setResponseHeight(currentH);
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (frameId) cancelAnimationFrame(frameId);
      setStoredHeight(currentH);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [responseHeight, setStoredHeight]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startHeight = responseHeight;
    let currentH = startHeight;
    let frameId: number;

    const handleTouchMove = (mv: TouchEvent) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const mvTouch = mv.touches[0];
        const delta = startY - mvTouch.clientY;
        currentH = Math.max(100, Math.min(window.innerHeight - 200, startHeight + delta));
        setResponseHeight(currentH);
      });
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (frameId) cancelAnimationFrame(frameId);
      setStoredHeight(currentH);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [responseHeight, setStoredHeight]);


  return (

    <div className='flex flex-col h-full w-full relative overflow-hidden'>
      {/* 1. Top Toolbar: URL & Actions */}
      <div className={clsx(
        'flex items-center gap-4 px-4 py-2 border-b flex-shrink-0 z-10',
        hasBackground ? 'border-white/10 bg-white/5' : 'border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20'
      )}>
        {/* Method & Path */}
        {/* Method & Path */}
        {/* Method & Path */}
        <div className="flex items-center gap-3 flex-1 min-w-0 pl-1">
          <div className={clsx(
            'text-sm font-mono truncate select-all px-2 py-1 rounded-md transition-colors',
            hasBackground ? 'text-white/90 bg-black/10' : 'text-foreground dark:text-white/90 bg-default-100/50'
          )}>
            {path}
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          <Popover placement='bottom-end' backdrop='transparent'>
            <PopoverTrigger>
              <Button size='sm' variant='light' radius='sm' isIconOnly className='opacity-60 hover:opacity-100'>
                <IoSettingsSharp className="text-lg" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[260px] p-3 rounded-md border border-white/10 shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl'>
              <div className='flex flex-col gap-2'>
                <p className='text-[10px] font-bold opacity-30 uppercase tracking-widest'>Debug Setup</p>
                <Input label='Base URL' labelPlacement="outside" placeholder="http://..." value={httpConfig.url} onChange={(e) => setHttpConfig({ ...httpConfig, url: e.target.value })} size='sm' variant='bordered' />
                <Input label='Token' labelPlacement="outside" placeholder="access_token" value={httpConfig.token} onChange={(e) => setHttpConfig({ ...httpConfig, token: e.target.value })} size='sm' variant='bordered' />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onPress={() => sendRequest()}
            color='primary'
            radius='sm'
            size='sm'
            className='font-bold shadow-sm px-4'
            isLoading={isFetching}
            startContent={!isFetching && <IoSend className="text-xs" />}
          >
            发送
          </Button>
        </div>
      </div>

      {/* 2. Main Workspace (Request) - Flexible Height */}
      <div className='flex-1 min-h-0 flex flex-col relative'>
        <div className='flex-1 flex flex-col overflow-hidden relative'>
          {/* Request Toolbar */}
          <div className={clsx(
            'px-4 flex items-center justify-between h-10 flex-shrink-0 border-b',
            hasBackground ? 'border-white/10' : 'border-default-100 dark:border-white/10'
          )}>
            <Tabs
              aria-label="Request Options"
              size="sm"
              variant="underlined"
              selectedKey={activeTab}
              onSelectionChange={setActiveTab}
              classNames={{
                tabList: 'p-0 gap-6 bg-transparent',
                cursor: 'w-full bg-foreground dark:bg-white h-[2px]',
                tab: 'px-0 h-full',
                tabContent: 'text-xs font-medium text-default-500 dark:text-white/50 group-data-[selected=true]:text-foreground dark:group-data-[selected=true]:text-white'
              }}
            >
              <Tab key="request" title="请求体" />
              <Tab key="docs" title="接口文档" />
            </Tabs>

            <div className='flex items-center gap-1 opacity-70'>
              <ChatInputModal>
                {(onOpen) => (
                  <Tooltip content="构造 CQ 码" closeDelay={0}>
                    <Button isIconOnly size='sm' variant='light' radius='sm' className='w-8 h-8' onPress={onOpen}>
                      <TbMessageCode size={16} />
                    </Button>
                  </Tooltip>
                )}
              </ChatInputModal>
              <Tooltip content="生成示例" closeDelay={0}>
                <Button isIconOnly size='sm' variant='light' radius='sm' className='w-8 h-8' onPress={() => {
                  try {
                    setRequestBody(JSON.stringify(generateDefaultFromTypeBox(data?.payload), null, 2));
                  } catch (e) {
                    console.error('Error generating default:', e);
                    toast.error('生成示例失败');
                  }
                }}>
                  <TbCode size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Content Area */}
          <div className='flex-1 relative overflow-hidden'>
            {activeTab === 'request' ? (
              <div className="absolute inset-0">
                <CodeEditor
                  value={requestBody}
                  onChange={(value) => setRequestBody(value ?? '')}
                  language='json'
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    padding: { top: 16, bottom: 16 },
                    lineNumbersMinChars: 3,
                    chromeless: true,
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            ) : (
              <div className='p-6 space-y-8 overflow-y-auto h-full scrollbar-hide'>
                <section>
                  <h3 className='text-[10px] font-bold text-default-700 dark:text-default-50 uppercase tracking-widest mb-4'>Request Params</h3>
                  <DisplayStruct schema={parsedRequest} />
                </section>
                <div className='h-px bg-white/10 w-full' />
                <section>
                  <h3 className='text-[10px] font-bold text-default-700 dark:text-default-50 uppercase tracking-widest mb-4'>Response Data</h3>
                  <DisplayStruct schema={parsedResponse} />
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Response Panel (Bottom) */}
      <div
        className='flex-shrink-0 flex flex-col overflow-hidden relative'
        style={{ height: responseExpanded ? undefined : 'auto' }}
      >
        {/* Resize Handle / Header */}
        <div
          className={clsx(
            'flex items-center justify-between px-4 py-1.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none group relative border-t',
            hasBackground ? 'border-white/10' : 'border-default-100 dark:border-white/10'
          )}
          onClick={() => setResponseExpanded(!responseExpanded)}
        >
          {/* Invisible Draggable Area */}
          {responseExpanded && (
            <div
              className="absolute -top-1.5 left-0 w-full h-4 cursor-ns-resize z-20"
              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e); }}
              onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e); }}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          <div className='flex items-center gap-2'>
            <div className={clsx('transition-transform duration-200', !responseExpanded && '-rotate-90')}>
              <IoChevronDown size={14} className="opacity-50" />
            </div>
            <span className={clsx(
              'text-[10px] font-bold tracking-widest uppercase',
              hasBackground ? 'text-white' : 'text-foreground dark:text-white'
            )}>Response</span>
            {responseStatus && (
              <Chip size="sm" variant="dot" color={responseStatus.code >= 200 && responseStatus.code < 300 ? 'success' : 'danger'} className="h-5 text-[10px] font-mono border-none bg-transparent pl-0">
                {responseStatus.code} {responseStatus.text}
              </Chip>
            )}
          </div>

          <Button size='sm' variant='light' isIconOnly radius='sm' className='h-6 w-6 opacity-40 hover:opacity-100' onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(responseContent); toast.success('已复制'); }}>
            <IoCopy size={12} />
          </Button>
        </div>

        {/* Response Editor */}
        {responseExpanded && (
          <div style={{ height: responseHeight }} className="relative bg-transparent">
            <PageLoading loading={isFetching} />
            <div className="absolute inset-0">
              <CodeEditor
                value={responseContent || '// Waiting for response...'}
                language='json'
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono, monospace',
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  readOnly: true,
                  folding: true,
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: 'none',
                  chromeless: true,
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
});

export default OneBotApiDebug;
