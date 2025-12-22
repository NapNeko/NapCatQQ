import { Card, CardBody } from '@heroui/card';
import { Image } from '@heroui/image';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { BiSolidMemoryCard } from 'react-icons/bi';
import { GiCpu } from 'react-icons/gi';

import bkg from '@/assets/images/bg/1AD934174C0107F14BAD8776D29C5F90.png';
import key from '@/const/key';

import UsagePie from './usage_pie';

export interface SystemStatusItemProps {
  title: string;
  value?: string | number;
  size?: 'md' | 'lg';
  unit?: string;
  hasBackground?: boolean;
}

const SystemStatusItem: React.FC<SystemStatusItemProps> = ({
  title,
  value = '-',
  size = 'md',
  unit,
  hasBackground = false,
}) => {
  return (
    <div
      className={clsx(
        'p-2 rounded-lg text-sm border border-white/20 transition-colors',
        size === 'lg' ? 'col-span-2' : 'col-span-1 flex justify-between',
        hasBackground
          ? 'bg-white/10 hover:bg-white/20'
          : 'bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10'
      )}
    >
      <div className={clsx(
        'w-24 font-medium',
        hasBackground ? 'text-white/90' : 'text-default-600'
      )}>{title}</div>
      <div className={clsx(
        'font-mono text-xs',
        hasBackground ? 'text-white/70' : 'text-default-500'
      )}>
        {value}
        {unit && <span className="ml-0.5 opacity-70">{unit}</span>}
      </div>
    </div>
  );
};

export interface SystemStatusDisplayProps {
  data?: SystemStatus;
}

const SystemStatusDisplay: React.FC<SystemStatusDisplayProps> = ({ data }) => {
  const memoryUsage = {
    system: 0,
    qq: 0,
  };
  if (data) {
    const system = Number(data.memory.total) || 1;
    const systemUsage = Number(data.memory.usage.system);
    const qqUsage = Number(data.memory.usage.qq);
    memoryUsage.system = (systemUsage / system) * 100;
    memoryUsage.qq = (qqUsage / system) * 100;
  }
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  return (
    <Card className={clsx(
      'backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden',
      hasBackground ? 'bg-white/10 dark:bg-black/10' : 'bg-white/60 dark:bg-black/40'
    )}>
      <div className='absolute h-full right-0 top-0'>
        <Image
          src={bkg}
          alt='background'
          className='select-none pointer-events-none !opacity-30 w-full h-full'
          classNames={{
            wrapper: 'w-full h-full',
            img: 'object-contain w-full h-full',
          }}
        />
      </div>
      <CardBody className='overflow-visible md:flex-row gap-4 items-center justify-stretch z-10'>
        <div className='flex-1 w-full md:max-w-96'>
          <h2 className={clsx(
            'text-lg font-semibold flex items-center gap-2 mb-2',
            hasBackground ? 'text-white drop-shadow-sm' : 'text-default-700 dark:text-gray-200'
          )}>
            <GiCpu className='text-xl opacity-80' />
            <span>CPU</span>
          </h2>
          <div className='grid grid-cols-2 gap-2'>
            <SystemStatusItem title='型号' value={data?.cpu.model} size='lg' hasBackground={hasBackground} />
            <SystemStatusItem title='内核数' value={data?.cpu.core} hasBackground={hasBackground} />
            <SystemStatusItem title='主频' value={data?.cpu.speed} unit='GHz' hasBackground={hasBackground} />
            <SystemStatusItem
              title='使用率'
              value={data?.cpu.usage.system}
              unit='%'
              hasBackground={hasBackground}
            />
            <SystemStatusItem
              title='QQ主线程'
              value={data?.cpu.usage.qq}
              unit='%'
              hasBackground={hasBackground}
            />
          </div>
          <h2 className={clsx(
            'text-lg font-semibold flex items-center gap-2 mb-2 mt-4',
            hasBackground ? 'text-white drop-shadow-sm' : 'text-default-700 dark:text-gray-200'
          )}>
            <BiSolidMemoryCard className='text-xl opacity-80' />
            <span>内存</span>
          </h2>
          <div className='grid grid-cols-2 gap-2'>
            <SystemStatusItem
              title='总量'
              value={data?.memory.total}
              size='lg'
              unit='MB'
              hasBackground={hasBackground}
            />
            <SystemStatusItem
              title='使用量'
              value={data?.memory.usage.system}
              unit='MB'
              hasBackground={hasBackground}
            />
            <SystemStatusItem
              title='QQ主线程'
              value={data?.memory.usage.qq}
              unit='MB'
              hasBackground={hasBackground}
            />
          </div>
        </div>
        <div className='flex flex-row md:flex-col gap-2 flex-shrink-0 w-full justify-center md:w-40 min-h-40 mt-4 md:mt-0 md:mx-auto'>
          <UsagePie
            systemUsage={Number(data?.cpu.usage.system) || 0}
            processUsage={Number(data?.cpu.usage.qq) || 0}
            title='CPU占用'
          />
          <UsagePie
            systemUsage={memoryUsage.system}
            processUsage={memoryUsage.qq}
            title='内存占用'
          />
        </div>
      </CardBody>
    </Card>
  );
};
export default SystemStatusDisplay;
