import { Button } from '@heroui/button';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { IoMdRefresh } from 'react-icons/io';

export interface SaveButtonsProps {
  onSubmit: () => void;
  reset: () => void;
  refresh?: () => void;
  isSubmitting: boolean;
  className?: string;
}

const SaveButtons: React.FC<SaveButtonsProps> = ({
  onSubmit,
  reset,
  isSubmitting,
  refresh,
  className,
}) => (
  <div
    className={clsx(
      'w-full flex flex-col justify-center gap-3',
      className
    )}
  >
    <div className='flex items-center justify-center gap-2 mt-5'>
      <Button
        radius="full"
        variant="flat"
        className="font-medium bg-default-100 text-default-600 dark:bg-default-50/50"
        onPress={() => {
          reset();
          toast.success('重置成功');
        }}
      >
        取消更改
      </Button>
      <Button
        color='primary'
        radius="full"
        className="font-medium shadow-md shadow-primary/20"
        isLoading={isSubmitting}
        onPress={() => onSubmit()}
      >
        保存
      </Button>
      {refresh && (
        <Button
          isIconOnly
          radius='full'
          variant='flat'
          className="text-default-500 bg-default-100 dark:bg-default-50/50"
          onPress={() => refresh()}
        >
          <IoMdRefresh size={20} />
        </Button>
      )}
    </div>
  </div>
);

export default SaveButtons;
