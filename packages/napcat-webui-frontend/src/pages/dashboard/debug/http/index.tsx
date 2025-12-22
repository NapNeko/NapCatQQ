import { Button } from '@heroui/button';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { TbSquareRoundedChevronLeftFilled } from 'react-icons/tb';

import key from '@/const/key';
import oneBotHttpApi from '@/const/ob_api';
import type { OneBotHttpApiPath } from '@/const/ob_api';

import OneBotApiDebug from '@/components/onebot/api/debug';
import OneBotApiNavList from '@/components/onebot/api/nav_list';

export default function HttpDebug () {
  const [activeApi, setActiveApi] = useState<OneBotHttpApiPath | null>('/set_qq_profile');
  const [openApis, setOpenApis] = useState<OneBotHttpApiPath[]>(['/set_qq_profile']);
  const [openSideBar, setOpenSideBar] = useState(true);
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  const [adapterName, setAdapterName] = useState<string>('');

  // Auto-collapse sidebar on mobile initial load
  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpenSideBar(false);
    }
  }, []);

  // Initialize Debug Adapter
  useEffect(() => {
    let currentAdapterName = '';

    const initAdapter = async () => {
      try {
        const response = await fetch('/api/Debug/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.code === 0) {
          currentAdapterName = data.data.adapterName;
          setAdapterName(currentAdapterName);
        }
      } catch (error) {
        console.error('Failed to create debug adapter:', error);
      }
    };

    initAdapter();

    return () => {
      // 不再主动关闭 adapter，由后端自动管理活跃状态
    };
  }, []);


  const handleSelectApi = (api: OneBotHttpApiPath) => {
    if (!openApis.includes(api)) {
      setOpenApis([...openApis, api]);
    }
    setActiveApi(api);
    if (window.innerWidth < 768) {
      setOpenSideBar(false);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, apiToRemove: OneBotHttpApiPath) => {
    e.stopPropagation();
    const newOpenApis = openApis.filter((api) => api !== apiToRemove);
    setOpenApis(newOpenApis);

    if (activeApi === apiToRemove) {
      if (newOpenApis.length > 0) {
        // Switch to the last opened tab or the previous one? 
        // Usually the one to the right or left. Let's pick the last one for simplicity or neighbor.
        // Finding index of removed api to pick neighbor is better UX, but last one is acceptable.
        setActiveApi(newOpenApis[newOpenApis.length - 1]);
      } else {
        setActiveApi(null);
      }
    }
  };

  return (
    <>
      <title>HTTP调试 - NapCat WebUI</title>
      <div className='h-[calc(100vh-3.5rem)] p-0 md:p-4'>
        <div className={clsx(
          'h-full flex flex-col overflow-hidden transition-all relative',
          'rounded-none md:rounded-2xl',
          hasBackground
            ? 'bg-white/5 dark:bg-black/5 backdrop-blur-sm'
            : 'bg-white/20 dark:bg-black/10 backdrop-blur-sm shadow-sm'
        )}>
          {/* Unifed Header */}
          <div className='h-12 border-b border-white/10 flex items-center justify-between px-4 z-50 bg-white/5 flex-shrink-0'>
            <div className='flex items-center gap-3'>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className={clsx(
                  "opacity-50 hover:opacity-100 transition-all",
                  openSideBar && "text-primary opacity-100"
                )}
                onPress={() => setOpenSideBar(!openSideBar)}
              >
                <TbSquareRoundedChevronLeftFilled className={clsx("text-lg transform transition-transform", !openSideBar && "rotate-180")} />
              </Button>
              <h1 className={clsx(
                'text-sm font-bold tracking-tight',
                hasBackground ? 'text-white/80' : 'text-default-700 dark:text-gray-200'
              )}>接口调试</h1>
            </div>
          </div>

          <div className='flex-1 flex flex-row overflow-hidden relative'>
            <OneBotApiNavList
              data={oneBotHttpApi}
              selectedApi={activeApi || '' as any}
              onSelect={handleSelectApi}
              openSideBar={openSideBar}
              onToggle={setOpenSideBar}
            />

            <div
              className='flex-1 h-full overflow-hidden flex flex-col relative'
            >
              {/* Tab Bar */}
              <div className='flex items-center w-full overflow-x-auto no-scrollbar border-b border-white/5 bg-white/5 flex-shrink-0'>
                {openApis.map((api) => {
                  const isActive = api === activeApi;
                  const item = oneBotHttpApi[api];
                  return (
                    <div
                      key={api}
                      onClick={() => setActiveApi(api)}
                      className={clsx(
                        'group flex items-center gap-2 px-4 h-9 cursor-pointer border-r border-white/5 select-none transition-all min-w-[120px] max-w-[200px]',
                        isActive
                          ? (hasBackground ? 'bg-white/10 text-white' : 'bg-white/40 dark:bg-white/5 text-primary font-medium')
                          : 'opacity-50 hover:opacity-100 hover:bg-white/5'
                      )}
                    >
                      <span className={clsx(
                        'text-[10px] font-bold uppercase tracking-wider',
                        isActive ? 'opacity-100' : 'opacity-50'
                      )}>POST</span>
                      <span className='text-xs truncate flex-1'>{item?.description || api}</span>
                      <div
                        className={clsx(
                          'p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-opacity',
                          isActive ? 'opacity-50 hover:opacity-100' : 'opacity-0 group-hover:opacity-50'
                        )}
                        onClick={(e) => handleCloseTab(e, api)}
                      >
                        <IoClose size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Content Panels */}
              <div className='flex-1 relative overflow-hidden'>
                {activeApi === null && (
                  <div className='h-full flex items-center justify-center text-default-400 text-sm opacity-50 select-none'>
                    选择一个接口开始调试
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
      </div>
    </>
  );
}
