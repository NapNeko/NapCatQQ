import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import clsx from 'clsx';
import { ScrollShadow } from "@heroui/scroll-shadow";
import { motion } from 'motion/react';
import { useState } from 'react';
import { TbApi, TbLayoutSidebarLeftCollapseFilled, TbSearch } from 'react-icons/tb';

import type { OneBotHttpApi, OneBotHttpApiPath } from '@/const/ob_api';

export interface OneBotApiNavListProps {
  data: OneBotHttpApi;
  selectedApi: OneBotHttpApiPath;
  onSelect: (apiName: OneBotHttpApiPath) => void;
  openSideBar: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const OneBotApiNavList: React.FC<OneBotApiNavListProps> = (props) => {
  const { data, selectedApi, onSelect, openSideBar, onToggle } = props;
  const [searchValue, setSearchValue] = useState('');
  return (
    <>
      {/* Mobile backdrop overlay */}
      {openSideBar && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-10 md:hidden"
          onClick={() => onToggle?.(false)}
        />
      )}
      <motion.div
        className={clsx(
          'h-full z-20 flex-shrink-0 border border-white/10 dark:border-white/5 bg-white/60 dark:bg-black/60 backdrop-blur-2xl shadow-xl overflow-hidden rounded-2xl',
          'fixed md:relative left-0 top-0 md:top-auto md:left-auto'
        )}
        initial={false}
        animate={{ width: openSideBar ? 280 : 0, opacity: openSideBar ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className='w-[280px] h-full flex flex-col'>
          <div className='p-3 md:p-4 flex justify-between items-center border-b border-white/10'>
            <span className='font-bold text-lg px-2 flex items-center gap-2'>
              <TbApi className="text-primary" /> API 列表
            </span>
            {onToggle && (
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={() => onToggle(false)}
                className="text-default-500 hover:text-default-800"
              >
                <TbLayoutSidebarLeftCollapseFilled size={20} />
              </Button>
            )}
          </div>

          <div className='p-3 pb-0'>
            <Input
              classNames={{
                inputWrapper:
                  'bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/60 dark:hover:bg-white/20 transition-all shadow-sm',
                input: 'bg-transparent text-default-700 placeholder:text-default-400',
              }}
              isClearable
              radius='lg'
              placeholder='搜索 API...'
              startContent={<TbSearch className="text-default-400" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
              size="sm"
            />
          </div>

          <ScrollShadow className='flex-1 p-3 flex flex-col gap-2 overflow-y-auto scroll-smooth' size={40}>
            {Object.entries(data).map(([apiName, api]) => {
              const isMatch = apiName.toLowerCase().includes(searchValue.toLowerCase()) ||
                api.description?.toLowerCase().includes(searchValue.toLowerCase());
              if (!isMatch) return null;

              const isSelected = apiName === selectedApi;

              return (
                <div
                  key={apiName}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(apiName as OneBotHttpApiPath)}
                  onKeyDown={(e) => e.key === 'Enter' && onSelect(apiName as OneBotHttpApiPath)}
                  className="cursor-pointer focus:outline-none"
                >
                  <Card
                    shadow='none'
                    className={clsx(
                      'w-full border border-transparent transition-all duration-200 group min-h-[60px]',
                      isSelected
                        ? 'bg-primary/10 border-primary/20 shadow-sm'
                        : 'bg-transparent hover:bg-white/40 dark:hover:bg-white/5'
                    )}
                  >
                    <CardBody className='p-3 text-left'>
                      <div className='flex flex-col gap-1'>
                        <span className={clsx(
                          'font-medium text-sm transition-colors',
                          isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-default-700 dark:text-default-200 group-hover:text-default-900'
                        )}>
                          {api.description}
                        </span>
                        <span className={clsx(
                          'text-xs font-mono truncate transition-colors',
                          isSelected ? 'text-primary-400 dark:text-primary-300' : 'text-default-400 group-hover:text-default-500'
                        )}>
                          {apiName}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
          </ScrollShadow>
        </div>
      </motion.div>
    </>
  );
};

export default OneBotApiNavList;
