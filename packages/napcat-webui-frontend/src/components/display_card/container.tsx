import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import key from '@/const/key';


export interface ContainerProps {
  title: string;
  tag?: React.ReactNode;
  action: React.ReactNode;
  enableSwitch: React.ReactNode;
  children: React.ReactNode;
  className?: string; // Add className prop
}

export interface DisplayCardProps {
  showType?: boolean;
  onEdit: () => void;
  onEnable: () => Promise<void>;
  onDelete: () => Promise<void>;
  onEnableDebug: () => Promise<void>;
}

const DisplayCardContainer: React.FC<ContainerProps> = ({
  title: _title,
  action,
  tag,
  enableSwitch,
  children,
  className,
}) => {
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  return (
    <Card className={clsx(
      'backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm rounded-2xl overflow-hidden transition-all',
      hasBackground ? 'bg-white/20 dark:bg-black/10' : 'bg-white/60 dark:bg-black/40',
      className
    )}
    >
      <CardHeader className='p-4 pb-2 flex items-center justify-between gap-3'>
        {tag && (
          <div className='text-center text-default-500 font-medium mb-1 absolute top-0 left-1/2 -translate-x-1/2 text-xs pointer-events-none bg-default-200/50 dark:bg-default-100/50 backdrop-blur-sm px-3 py-0.5 rounded-b-lg shadow-sm z-10'>
            {tag}
          </div>
        )}
        <div className='flex-1 min-w-0 mr-2'>
          <div className='inline-flex items-center px-3 py-1 rounded-lg bg-default-100/50 dark:bg-white/10 border border-transparent dark:border-white/5'>
            <span className='font-bold text-default-600 dark:text-white/90 text-sm truncate select-text'>
              {_title}
            </span>
          </div>
        </div>
        <div className='flex-shrink-0'>{enableSwitch}</div>
      </CardHeader>
      <CardBody className='px-4 py-2 text-sm text-default-600'>{children}</CardBody>
      <CardFooter className='px-4 pb-4 pt-2'>{action}</CardFooter>
    </Card>
  );
};

export default DisplayCardContainer;
