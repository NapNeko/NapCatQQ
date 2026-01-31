import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { useState } from 'react';
import clsx from 'clsx';
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
}) => {
  const { name, version, author, description, tags, id, homepage } = data;
  const [processing, setProcessing] = useState(false);
  const displayId = id?.replace(/^napcat-plugin-/, '') || id;

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
      className='w-full max-w-[420px] md:max-w-[460px] lg:max-w-[520px] 2xl:max-w-[560px]'
      title={
        <div className="flex items-baseline gap-2">
          {homepage ? (
            <Tooltip content="打开插件主页">
              <span
                className="cursor-pointer hover:text-default-900 dark:hover:text-white transition-colors underline decoration-dashed decoration-default-400/70 underline-offset-4 hover:decoration-default-600"
                onClick={() => window.open(homepage, '_blank')}
              >
                {name}
              </span>
            </Tooltip>
          ) : (
            <span>{name}</span>
          )}
          <span className="text-[10px] font-normal text-default-400">v{version}</span>
        </div>
      }
      tag={
        <div className="ml-auto flex items-center gap-1">
          {installStatus === 'installed' && (
            <Chip
              color="success"
              size="sm"
              variant="flat"
              className="h-6 text-[10px] bg-success-50 dark:bg-success-500/10 text-success-600"
              startContent={<IoMdCheckmarkCircle size={12} />}
            >
              已安装
            </Chip>
          )}
          {installStatus === 'update-available' && (
            <Chip
              color="warning"
              size="sm"
              variant="flat"
              className="h-6 text-[10px] bg-warning-50 dark:bg-warning-500/10 text-warning-600"
            >
              可更新
            </Chip>
          )}
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
      <div className='flex flex-col gap-2 h-[132px]'>
        {/* 作者和包名 */}
        <div className='flex items-center gap-2 text-[12px] text-default-400'>
          <span className="flex items-center gap-1">
            作者: <span className='text-default-600 dark:text-white/70 font-medium'>{author || '未知'}</span>
          </span>
          <span className='text-default-300'>/</span>
          <Tooltip content={id}>
            <span className='truncate max-w-[160px] opacity-70 italic'>{displayId}</span>
          </Tooltip>
        </div>

        {/* 描述 */}
        <Tooltip content={description || '暂无描述'}>
          <div className='h-[62px] p-3 bg-default-100/30 dark:bg-white/5 rounded-xl border border-default-100 dark:border-white/5 flex items-center'>
            <div className='text-[14px] leading-relaxed text-default-600 dark:text-white/80 break-words line-clamp-2 text-center w-full'>
              {description || '暂无描述'}
            </div>
          </div>
        </Tooltip>

        {/* 标签栏 - 优化后的极简风格 */}
        <div className='flex flex-wrap gap-1.5 min-h-[20px] items-center pt-1'>
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => (
              <div 
                key={index}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-default-100/50 dark:bg-white/10 text-[11px] text-default-500 dark:text-white/60 border border-transparent hover:border-default-200 transition-all"
              >
                <span className={clsx(
                  "w-1 h-1 rounded-full",
                  tag === '官方' ? "bg-secondary-400" : 
                  tag === '工具' ? "bg-primary-400" : 
                  tag === '娱乐' ? "bg-warning-400" : "bg-default-400"
                )} />
                {tag}
              </div>
            ))
          ) : (
            <span className='text-[10px] text-default-300 italic'>no tags</span>
          )}
        </div>
      </div>
    </DisplayCardContainer>
  );
};

export default PluginStoreCard;
