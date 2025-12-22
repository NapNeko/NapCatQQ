import { Button } from '@heroui/button';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { TbSquareRoundedChevronLeftFilled } from 'react-icons/tb';

import oneBotHttpApi from '@/const/ob_api';
import type { OneBotHttpApi } from '@/const/ob_api';

import OneBotApiDebug from '@/components/onebot/api/debug';
import OneBotApiNavList from '@/components/onebot/api/nav_list';

export default function HttpDebug () {
  const [selectedApi, setSelectedApi] =
    useState<keyof OneBotHttpApi>('/set_qq_profile');
  const data = oneBotHttpApi[selectedApi];
  const contentRef = useRef<HTMLDivElement>(null);
  const [openSideBar, setOpenSideBar] = useState(true);

  useEffect(() => {
    contentRef?.current?.scrollTo?.({
      top: 0,
      behavior: 'smooth',
    });
  }, [selectedApi]);

  return (
    <>
      <title>HTTP调试 - NapCat WebUI</title>
      <div className='flex h-[calc(100vh-3.5rem)] overflow-hidden relative p-2 md:p-4 gap-2 md:gap-4'>
        <OneBotApiNavList
          data={oneBotHttpApi}
          selectedApi={selectedApi}
          onSelect={(api) => {
            setSelectedApi(api);
            // Auto-close sidebar on mobile after selection
            if (window.innerWidth < 768) {
              setOpenSideBar(false);
            }
          }}
          openSideBar={openSideBar}
          onToggle={setOpenSideBar}
        />
        <div
          ref={contentRef}
          className='flex-1 h-full overflow-hidden flex flex-col relative'
        >
          {/* Toggle Button Container - positioned on top-left of content if sidebar is closed */}
          <div className='absolute top-2 left-2 z-30'>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className={clsx("bg-white/40 dark:bg-black/40 backdrop-blur-md transition-opacity rounded-full shadow-sm", openSideBar ? "opacity-0 pointer-events-none md:opacity-0" : "opacity-100")}
              onPress={() => setOpenSideBar(true)}
            >
              <TbSquareRoundedChevronLeftFilled className="transform rotate-180" />
            </Button>
          </div>

          <OneBotApiDebug path={selectedApi} data={data} />
        </div>
      </div>
    </>
  );
}
