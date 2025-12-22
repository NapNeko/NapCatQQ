import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { useState } from 'react';

import type { OneBotHttpApi, OneBotHttpApiPath } from '@/const/ob_api';

export interface OneBotApiNavListProps {
  data: OneBotHttpApi;
  selectedApi: OneBotHttpApiPath;
  onSelect: (apiName: OneBotHttpApiPath) => void;
  openSideBar: boolean;
}

const OneBotApiNavList: React.FC<OneBotApiNavListProps> = (props) => {
  const { data, selectedApi, onSelect, openSideBar } = props;
  const [searchValue, setSearchValue] = useState('');
  return (
    <motion.div
      className={clsx(
        'h-[calc(100vh-3.5rem)] left-0 !overflow-hidden md:w-auto z-20 top-[3.3rem] md:top-[3rem] absolute md:sticky md:float-start rounded-r-xl border-r border-white/20',
        openSideBar && 'bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-white/20 shadow-xl'
      )}
      initial={{ width: 0 }}
      transition={{
        type: openSideBar ? 'spring' : 'tween',
        stiffness: 150,
        damping: 15,
      }}
      animate={{ width: openSideBar ? '16rem' : '0rem' }}
      style={{ overflowY: openSideBar ? 'auto' : 'hidden' }}
    >
      <div className='w-64 h-full overflow-y-auto px-2 pt-2 pb-10 md:pb-0'>
        <Input
          className='sticky top-0 z-10 text-default-600'
          classNames={{
            inputWrapper:
              'bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/20 mb-2 hover:bg-white/60 dark:hover:bg-white/20 transition-all',
            input: 'bg-transparent text-default-700 placeholder:text-default-400',
          }}
          radius='full'
          placeholder='搜索 API'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          isClearable
          onClear={() => setSearchValue('')}
        />
        {Object.entries(data).map(([apiName, api]) => (
          <Card
            key={apiName}
            shadow='none'
            className={clsx(
              'w-full border border-transparent rounded-xl mb-1 bg-transparent hover:bg-white/40 dark:hover:bg-white/10 transition-all text-default-600 dark:text-gray-300',
              {
                hidden: !(
                  apiName.includes(searchValue) ||
                  api.description?.includes(searchValue)
                ),
              },
              {
                '!bg-white/60 dark:!bg-white/10 !border-white/20 shadow-sm !text-primary font-medium':
                  apiName === selectedApi,
              }
            )}
            isPressable
            onPress={() => onSelect(apiName as OneBotHttpApiPath)}
          >
            <CardBody>
              <h2 className='font-bold'>{api.description}</h2>
              <div
                className={clsx('text-sm text-default-400', {
                  '!text-primary': apiName === selectedApi,
                })}
              >
                {apiName}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default OneBotApiNavList;
