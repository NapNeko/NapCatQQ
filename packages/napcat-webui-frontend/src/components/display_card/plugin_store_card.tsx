import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { useState } from 'react';
import { IoMdDownload, IoMdRefresh, IoMdCheckmarkCircle } from 'react-icons/io';

import DisplayCardContainer from './container';
import { PluginStoreItem } from '@/types/plugin-store';

export type InstallStatus = 'not-installed' | 'installed' | 'update-available';

export interface PluginStoreCardProps {
  data: PluginStoreItem;
  onInstall: () => Promise<void>;
  installStatus?: InstallStatus;
  installedVersion?: string;
}

const PluginStoreCard: React.FC<PluginStoreCardProps> = ({
  data,
  onInstall,
  installStatus = 'not-installed',
  installedVersion,
}) => {
  const { name, version, author, description, tags, id } = data;
  const [processing, setProcessing] = useState(false);

  const handleInstall = () => {
    setProcessing(true);
    onInstall().finally(() => setProcessing(false));
  };

  // 根据安装状态返回按钮配置
  const getButtonConfig = () => {
    switch (installStatus) {
      case 'installed':
        return {
          text: '重新安装',
          icon: <IoMdRefresh size={16} />,
          color: 'default' as const,
        };
      case 'update-available':
        return {
          text: '更新',
          icon: <IoMdDownload size={16} />,
          color: 'success' as const,
        };
      default:
        return {
          text: '安装',
          icon: <IoMdDownload size={16} />,
          color: 'primary' as const,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <DisplayCardContainer
      className='w-full max-w-[420px]'
      title={name}
      tag={
        <div className="ml-auto flex items-center gap-1">
          {installStatus === 'installed' && (
            <Chip
              color="success"
              size="sm"
              variant="flat"
              startContent={<IoMdCheckmarkCircle size={14} />}
            >
              已安装
            </Chip>
          )}
          {installStatus === 'update-available' && (
            <Chip
              color="warning"
              size="sm"
              variant="flat"
            >
              可更新
            </Chip>
          )}
          <Chip
            color="primary"
            size="sm"
            variant="flat"
          >
            v{version}
          </Chip>
        </div>
      }
      enableSwitch={undefined}
      action={
        <Button
          fullWidth
          radius='full'
          size='sm'
          color={buttonConfig.color}
          startContent={buttonConfig.icon}
          onPress={handleInstall}
          isLoading={processing}
          isDisabled={processing}
        >
          {buttonConfig.text}
        </Button>
      }
    >
      <div className='grid grid-cols-2 gap-3'>
        <div className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
          <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
            作者
          </span>
          <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
            {author || '未知'}
          </div>
        </div>
        <div className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
          <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
            版本
          </span>
          <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
            v{version}
          </div>
        </div>
        <div className='col-span-2 flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
          <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
            描述
          </span>
          <div className='text-sm font-medium text-default-700 dark:text-white/90 break-words line-clamp-2 h-10 overflow-hidden'>
            {description || '暂无描述'}
          </div>
        </div>
        {id && (
          <div className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
            <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
              包名
            </span>
            <div className='text-sm font-medium text-default-700 dark:text-white/90 break-words line-clamp-2 h-10 overflow-hidden'>
              {id || '包名'}
            </div>
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className='flex flex-col gap-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl border border-transparent hover:border-default-200 transition-colors'>
            <span className='text-xs text-default-500 dark:text-white/50 font-medium tracking-wide'>
              标签
            </span>
            <div className='text-sm font-medium text-default-700 dark:text-white/90 truncate'>
              {tags.slice(0, 2).join(' · ')}
            </div>
          </div>
        )}
      </div>
    </DisplayCardContainer>
  );
};

export default PluginStoreCard;
