import { Button } from '@heroui/button';
import { Tooltip } from '@heroui/tooltip';
import { useRequest } from 'ahooks';
import toast from 'react-hot-toast';
import { IoMdQuote } from 'react-icons/io';
import { IoCopy, IoRefresh } from 'react-icons/io5';

import { request } from '@/utils/request';

import PageLoading from './page_loading';

export default function Hitokoto () {
  const {
    data: dataOri,
    error,
    loading,
    run,
  } = useRequest(() => request.get<IHitokoto>('https://hitokoto.152710.xyz/'), {
    pollingInterval: 10000,
    throttleWait: 1000,
  });
  const data = dataOri?.data;
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
    <div>
      <div className='relative flex flex-col items-center justify-center p-6 min-h-[120px]'>
        {loading && <PageLoading />}
        {error
          ? (
            <div className='text-danger'>一言加载失败：{error.message}</div>
          )
          : (
            <>
              <IoMdQuote className="text-4xl text-primary/20 mb-4" />
              <div className="text-xl font-medium text-default-700 dark:text-gray-200 tracking-wide leading-relaxed italic">
                “ {data?.hitokoto} ”
              </div>
              <div className='mt-4 flex flex-col items-center text-sm'>
                <span className='font-bold text-primary-500/80'>—— {data?.from}</span>
                {data?.from_who && <span className="text-default-400 text-xs mt-1">{data?.from_who}</span>}
              </div>
            </>
          )}
      </div>
      <div className='flex gap-2'>
        <Tooltip content='刷新' placement='top'>
          <Button
            className="text-default-400 hover:text-primary transition-colors"
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
            className="text-default-400 hover:text-success transition-colors"
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
