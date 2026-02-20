import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Switch } from '@heroui/switch';
import { Tooltip } from '@heroui/tooltip';
import { MdDeleteForever, MdSettings } from 'react-icons/md';
import clsx from 'clsx';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';

import key from '@/const/key';
import { PluginItem } from '@/controllers/plugin_manager';
import { getPluginIconUrl } from '@/utils/plugin_icon';

export interface PluginDisplayCardProps {
  data: PluginItem;
  onToggleStatus: () => Promise<void>;
  onUninstall: () => Promise<void>;
  onConfig?: () => void;
  hasConfig?: boolean;
}

const PluginDisplayCard: React.FC<PluginDisplayCardProps> = ({
  data,
  onToggleStatus,
  onUninstall,
  onConfig,
  hasConfig = false,
}) => {
  const { name, version, author, description, status, icon } = data;
  const isEnabled = status === 'active';
  const [processing, setProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  // 后端已处理 icon，前端只需拼接 token；无 icon 时兜底 Vercel 风格头像
  const avatarUrl = getPluginIconUrl(icon) || `https://avatar.vercel.sh/${encodeURIComponent(name)}`;

  const handleToggle = () => {
    setProcessing(true);
    onToggleStatus().finally(() => setProcessing(false));
  };

  const handleUninstall = () => {
    setProcessing(true);
    onUninstall().finally(() => setProcessing(false));
  };

  return (
    <Card
      className={clsx(
        'group w-full backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        'border border-white/50 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50',
        hasBackground ? 'bg-white/20 dark:bg-black/10' : 'bg-white/60 dark:bg-black/30'
      )}
      shadow='sm'
    >
      <CardBody className='p-4 flex flex-col gap-3'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <Avatar
              src={avatarUrl}
              name={author || '?'}
              className='flex-shrink-0'
              size='md'
              isBordered
              radius='full'
              color='default'
            />
            <div className='min-w-0'>
              <h3 className='text-base font-bold text-default-900 truncate' title={name}>
                {name}
              </h3>
              <p className='text-xs text-default-500 mt-0.5 truncate'>
                by <span className='font-medium'>{author || '未知'}</span>
              </p>
            </div>
          </div>

          <Chip
            size='sm'
            variant='flat'
            color={status === 'active' ? 'success' : status === 'stopped' ? 'warning' : 'default'}
            className='flex-shrink-0 font-medium h-6 px-1'
          >
            {status === 'active' ? '运行中' : status === 'stopped' ? '已停止' : '已禁用'}
          </Chip>
        </div>

        {/* Description */}
        <div
          className='relative min-h-[2.5rem] cursor-pointer group/desc'
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Tooltip
            content={description}
            isDisabled={!description || description.length < 50 || isExpanded}
            placement='bottom'
            className='max-w-[280px]'
            delay={500}
          >
            <p className={clsx(
              'text-sm text-default-600 dark:text-default-400 leading-relaxed transition-all duration-300',
              isExpanded ? 'line-clamp-none' : 'line-clamp-2'
            )}
            >
              {description || '暂无描述'}
            </p>
          </Tooltip>
        </div>

        {/* Version Badge */}
        <div>
          <Chip
            size='sm'
            variant='flat'
            color='primary'
            className='h-5 text-xs font-semibold px-0.5'
            classNames={{ content: 'px-1' }}
          >
            v{version}
          </Chip>
        </div>
      </CardBody>

      <CardFooter className='px-4 pb-4 pt-0 gap-3'>
        <Switch
          isDisabled={processing}
          isSelected={isEnabled}
          onValueChange={handleToggle}
          size='sm'
          color='success'
          classNames={{
            wrapper: 'group-data-[selected=true]:bg-success',
          }}
        >
          <span className='text-xs font-medium text-default-600'>
            {isEnabled ? '已启用' : '已禁用'}
          </span>
        </Switch>

        <div className='flex-1' />

        {hasConfig && (
          <Tooltip content='插件配置'>
            <Button
              isIconOnly
              radius='full'
              size='sm'
              variant='light'
              color='primary'
              onPress={onConfig}
            >
              <MdSettings size={20} />
            </Button>
          </Tooltip>
        )}

        <Tooltip content='卸载插件' color='danger'>
          <Button
            isIconOnly
            radius='full'
            size='sm'
            variant='light'
            color='danger'
            onPress={handleUninstall}
            isDisabled={processing}
          >
            <MdDeleteForever size={20} />
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};

export default PluginDisplayCard;
