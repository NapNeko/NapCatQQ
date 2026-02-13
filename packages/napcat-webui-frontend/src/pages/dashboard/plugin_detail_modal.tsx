import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Tooltip } from '@heroui/tooltip';
import { Spinner } from '@heroui/spinner';
import { IoMdCheckmarkCircle, IoMdOpen, IoMdDownload } from 'react-icons/io';
import { MdUpdate } from 'react-icons/md';
import { FaNpm } from 'react-icons/fa';
import { useState, useEffect } from 'react';

import { PluginStoreItem } from '@/types/plugin-store';
import { InstallStatus } from '@/components/display_card/plugin_store_card';
import TailwindMarkdown from '@/components/tailwind_markdown';
import PluginManagerController from '@/controllers/plugin_manager';

interface PluginDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugin: PluginStoreItem | null;
  installStatus?: InstallStatus;
  installedVersion?: string;
  onInstall?: () => void;
}

/** 提取作者头像 URL */
function getAuthorAvatar (homepage?: string, downloadUrl?: string): string | undefined {
  // 1. 尝试从 downloadUrl 提取 GitHub 用户名
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
        return `https://api.iowen.cn/favicon/${url.hostname}.png`;
      }
    } catch {
      // 忽略解析错误
    }
  }
  return undefined;
}

/** 提取 GitHub 仓库信息 */
function extractGitHubRepo (url?: string): { owner: string; repo: string; } | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'github.com' || urlObj.hostname === 'www.github.com') {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
  } catch {
    // 忽略解析错误
  }
  return null;
}

/** 从 GitHub API 获取 README */
async function fetchGitHubReadme (owner: string, repo: string): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: {
      Accept: 'application/vnd.github.v3.raw',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch README');
  }
  return response.text();
}

/** 清理 README 中的 HTML 标签，保留 Markdown */
function cleanReadmeHtml (content: string): string {
  // 移除 HTML 注释
  let cleaned = content.replace(/<!--[\s\S]*?-->/g, '');

  // 保留常见的 Markdown 友好的 HTML 标签（img, br），其他的移除标签但保留内容
  // 移除 style 和 script 标签及其内容
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // 将其他 HTML 标签替换为空格或换行（保留内容）
  // 保留 img 标签（转为 markdown）- 尝试提取 alt 和 src 属性
  cleaned = cleaned.replace(/<img[^>]*\\bsrc=["']([^"']+)["'][^>]*\\balt=["']([^"']+)["'][^>]*>/gi, '![$2]($1)');
  cleaned = cleaned.replace(/<img[^>]*\\balt=["']([^"']+)["'][^>]*\\bsrc=["']([^"']+)["'][^>]*>/gi, '![$1]($2)');
  cleaned = cleaned.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, '![]($1)');

  // 移除其他 HTML 标签，但保留内容
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');

  // 清理多余的空行（超过2个连续换行）
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

export default function PluginDetailModal ({
  isOpen,
  onClose,
  plugin,
  installStatus = 'not-installed',
  installedVersion,
  onInstall,
}: PluginDetailModalProps) {
  const [readme, setReadme] = useState<string>('');
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState(false);

  // 判断插件来源
  const isNpmSource = plugin?.source === 'npm';

  // 获取 GitHub 仓库信息（需要在 hooks 之前计算）
  const githubRepo = plugin ? extractGitHubRepo(plugin.homepage) : null;

  // 当模态框打开时，获取 README（npm 或 GitHub）
  useEffect(() => {
    if (!isOpen || !plugin) {
      setReadme('');
      setReadmeError(false);
      return;
    }

    const loadReadme = async () => {
      setReadmeLoading(true);
      setReadmeError(false);
      try {
        if (isNpmSource && plugin.npmPackage) {
          // npm 来源：从后端获取 npm 包详情中的 README
          const detail = await PluginManagerController.getNpmPluginDetail(plugin.npmPackage);
          if (detail?.readme) {
            setReadme(cleanReadmeHtml(detail.readme));
          } else {
            setReadmeError(true);
          }
        } else if (githubRepo) {
          // GitHub 来源：从 GitHub API 获取 README
          const content = await fetchGitHubReadme(githubRepo.owner, githubRepo.repo);
          setReadme(cleanReadmeHtml(content));
        } else {
          // 无可用的 README 来源
          setReadme('');
        }
      } catch (error) {
        console.error('Failed to fetch README:', error);
        setReadmeError(true);
      } finally {
        setReadmeLoading(false);
      }
    };

    loadReadme();
  }, [isOpen, plugin?.id, isNpmSource, plugin?.npmPackage, githubRepo?.owner, githubRepo?.repo]);

  if (!plugin) return null;

  const { name, version, author, description, tags, homepage, downloadUrl, minVersion, npmPackage } = plugin;
  const avatarUrl = getAuthorAvatar(homepage, downloadUrl) || `https://avatar.vercel.sh/${encodeURIComponent(name)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='4xl'
      scrollBehavior='inside'
      classNames={{
        backdrop: 'z-[200]',
        wrapper: 'z-[200]',
      }}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className='flex flex-col gap-3 pb-2'>
              {/* 插件头部信息 */}
              <div className='flex items-start gap-4'>
                <Avatar
                  src={avatarUrl}
                  name={author || '?'}
                  size='lg'
                  isBordered
                  color='primary'
                  radius='lg'
                  className='flex-shrink-0'
                />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <h2 className='text-2xl font-bold text-default-900'>{name}</h2>
                    {homepage && (
                      <Tooltip content='访问项目主页'>
                        <Button
                          isIconOnly
                          size='sm'
                          variant='flat'
                          color='primary'
                          as='a'
                          href={homepage}
                          target='_blank'
                          rel='noreferrer'
                        >
                          <IoMdOpen size={18} />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                  <p className='text-sm text-default-500 mt-1'>
                    by <span className='font-medium'>{author || '未知作者'}</span>
                  </p>

                  {/* 标签和版本信息 */}
                  <div className='flex items-center gap-2 mt-2 flex-wrap'>
                    <Chip size='sm' color='primary' variant='flat'>
                      v{version}
                    </Chip>
                    {isNpmSource && (
                      <Chip
                        size='sm'
                        color='danger'
                        variant='flat'
                        startContent={<FaNpm size={14} />}
                      >
                        npm
                      </Chip>
                    )}
                    {tags?.map((tag) => (
                      <Chip
                        key={tag}
                        size='sm'
                        variant='flat'
                        className='bg-default-100 text-default-600'
                      >
                        {tag}
                      </Chip>
                    ))}
                    {installStatus === 'update-available' && installedVersion && (
                      <Chip
                        size='sm'
                        color='warning'
                        variant='shadow'
                        className='animate-pulse'
                      >
                        可更新
                      </Chip>
                    )}
                    {installStatus === 'installed' && (
                      <Chip
                        size='sm'
                        color='success'
                        variant='flat'
                        startContent={<IoMdCheckmarkCircle size={14} />}
                      >
                        已安装
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className='gap-4'>
              {/* 插件描述 */}
              <div>
                <h3 className='text-sm font-semibold text-default-700 mb-2'>插件描述</h3>
                <p className='text-sm text-default-600 leading-relaxed'>
                  {description || '暂无描述'}
                </p>
              </div>

              {/* 插件信息 */}
              <div>
                <h3 className='text-sm font-semibold text-default-700 mb-3'>插件信息</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='text-default-500'>最新版本:</span>
                    <span className='font-medium text-default-900'>v{version}</span>
                  </div>
                  {installedVersion && (
                    <div className='flex justify-between items-center'>
                      <span className='text-default-500'>已安装版本:</span>
                      <span className='font-medium text-default-900'>v{installedVersion}</span>
                    </div>
                  )}
                  {minVersion && (
                    <div className='flex justify-between items-center'>
                      <span className='text-default-500'>最低要求版本:</span>
                      <span className='font-medium text-default-900'>v{minVersion}</span>
                    </div>
                  )}
                  <div className='flex justify-between items-center'>
                    <span className='text-default-500'>插件 ID:</span>
                    <span className='font-mono text-xs text-default-900'>{plugin.id}</span>
                  </div>
                  {npmPackage && (
                    <div className='flex justify-between items-center'>
                      <span className='text-default-500'>npm 包名:</span>
                      <Button
                        size='sm'
                        variant='flat'
                        color='danger'
                        as='a'
                        href={`https://www.npmjs.com/package/${npmPackage}`}
                        target='_blank'
                        rel='noreferrer'
                        startContent={<FaNpm size={14} />}
                      >
                        {npmPackage}
                      </Button>
                    </div>
                  )}
                  {downloadUrl && (
                    <div className='flex justify-between items-center'>
                      <span className='text-default-500'>下载地址:</span>
                      <Button
                        size='sm'
                        variant='flat'
                        color='primary'
                        as='a'
                        href={downloadUrl}
                        target='_blank'
                        rel='noreferrer'
                        startContent={<IoMdDownload size={14} />}
                      >
                        下载插件
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* README 显示（支持 npm 和 GitHub） */}
              {(githubRepo || isNpmSource) && (
                <>
                  <div className='mt-2'>
                    <h3 className='text-sm font-semibold text-default-700 mb-3'>详情</h3>
                    {readmeLoading && (
                      <div className='flex justify-center items-center py-12'>
                        <Spinner size='lg' />
                      </div>
                    )}
                    {readmeError && (
                      <div className='text-center py-8'>
                        <p className='text-sm text-default-500 mb-3'>
                          无法加载 README
                        </p>
                        {homepage && (
                          <Button
                            color='primary'
                            variant='flat'
                            as='a'
                            href={homepage}
                            target='_blank'
                            rel='noreferrer'
                            startContent={<IoMdOpen />}
                          >
                            {isNpmSource ? '在 npm 查看' : '在 GitHub 查看'}
                          </Button>
                        )}
                      </div>
                    )}
                    {!readmeLoading && !readmeError && readme && (
                      <div className='rounded-lg border border-default-200 p-4 bg-default-50'>
                        <TailwindMarkdown content={readme} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant='light' onPress={onModalClose}>
                关闭
              </Button>
              {installStatus === 'installed'
                ? (
                  <Button
                    color='success'
                    variant='flat'
                    startContent={<IoMdCheckmarkCircle size={18} />}
                    isDisabled
                  >
                    已安装
                  </Button>
                )
                : installStatus === 'update-available'
                  ? (
                    <Button
                      color='warning'
                      variant='shadow'
                      startContent={<MdUpdate size={18} />}
                      onPress={() => {
                        onInstall?.();
                        onModalClose();
                      }}
                    >
                      更新到 v{version}
                    </Button>
                  )
                  : (
                    <Button
                      color='primary'
                      variant='shadow'
                      startContent={<IoMdDownload size={18} />}
                      onPress={() => {
                        onInstall?.();
                        onModalClose();
                      }}
                    >
                      立即安装
                    </Button>
                  )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
