import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import { Chip } from '@heroui/chip';

import { useState } from 'react';
import { MdDeleteForever, MdPublishedWithChanges, MdSettings } from 'react-icons/md';

import DisplayCardContainer from './container';
import { PluginItem } from '@/controllers/plugin_manager';

export interface PluginDisplayCardProps {
  data: PluginItem;
  onReload: () => Promise<void>;
  onToggleStatus: () => Promise<void>;
  onUninstall: () => Promise<void>;
  onConfig?: () => void;
  hasConfig?: boolean;
}

const PluginDisplayCard: React.FC<PluginDisplayCardProps> = ({
  data,
  onReload,
  onToggleStatus,
  onUninstall,
  onConfig,
  hasConfig = false,
}) => {
  const { name, version, author, description, status } = data;
  const isEnabled = status !== 'disabled';
  const [processing, setProcessing] = useState(false);

  const handleToggle = () => {
    setProcessing(true);
    onToggleStatus().finally(() => setProcessing(false));
  };

  const handleReload = () => {
    setProcessing(true);
    onReload().finally(() => setProcessing(false));
  };

  const handleUninstall = () => {
    setProcessing(true);
    onUninstall().finally(() => setProcessing(false));
  };

  return (
    <DisplayCardContainer
      className='w-full max-w-[420px]'
      action={
        <div className='flex flex-col gap-2 w-full'>
          <div className='flex gap-2 w-full'>
            <Button
              fullWidth
              radius='full'
              size='sm'
              variant='flat'
              className='flex-1 bg-default-100 dark:bg-default-50 text-default-600 font-medium hover:bg-primary/20 hover:text-primary transition-colors'
              startContent={<MdPublishedWithChanges size={16} />}
              onPress={handleReload}
              isDisabled={!isEnabled || processing}
            >
              重载
            </Button>

            <Button
              fullWidth
              radius='full'
              size='sm'
              variant='flat'
              className='flex-1 bg-default-100 dark:bg-default-50 text-default-600 font-medium hover:bg-danger/20 hover:text-danger transition-colors'
              startContent={<MdDeleteForever size={16} />}
              onPress={handleUninstall}
              isDisabled={processing}
            >
              卸载
            </Button>
          </div>
          {hasConfig && (
            <Button
              fullWidth
              radius='full'
              size='sm'
              variant='flat'
              className='bg-default-100 dark:bg-default-50 text-default-600 font-medium hover:bg-secondary/20 hover:text-secondary transition-colors'
              startContent={<MdSettings size={16} />}
              onPress={onConfig}
            >
              配置
            </Button>
          )}
        </div>
      }
      enableSwitch={
        <Switch
          isDisabled={processing}
          isSelected={isEnabled}
          onChange={handleToggle}
          classNames={{
            wrapper: 'group-data-[selected=true]:bg-primary-400',
          }}
        />
      }
      title={name}
      tag={
        <Chip
          className="ml-auto"
          color={status === 'active' ? 'success' : status === 'stopped' ? 'warning' : 'default'}
          size="sm"
          variant="flat"
        >
          {status === 'active' ? '运行中' : status === 'stopped' ? '已停止' : '已禁用'}
        </Chip>
      }
    >
      <div className='grid grid-cols-2 gap-3'>
        <div className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
          <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
            版本
          </span>
          <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
            {version}
          </div>
        </div>
        <div className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
          <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
            作者
          </span>
          <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
            {author || '未知'}
          </div>
        </div>
        <div className='col-span-2 flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
          <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
            描述
          </span>
          <div className='text-sm font-medium text-default-700 dark:text-white/90 break-words line-clamp-2'>
            {description || '暂无描述'}
          </div>
        </div>
      </div>
    </DisplayCardContainer>
  );
};

export default PluginDisplayCard;
