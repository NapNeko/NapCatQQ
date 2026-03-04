import { Card, CardBody } from '@heroui/card';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import key from '@/const/key';



export interface NetworkItemDisplayProps {
  count: number;
  label: string;
  size?: 'sm' | 'md';
}

const NetworkItemDisplay: React.FC<NetworkItemDisplayProps> = ({
  count,
  label,
  size = 'md',
}) => {
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  return (
    <Card
      className={clsx(
        'backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm transition-all',
        hasBackground
          ? 'bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20'
          : 'bg-white/60 dark:bg-black/40 hover:bg-white/70 dark:hover:bg-black/30',
        size === 'md'
          ? 'col-span-8 md:col-span-2'
          : 'col-span-2 md:col-span-1'
      )}
      shadow='none'
    >
      <CardBody className='items-center md:gap-1 p-1 md:p-2'>
        <div
          className={clsx(
            'flex-1 font-mono font-bold',
            size === 'md' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl',
            hasBackground ? 'text-white drop-shadow-sm' : 'text-default-700 dark:text-gray-200'
          )}
        >
          {count}
        </div>
        <div
          className={clsx(
            'whitespace-nowrap text-nowrap flex-shrink-0 font-medium',
            size === 'md' ? 'text-sm' : 'text-xs',
            hasBackground ? 'text-white/80' : 'text-default-500'
          )}
        >
          {label}
        </div>
      </CardBody>
    </Card>
  );
};

export default NetworkItemDisplay;
