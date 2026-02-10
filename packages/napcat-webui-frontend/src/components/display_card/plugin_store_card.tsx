/* eslint-disable @stylistic/indent */
import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { MdUpdate, MdOutlineGetApp } from 'react-icons/md';
import clsx from 'clsx';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';

import key from '@/const/key';
import { PluginStoreItem } from '@/types/plugin-store';

export type InstallStatus = 'not-installed' | 'installed' | 'update-available';

/** 提取作者头像 URL */
function getAuthorAvatar (homepage?: string, downloadUrl?: string): string | undefined {
  // 1. 尝试从 downloadUrl 提取 GitHub 用户名 (通常是最准确的源码仓库所有者)
  if (downloadUrl) {
    try {
      const url = new URL(downloadUrl);
      if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 1) {
          return `https://github.com/${parts[0]}.png`;
        }
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 2. 尝试从 homepage 提取
  if (homepage) {
    try {
      const url = new URL(homepage);
      if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 1) {
          return `https://github.com/${parts[0]}.png`;
        }
      } else {
        // 如果是自定义域名，尝试获取 favicon。使用主流的镜像服务以保证国内访问速度
        return `https://api.iowen.cn/favicon/${url.hostname}.png`;
      }
    } catch {
      // 忽略解析错误
    }
  }
  return undefined;
}

export interface PluginStoreCardProps {
  data: PluginStoreItem;
  onInstall: () => void;
  onViewDetail?: () => void;
  installStatus?: InstallStatus;
  installedVersion?: string;
}

const PluginStoreCard: React.FC<PluginStoreCardProps> = ({
  data,
  onInstall,
  onViewDetail,
  installStatus = 'not-installed',
  installedVersion,
}) => {
  const { name, version, author, description, tags, homepage, downloadUrl } = data;
  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const [isExpanded, setIsExpanded] = useState(false);
  const hasBackground = !!backgroundImage;

  // 综合尝试提取头像，最后兜底使用 Vercel 风格头像
  const avatarUrl = getAuthorAvatar(homepage, downloadUrl) || `https://avatar.vercel.sh/${encodeURIComponent(name)}`;

  // 作者链接组件
  const AuthorComponent = (
    <span className={clsx('font-medium transition-colors', homepage ? 'hover:text-primary hover:underline cursor-pointer' : '')}>
      {author || '未知作者'}
    </span>
  );

  return (
    <Card
      className={clsx(
        'group w-full backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        // 降低边框粗细
        'border border-white/50 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50',
        hasBackground ? 'bg-white/20 dark:bg-black/10' : 'bg-white/60 dark:bg-black/30'
      )}
      shadow='sm'
    >
      <CardBody
        className={clsx('p-4 flex flex-col gap-3', onViewDetail && 'cursor-pointer')}
        onClick={onViewDetail}
      >
        {/* Header: Avatar + Name + Author */}
        <div className='flex items-start gap-3'>
          <Avatar
            src={avatarUrl}
            name={author || '?'}
            size='md'
            isBordered
            color='default'
            radius='full' // 圆形头像
            className='flex-shrink-0 transition-transform group-hover:scale-105'
          />
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1.5 min-w-0'>
                {homepage
                  ? (
                    <Tooltip content='访问项目主页' placement='top' delay={500}>
                      <a
                        href={homepage}
                        target='_blank'
                        rel='noreferrer'
                        className='text-base font-bold text-default-900 hover:text-primary transition-colors truncate'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {name}
                      </a>
                    </Tooltip>
                  )
                  : (
                    <h3 className='text-base font-bold text-default-900 truncate' title={name}>
                      {name}
                    </h3>
                  )}
              </div>
            </div>

            {/* 可点击的作者名称 */}
            <div className='text-xs text-default-500 mt-0.5 truncate'>
              by {homepage
                ? (
                  <a
                    href={homepage}
                    target='_blank'
                    rel='noreferrer'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {AuthorComponent}
                  </a>
                )
                : AuthorComponent}
            </div>
          </div>
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

        {/* Tags & Version */}
        <div className='flex items-center gap-1.5 flex-wrap'>
          <Chip
            size='sm'
            variant='flat'
            color='primary'
            className='h-5 text-xs font-semibold px-0.5'
            classNames={{ content: 'px-1' }}
          >
            v{version}
          </Chip>

          {/* Tags with proper truncation and hover */}
          {tags?.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              size='sm'
              variant='flat'
              className='h-5 text-xs px-0.5 bg-default-100 dark:bg-default-50/50 text-default-600'
              classNames={{ content: 'px-1' }}
            >
              {tag}
            </Chip>
          ))}

          {tags && tags.length > 2 && (
            <Tooltip
              content={
                <div className='flex flex-wrap gap-1 max-w-[200px] p-1'>
                  {tags.map(t => (
                    <span key={t} className='text-xs bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10'>
                      {t}
                    </span>
                  ))}
                </div>
              }
              delay={0}
              closeDelay={0}
            >
              <Chip
                size='sm'
                variant='flat'
                className='h-5 text-xs px-0.5 cursor-pointer hover:bg-default-200 transition-colors'
                classNames={{ content: 'px-1' }}
              >
                +{tags.length - 2}
              </Chip>
            </Tooltip>
          )}

          {installStatus === 'update-available' && installedVersion && (
            <Chip
              size='sm'
              variant='shadow'
              color='warning'
              className='h-5 text-xs font-semibold px-0.5 ml-auto animate-pulse'
              classNames={{ content: 'px-1' }}
            >
              新版本
            </Chip>
          )}
        </div>
      </CardBody>

      <CardFooter className='px-4 pb-4 pt-0'>
        {installStatus === 'installed'
          ? (
            <Button
              fullWidth
              radius='full'
              size='sm'
              color='success'
              variant='flat'
              startContent={<IoMdCheckmarkCircle size={18} />}
              className='font-medium bg-success/20 text-success dark:bg-success/20 cursor-default'
              isDisabled
            >
              已安装
            </Button>
          )
          : installStatus === 'update-available'
            ? (
              <Button
                fullWidth
                radius='full'
                size='sm'
                color='warning'
                variant='shadow'
                className='font-medium text-white shadow-warning/30 hover:shadow-warning/50 transition-shadow'
                startContent={<MdUpdate size={18} />}
                onPress={(e) => {
                  e.stopPropagation();
                  onInstall();
                }}
              >
                更新到 v{version}
              </Button>
            )
            : (
              <Button
                fullWidth
                radius='full'
                size='sm'
                color='primary'
                variant='bordered'
                className='font-medium bg-white dark:bg-zinc-900 border hover:bg-primary hover:text-white transition-all shadow-sm group/btn'
                startContent={<MdOutlineGetApp size={20} className='transition-transform group-hover/btn:translate-y-0.5' />}
                onPress={(e) => {
                  e.stopPropagation();
                  onInstall();
                }}
              >
                立即安装
              </Button>
            )}
      </CardFooter>
    </Card>
  );
};

export default PluginStoreCard;
