/* eslint-disable @stylistic/jsx-closing-bracket-location */
/* eslint-disable @stylistic/jsx-closing-tag-location */
import { Button } from '@heroui/button';
import { Tooltip } from '@heroui/tooltip';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useRequest } from 'ahooks';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { IoMdQuote } from 'react-icons/io';
import { IoCopy, IoRefresh } from 'react-icons/io5';

import key from '@/const/key';
import { request } from '@/utils/request';

import PageLoading from './page_loading';

export default function Hitokoto () {
  const {
    data: dataOri,
    error,
    loading,
    run,
  } = useRequest(() => request.get<IHitokoto>('https://hitokoto.152710.xyz/'), {
    throttleWait: 1000,
  });
  const backupData = {
    hitokoto: '凡是过往，皆为序章。',
    from: '暴风雨',
    from_who: '莎士比亚',
  };
  const data = dataOri?.data || (error ? backupData : undefined);
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  const onCopy = () => {
    try {
      const text = `${data?.hitokoto} —— ${data?.from} ${data?.from_who}`;
      navigator.clipboard.writeText(text);
      toast.success('复制成功');
    } catch (_error) {
      toast.error('复制失败, 请手动复制');
    }
  };
  return (
    <div className='overflow-hidden'>
      <div className='relative flex flex-col items-center justify-center p-4 md:p-6'>
        {loading && !data && <PageLoading />}
        {data && (
          <>
            <IoMdQuote className={clsx(
              'text-4xl mb-4',
              hasBackground ? 'text-white/30' : 'text-primary/20'
            )}
            />
            <div className={clsx(
              'text-xl font-medium tracking-wide leading-relaxed italic',
              hasBackground ? 'text-white drop-shadow-sm' : 'text-default-700 dark:text-gray-200'
            )}
            >
              " {data?.hitokoto} "
            </div>
            <div className='mt-4 flex flex-col items-center text-sm'>
              <span className={clsx(
                'font-bold',
                hasBackground ? 'text-white/90' : 'text-primary-500/80'
              )}
              >—— {data?.from}
              </span>
              {data?.from_who && <span className={clsx(
                'text-xs mt-1',
                hasBackground ? 'text-white/70' : 'text-default-400'
              )}
              >                {data?.from_who}
              </span>}
            </div>
          </>
        )}
      </div>
      <div className='flex gap-2'>
        <Tooltip content='刷新' placement='top'>
          <Button
            className={clsx(
              'transition-colors',
              hasBackground ? 'text-white/60 hover:text-white' : 'text-default-400 hover:text-primary'
            )}
            onPress={run}
            size='sm'
            isLoading={loading}
            isIconOnly
            radius='full'
            variant='light'
          >
            <IoRefresh />
          </Button>
        </Tooltip>
        <Tooltip content='复制' placement='top'>
          <Button
            className={clsx(
              'transition-colors',
              hasBackground ? 'text-white/60 hover:text-white' : 'text-default-400 hover:text-success'
            )}
            onPress={onCopy}
            size='sm'
            isIconOnly
            radius='full'
            variant='light'
          >
            <IoCopy />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
