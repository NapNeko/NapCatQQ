import { Button } from '@heroui/button';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { TbSearch } from 'react-icons/tb';

import key from '@/const/key';
import { fetchOneBotHttpApi, OneBotHttpApiPath } from '@/const/ob_api';
import type { OneBotHttpApi } from '@/const/ob_api';

import OneBotApiDebug from '@/components/onebot/api/debug';
import CommandPalette from '@/components/command_palette';
import type { CommandPaletteCommand, CommandPaletteExecuteMode } from '@/components/command_palette';

import { generateDefaultFromTypeBox } from '@/utils/typebox';
import type { OneBotApiDebugRef } from '@/components/onebot/api/debug';

export default function HttpDebug () {
  const [activeApi, setActiveApi] = useState<OneBotHttpApiPath | null>(null);
  const [openApis, setOpenApis] = useState<OneBotHttpApiPath[]>([]);
  const [oneBotHttpApi, setOneBotHttpApi] = useState<OneBotHttpApi>({});
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  const [adapterName, setAdapterName] = useState<string>('');
  const [paletteOpen, setPaletteOpen] = useState(false);

  const debugRefs = useRef(new Map<string, OneBotApiDebugRef>());
  const [pendingRun, setPendingRun] = useState<{ path: OneBotHttpApiPath; body: string; } | null>(null);

  // Ctrl/Cmd + K 打开命令面板
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Initialize Debug Adapter and fetch schemas
  useEffect(() => {
    let currentAdapterName = '';

    const init = async () => {
      try {
        const [apiData] = await Promise.all([
          fetchOneBotHttpApi(),
          fetch('/api/Debug/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(res => res.json()).then(data => {
            if (data.code === 0) {
              currentAdapterName = data.data.adapterName;
              setAdapterName(currentAdapterName);
            }
          })
        ]);
        setOneBotHttpApi(apiData);
      } catch (error) {
        console.error('Failed to initialize debug:', error);
      }
    };

    init();

    return () => {
      // 不再主动关闭 adapter，由后端自动管理活跃状态
    };
  }, []);


  const handleSelectApi = (api: OneBotHttpApiPath) => {
    if (!openApis.includes(api)) {
      setOpenApis([...openApis, api]);
    }
    setActiveApi(api);
  };

  // 等对应 Debug 组件挂载后再触发发送
  useEffect(() => {
    if (!pendingRun) return;
    if (activeApi !== pendingRun.path) return;
    const ref = debugRefs.current.get(pendingRun.path);
    if (!ref) return;
    ref.sendWithBody(pendingRun.body);
    setPendingRun(null);
  }, [activeApi, pendingRun]);

  const commands: CommandPaletteCommand[] = useMemo(() => {
    return Object.keys(oneBotHttpApi).map((p) => {
      const path = p as OneBotHttpApiPath;
      const item = oneBotHttpApi[path];
      const displayPath = '/' + path;
      // 简单分组：按描述里已有分类不可靠，这里只用 path 前缀推断
      const group = path.startsWith('get_') ? 'GET' : (path.startsWith('set_') ? 'SET' : 'API');
      return {
        id: path,
        title: item?.description || displayPath,
        subtitle: item?.payload ? '回车发送 · Shift+Enter 仅打开' : undefined,
        group,
      };
    });
  }, [oneBotHttpApi]);

  const executeCommand = (commandId: string, mode: CommandPaletteExecuteMode) => {
    const api = commandId as OneBotHttpApiPath;
    const item = oneBotHttpApi[api];
    let body = '{}';
    if (item?.payloadExample) {
      body = JSON.stringify(item.payloadExample, null, 2);
    } else if (item?.payload) {
      try {
        body = JSON.stringify(generateDefaultFromTypeBox(item.payload), null, 2);
      } catch (e) {
        console.error('Error generating default:', e);
        body = '{}';
      }
    }

    handleSelectApi(api);
    // 确保请求参数可见
    const ref = debugRefs.current.get(api);
    if (ref) {
      if (mode === 'send') ref.sendWithBody(body);
      else ref.setRequestBody(body);
      return;
    }
    // 若还没挂载，延迟执行
    if (mode === 'send') setPendingRun({ path: api, body });
  };

  const handleCloseTab = (e: React.MouseEvent, apiToRemove: OneBotHttpApiPath) => {
    e.stopPropagation();
    const newOpenApis = openApis.filter((api) => api !== apiToRemove);
    setOpenApis(newOpenApis);

    if (activeApi === apiToRemove) {
      if (newOpenApis.length > 0) {
        setActiveApi(newOpenApis[newOpenApis.length - 1]);
      } else {
        setActiveApi(null);
      }
    }
  };

  return (
    <>
      <title>HTTP调试 - NapCat WebUI</title>
      <div className='h-[calc(100vh-3.5rem)] pt-2 px-0 md:px-4'>
        <div className={clsx(
          'h-full flex flex-col overflow-hidden transition-all relative',
          // 'rounded-none md:rounded-2xl border', // Removing the main border/radius
          // hasBackground
          //   ? 'bg-white/5 dark:bg-black/5 backdrop-blur-sm border-white/10'
          //   : 'bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-sm border-white/40 dark:border-white/10'
          'bg-transparent'
        )}>
          <div className='flex-1 flex flex-col overflow-hidden relative'>
            <div className={clsx(
              'flex items-center w-full flex-shrink-0 pr-2 md:pl-4 py-1 relative z-20 rounded-md',
              hasBackground
                ? 'bg-white/5'
                : 'bg-white/30 dark:bg-white/5'
            )}>
              {/* Tab List */}
              <div className="flex-1 overflow-x-auto no-scrollbar flex items-center">
                {openApis.map((api) => {
                  const isActive = api === activeApi;
                  const item = oneBotHttpApi[api];
                  return (
                    <div
                      key={api}
                      onClick={() => setActiveApi(api)}
                      className={clsx(
                        'group flex items-center gap-2 px-3 h-8 my-1 mr-1 rounded-md cursor-pointer border select-none transition-all min-w-[120px] max-w-[260px]',
                        hasBackground ? 'border-transparent hover:bg-white/10' : 'border-transparent hover:bg-white/10 dark:hover:bg-white/5',
                        isActive
                          ? (hasBackground
                            ? 'bg-white/15 text-white border-white/20'
                            : 'bg-default-100 dark:bg-white/15 text-foreground dark:text-white font-medium shadow-sm border-default-200 dark:border-white/10')
                          : (hasBackground ? 'text-white/70 hover:text-white' : 'text-default-600 dark:text-white/70 hover:text-default-900 dark:hover:text-white')
                      )}
                    >
                      <span className={clsx(
                        'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm',
                        isActive
                          ? 'bg-success/20 text-success'
                          : 'opacity-60 bg-default-200/50 dark:bg-white/10'
                      )}>POST</span>
                      <span className='text-xs truncate flex-1'>{item?.description || api}</span>
                      <div
                        className={clsx(
                          'p-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/20 transition-opacity',
                          isActive ? 'opacity-40 hover:opacity-100' : 'opacity-0 group-hover:opacity-40'
                        )}
                        onClick={(e) => handleCloseTab(e, api)}
                      >
                        <IoClose size={12} />
                      </div>
                    </div>
                  );

                })}
              </div>

              {/* Actions */}
              <div className='flex items-center gap-2 pl-2 border-l border-white/5 flex-shrink-0'>
                <Button
                  isIconOnly
                  size='sm'
                  radius='sm'
                  variant='light'
                  className='text-default-500 hover:text-primary w-10 h-10 min-w-10'
                  onClick={() => setPaletteOpen(true)}
                  onPress={() => setPaletteOpen(true)}
                >
                  <TbSearch size={18} />
                </Button>
              </div>
            </div>

            {/* Content Panels */}
            <div className='flex-1 relative overflow-hidden'>
              {activeApi === null && (
                <div className='h-full flex items-center justify-center text-default-400 text-sm opacity-50 select-none'>
                  使用命令面板选择接口（Ctrl/Cmd + K）
                </div>
              )}

              {openApis.map((api) => (
                <div
                  key={api}
                  className={clsx(
                    'h-full w-full absolute top-0 left-0 transition-opacity duration-200',
                    api === activeApi ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  )}
                >
                  <OneBotApiDebug
                    ref={(node) => {
                      if (!node) {
                        debugRefs.current.delete(api);
                        return;
                      }
                      debugRefs.current.set(api, node);
                    }}
                    path={api}
                    data={oneBotHttpApi[api]}
                    adapterName={adapterName}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
        onExecute={executeCommand}
      />
    </>
  );
}
