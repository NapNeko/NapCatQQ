import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { useState } from 'react';
import { IoMdDownload, IoMdRefresh, IoMdCheckmarkCircle } from 'react-icons/io';
import { FaGithub } from 'react-icons/fa';

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
}) => {
  const { name, version, author, description, tags, id, homepage } = data;
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
          color: 'default' as const,
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
          {homepage && (
            <Tooltip content="仓库主页">
              <Button
                isIconOnly
                size='sm'
                variant='light'
                className='min-w-6 w-6 h-6 text-default-500 hover:text-default-700'
                onPress={() => window.open(homepage, '_blank')}
              >
                <FaGithub size={14} />
              </Button>
            </Tooltip>
          )}
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
      <div className='flex flex-col gap-2 h-[120px]'>
        {/* 作者和包名 */}
        <div className='flex items-center gap-2 text-xs text-default-500 dark:text-white/50'>
          <span>作者: <span className='text-default-700 dark:text-white/80'>{author || '未知'}</span></span>
          <span className='text-default-300'>·</span>
          <Tooltip content={id}>
            <span className='truncate max-w-[150px]'>{id}</span>
          </Tooltip>
        </div>

        {/* 描述 */}
        <div className='flex-1 p-3 bg-default-100/50 dark:bg-white/10 rounded-xl'>
          <div className='text-sm text-default-700 dark:text-white/90 break-words line-clamp-2'>
            {description || '暂无描述'}
          </div>
        </div>

        {/* 标签 */}
        <div className='flex flex-wrap gap-1 min-h-[24px]'>
          {tags && tags.length > 0 ? (
            tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                size='sm'
                variant='flat'
                className='text-xs'
              >
                {tag}
              </Chip>
            ))
          ) : (
            <span className='text-xs text-default-400'>暂无标签</span>
          )}
        </div>
      </div>
    </DisplayCardContainer>
  );
};

export default PluginStoreCard;
