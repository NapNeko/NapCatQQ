import { Card, CardBody } from '@heroui/card';
import { Image } from '@heroui/image';
import clsx from 'clsx';
import { BsTencentQq } from 'react-icons/bs';

import { SelfInfo } from '@/types/user';

import PageLoading from './page_loading';

export interface QQInfoCardProps {
  data?: SelfInfo;
  error?: Error;
  loading?: boolean;
}

const QQInfoCard: React.FC<QQInfoCardProps> = ({ data, error, loading }) => {
  return (
    <Card
      className='relative bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 overflow-hidden flex-shrink-0 shadow-sm'
      shadow='none'
      radius='lg'
    >
      <PageLoading loading={loading} />
      {error
        ? (
          <CardBody className='items-center gap-1 justify-center'>
            <div className='flex-1 text-content1-foreground'>Error</div>
            <div className='whitespace-nowrap text-nowrap flex-shrink-0'>
              {error.message}
            </div>
          </CardBody>
        )
        : (
          <CardBody className='flex-row items-center gap-4 overflow-hidden relative p-4'>
            <div className='absolute right-[-10px] bottom-[-10px] text-7xl text-default-400/10 rotate-12 pointer-events-none'>
              <BsTencentQq />
            </div>
            <div className='relative flex-shrink-0 z-10'>
              <Image
                src={
                  data?.avatarUrl ??
                  `https://q1.qlogo.cn/g?b=qq&nk=${data?.uin}&s=1`
                }
                className='shadow-sm rounded-full w-14 aspect-square ring-2 ring-white/50 dark:ring-white/10'
              />
              <div
                className={clsx(
                  'w-3.5 h-3.5 rounded-full absolute right-0.5 bottom-0.5 border-2 border-white dark:border-zinc-900 z-10',
                  data?.online ? 'bg-success-500' : 'bg-default-400'
                )}
              />
            </div>
            <div className='flex-col justify-center z-10'>
              <div className='text-xl font-bold text-default-800 dark:text-gray-100 truncate mb-0.5'>
                {data?.nick || '未知用户'}
              </div>
              <div className='text-default-500 font-mono text-xs tracking-wider opacity-80'>
                {data?.uin || 'Unknown'}
              </div>
            </div>
          </CardBody>
        )}
    </Card>
  );
};

export default QQInfoCard;
