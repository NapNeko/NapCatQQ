import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Tab, Tabs } from '@heroui/tabs';
import { Tooltip } from '@heroui/tooltip';
import { Spinner } from '@heroui/spinner';
import { Pagination } from '@heroui/pagination';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh, IoMdSearch, IoMdSettings } from 'react-icons/io';
import clsx from 'clsx';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useSearchParams } from 'react-router-dom';

import PluginStoreCard, { InstallStatus } from '@/components/display_card/plugin_store_card';
import PluginManager, { PluginItem } from '@/controllers/plugin_manager';
import MirrorSelectorModal from '@/components/mirror_selector_modal';
import PluginDetailModal from '@/pages/dashboard/plugin_detail_modal';
import { PluginStoreItem } from '@/types/plugin-store';
import useDialog from '@/hooks/use-dialog';
import key from '@/const/key';

/** Fisher-Yates 洗牌算法，返回新数组 */
function shuffleArray<T> (arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface EmptySectionProps {
  isEmpty: boolean;
}

const EmptySection: React.FC<EmptySectionProps> = ({ isEmpty }) => {
  return (
    <div
      className={clsx('text-default-400', {
        hidden: !isEmpty,
      })}
    >
      暂时没有可用的插件
    </div>
  );
};

export default function PluginStorePage () {
  const [plugins, setPlugins] = useState<PluginStoreItem[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [pluginManagerNotFound, setPluginManagerNotFound] = useState(false);
  const dialog = useDialog();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // 快捷键支持: Ctrl+F 聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 进度条相关状态
  const [installProgress, setInstallProgress] = useState<{
    show: boolean;
    message: string;
    progress: number;
    speedStr?: string;
    eta?: number;
    downloadedStr?: string;
    totalStr?: string;
  }>({
    show: false,
    message: '',
    progress: 0,
  });

  // 商店列表源相关状态
  const [storeSourceModalOpen, setStoreSourceModalOpen] = useState(false);
  const [currentStoreSource, setCurrentStoreSource] = useState<string | undefined>(undefined);

  // 下载镜像弹窗状态（安装时使用）
  const [downloadMirrorModalOpen, setDownloadMirrorModalOpen] = useState(false);
  const [pendingInstallPlugin, setPendingInstallPlugin] = useState<PluginStoreItem | null>(null);
  const [selectedDownloadMirror, setSelectedDownloadMirror] = useState<string | undefined>(undefined);

  // 插件详情弹窗状态
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginStoreItem | null>(null);

  // 分页状态
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const loadPlugins = async (forceRefresh: boolean = false) => {
    setLoading(true);
    try {
      const data = await PluginManager.getPluginStoreList(forceRefresh);
      setPlugins(data.plugins);

      // 检查插件管理器是否已加载
      const listResult = await PluginManager.getPluginList();
      setPluginManagerNotFound(listResult.pluginManagerNotFound);
      setInstalledPlugins(listResult.plugins || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, [currentStoreSource]);

  // 处理 URL 参数中的插件 ID，自动打开详情
  useEffect(() => {
    const pluginId = searchParams.get('pluginId');
    if (pluginId && plugins.length > 0 && !detailModalOpen) {
      // 查找对应的插件
      const targetPlugin = plugins.find(p => p.id === pluginId);
      if (targetPlugin) {
        setSelectedPlugin(targetPlugin);
        setDetailModalOpen(true);
        // 移除 URL 参数（可选）
        // searchParams.delete('pluginId');
        // setSearchParams(searchParams);
      }
    }
  }, [plugins, searchParams, detailModalOpen]);

  // 按标签分类和搜索
  const categorizedPlugins = useMemo(() => {
    let filtered = plugins;

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 定义主要分类
    const categories: Record<string, PluginStoreItem[]> = {
      all: filtered,
      official: filtered.filter(p => p.tags?.includes('官方')),
      tools: filtered.filter(p => p.tags?.includes('工具')),
      entertainment: filtered.filter(p => p.tags?.includes('娱乐')),
      other: filtered.filter(p => !p.tags?.some(t => ['官方', '工具', '娱乐'].includes(t))),
      random: shuffleArray(filtered),
    };

    return categories;
  }, [plugins, searchQuery]);

  // 获取插件的安装状态和已安装版本
  const getPluginInstallInfo = (plugin: PluginStoreItem): { status: InstallStatus; installedVersion?: string; } => {
    // 通过 id (包名) 或 name 匹配已安装的插件
    // 优先匹配 ID，如果 ID 匹配失败尝试匹配名称（兼容某些 ID 不一致的情况）
    const installed = installedPlugins.find(p => p.id === plugin.id || p.name === plugin.name);

    if (!installed) {
      return { status: 'not-installed' };
    }

    // 使用不等于判断：版本不同就显示更新
    if (installed.version !== plugin.version) {
      return { status: 'update-available', installedVersion: installed.version };
    }

    return { status: 'installed', installedVersion: installed.version };
  };

  const tabs = useMemo(() => {
    return [
      { key: 'all', title: '全部', count: categorizedPlugins.all?.length || 0 },
      { key: 'official', title: '官方', count: categorizedPlugins.official?.length || 0 },
      { key: 'tools', title: '工具', count: categorizedPlugins.tools?.length || 0 },
      { key: 'entertainment', title: '娱乐', count: categorizedPlugins.entertainment?.length || 0 },
      { key: 'other', title: '其它', count: categorizedPlugins.other?.length || 0 },
      { key: 'random', title: '随机', count: categorizedPlugins.random?.length || 0 },
    ];
  }, [categorizedPlugins]);

  // 当前分类的总数和分页数据
  const currentCategoryPlugins = useMemo(() => categorizedPlugins[activeTab] || [], [categorizedPlugins, activeTab]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(currentCategoryPlugins.length / ITEMS_PER_PAGE)), [currentCategoryPlugins.length]);
  const paginatedPlugins = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentCategoryPlugins.slice(start, start + ITEMS_PER_PAGE);
  }, [currentCategoryPlugins, currentPage]);

  // 切换分类或搜索时重置页码
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  }, []);

  // 搜索变化时重置页码
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleInstall = async (plugin: PluginStoreItem) => {
    // 弹窗选择下载镜像
    setPendingInstallPlugin(plugin);
    setDownloadMirrorModalOpen(true);
  };

  const installPluginWithSSE = async (pluginId: string, mirror?: string) => {
    const loadingToast = toast.loading('正在准备安装...');

    try {
      // 获取认证 token
      const token = localStorage.getItem(key.token);
      if (!token) {
        toast.error('未登录，请先登录', { id: loadingToast });
        return;
      }
      const _token = JSON.parse(token);

      const params = new URLSearchParams({ id: pluginId });
      if (mirror) {
        params.append('mirror', mirror);
      }

      const eventSource = new EventSourcePolyfill(
        `/api/Plugin/Store/Install/SSE?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${_token}`,
            Accept: 'text/event-stream',
          },
          withCredentials: true,
        }
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            toast.error(`安装失败: ${data.error}`, { id: loadingToast });
            setInstallProgress(prev => ({ ...prev, show: false }));
            eventSource.close();
          } else if (data.success) {
            toast.success('插件安装成功！', { id: loadingToast });
            setInstallProgress(prev => ({ ...prev, show: false }));
            eventSource.close();
            // 刷新插件列表
            loadPlugins();
            // 安装成功后检查插件管理器状态
            if (pluginManagerNotFound) {
              dialog.confirm({
                title: '插件管理器未加载',
                content: (
                  <div className='space-y-2'>
                    <p className='text-sm text-default-600'>
                      插件已安装成功，但插件管理器尚未加载。
                    </p>
                    <p className='text-sm text-default-600'>
                      是否立即注册插件管理器？注册后插件才能正常运行。
                    </p>
                  </div>
                ),
                confirmText: '注册插件管理器',
                cancelText: '稍后再说',
                onConfirm: () => {
                  (async () => {
                    try {
                      await PluginManager.registerPluginManager();
                      toast.success('插件管理器注册成功');
                      setPluginManagerNotFound(false);
                    } catch (e: any) {
                      toast.error('注册失败: ' + e.message);
                    }
                  })();
                },
              });
            }
          } else if (data.message) {
            if (typeof data.progress === 'number' && data.progress >= 0 && data.progress <= 100) {
              setInstallProgress((prev) => ({
                ...prev,
                show: true,
                message: data.message,
                progress: data.progress,
                // 保存下载详情，避免被后续非下载步骤的消息清空
                speedStr: data.speedStr || (data.message.includes('下载') ? prev.speedStr : undefined),
                eta: data.eta !== undefined ? data.eta : (data.message.includes('下载') ? prev.eta : undefined),
                downloadedStr: data.downloadedStr || (data.message.includes('下载') ? prev.downloadedStr : undefined),
                totalStr: data.totalStr || (data.message.includes('下载') ? prev.totalStr : undefined),
              }));
            } else {
              toast.loading(data.message, { id: loadingToast });
            }
          }
        } catch (e) {
          console.error('Failed to parse SSE message:', e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE连接出错:', error);
        toast.error('连接中断，安装失败', { id: loadingToast });
        setInstallProgress(prev => ({ ...prev, show: false }));
        eventSource.close();
      };
    } catch (error: any) {
      toast.error(`安装失败: ${error.message || '未知错误'}`, { id: loadingToast });
    }
  };

  const getStoreSourceDisplayName = () => {
    if (!currentStoreSource) return '默认源';
    try {
      return new URL(currentStoreSource).hostname;
    } catch {
      return currentStoreSource;
    }
  };

  const [backgroundImage] = useLocalStorage<string>(key.backgroundImage, '');
  const hasBackground = !!backgroundImage;

  return (
    <>
      <title>插件商店 - NapCat WebUI</title>
      <div className='p-2 md:p-4 relative'>
        {/* 固定头部区域 */}
        <div className={clsx(
          'sticky top-14 z-10 backdrop-blur-md py-4 px-4 rounded-sm mb-4 -mx-2 md:-mx-4 -mt-2 md:-mt-4 transition-colors',
          hasBackground
            ? 'bg-white/20 dark:bg-black/10'
            : 'bg-transparent'
        )}
        >
          {/* 头部布局：标题 + 搜索 + 工具栏 */}
          <div className='flex flex-col md:flex-row mb-4 items-start md:items-center justify-between gap-4'>
            <div className='flex items-center gap-3 flex-shrink-0'>
              <h1 className='text-2xl font-bold'>插件商店</h1>
              <Tooltip content='刷新列表'>
                <Button
                  isIconOnly
                  size='sm'
                  variant='flat'
                  className='bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md'
                  radius='full'
                  onPress={() => loadPlugins(true)}
                  isLoading={loading}
                >
                  <IoMdRefresh size={20} />
                </Button>
              </Tooltip>
            </div>

            {/* 顶栏搜索框与列表源 */}
            <div className='flex items-center gap-3 w-full md:w-auto flex-1 justify-end'>
              <Input
                ref={searchInputRef}
                placeholder='搜索(Ctrl+F)...'
                startContent={<IoMdSearch className='text-default-400' />}
                value={searchQuery}
                onValueChange={handleSearchChange}
                className='max-w-xs w-full'
                size='sm'
                isClearable
                classNames={{
                  inputWrapper: 'bg-default-100/50 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-white/10',
                }}
              />

              {/* 商店列表源简易卡片 */}
              <div className='hidden sm:flex items-center gap-2 bg-default-100/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 dark:border-white/10'>
                <span className='text-xs text-default-500 whitespace-nowrap'>源: {getStoreSourceDisplayName()}</span>
                <Tooltip content='切换列表源'>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    className='min-w-unit-6 w-6 h-6'
                    onPress={() => setStoreSourceModalOpen(true)}
                  >
                    <IoMdSettings size={14} />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* 标签页导航 */}
          <Tabs
            aria-label='Plugin Store Categories'
            className='max-w-full'
            selectedKey={activeTab}
            onSelectionChange={(key) => handleTabChange(String(key))}
            classNames={{
              tabList: 'bg-white/40 dark:bg-black/20 backdrop-blur-md',
              cursor: 'bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-sm',
              panel: 'hidden',
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                title={`${tab.title} (${tab.count})`}
              />
            ))}
          </Tabs>
        </div>

        {/* 插件列表区域 */}
        <div className='relative'>
          {/* 加载遮罩 - 只遮住插件列表区域 */}
          {loading && (
            <div className='absolute inset-0 bg-zinc-500/10 z-30 flex justify-center items-center backdrop-blur-sm rounded-lg'>
              <Spinner size='lg' />
            </div>
          )}

          <EmptySection isEmpty={!currentCategoryPlugins.length} />
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-start items-stretch gap-4'>
            {paginatedPlugins.map((plugin) => {
              const installInfo = getPluginInstallInfo(plugin);
              return (
                <PluginStoreCard
                  key={plugin.id}
                  data={plugin}
                  installStatus={installInfo.status}
                  installedVersion={installInfo.installedVersion}
                  onInstall={() => { handleInstall(plugin); }}
                  onViewDetail={() => {
                    setSelectedPlugin(plugin);
                    setDetailModalOpen(true);
                  }}
                />
              );
            })}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className='flex justify-center mt-6 mb-2'>
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                showShadow
                color='primary'
                size='lg'
                classNames={{
                  wrapper: 'backdrop-blur-md bg-white/40 dark:bg-black/20',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 商店列表源选择弹窗 */}
      <MirrorSelectorModal
        isOpen={storeSourceModalOpen}
        onClose={() => setStoreSourceModalOpen(false)}
        onSelect={(mirror) => {
          setCurrentStoreSource(mirror);
        }}
        currentMirror={currentStoreSource}
        type='raw'
      />

      {/* 下载镜像选择弹窗 */}
      <MirrorSelectorModal
        isOpen={downloadMirrorModalOpen}
        onClose={() => {
          setDownloadMirrorModalOpen(false);
          setPendingInstallPlugin(null);
        }}
        onSelect={(mirror) => {
          setSelectedDownloadMirror(mirror);
          // 选择后立即开始安装
          if (pendingInstallPlugin) {
            setDownloadMirrorModalOpen(false);
            installPluginWithSSE(pendingInstallPlugin.id, mirror);
            setPendingInstallPlugin(null);
          }
        }}
        currentMirror={selectedDownloadMirror}
        type='file'
      />

      {/* 插件详情弹窗 */}
      <PluginDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPlugin(null);
          // 清除 URL 参数
          if (searchParams.has('pluginId')) {
            searchParams.delete('pluginId');
            setSearchParams(searchParams);
          }
        }}
        plugin={selectedPlugin}
        installStatus={selectedPlugin ? getPluginInstallInfo(selectedPlugin).status : 'not-installed'}
        installedVersion={selectedPlugin ? getPluginInstallInfo(selectedPlugin).installedVersion : undefined}
        onInstall={() => {
          if (selectedPlugin) {
            handleInstall(selectedPlugin);
          }
        }}
      />

      {/* 插件下载进度条全局居中样式 */}
      {installProgress.show && (
        <div className='fixed inset-0 flex items-center justify-center z-[9999] animate-in fade-in duration-300'>
          {/* 毛玻璃背景层 */}
          <div className='absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md' />

          <div
            className={clsx(
              'relative w-[90%] max-w-md bg-white/80 dark:bg-black/70 backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/20 dark:border-white/10 p-8',
              'ring-1 ring-black/5 dark:ring-white/5 flex flex-col gap-6'
            )}
          >
            <div className='flex flex-col gap-1'>
              <h3 className='text-lg font-bold text-default-900'>安装插件</h3>
              <p className='text-sm text-default-500 font-medium'>{installProgress.message}</p>
            </div>

            <div className='flex flex-col gap-4'>
              {/* 速度 & 百分比 */}
              <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-0.5'>
                  {installProgress.speedStr && (
                    <p className='text-xs text-primary font-bold'>
                      {installProgress.speedStr}
                    </p>
                  )}
                  {installProgress.eta !== undefined && installProgress.eta !== null && (
                    <p className='text-xs text-default-400'>
                      剩余时间: {
                        installProgress.eta > 0
                          ? (installProgress.eta < 60 ? `${installProgress.eta}s` : `${Math.floor(installProgress.eta / 60)}m ${installProgress.eta % 60}s`)
                          : '计算中...'
                      }
                    </p>
                  )}
                </div>
                <span className='text-2xl font-black text-primary font-mono'>{Math.round(installProgress.progress)}%</span>
              </div>

              {/* 进度条 */}
              <div className='w-full bg-default-200/50 dark:bg-default-100/20 rounded-full h-4 overflow-hidden border border-default-300/20 dark:border-white/5'>
                <div
                  className='bg-primary h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(var(--heroui-primary),0.6)]'
                  style={{ width: `${installProgress.progress}%` }}
                />
              </div>

              {/* 详细数据 (大小) - 始终显示 */}
              <div className='flex items-center justify-between text-xs text-default-400 font-bold tracking-tight'>
                <span>已下载 {installProgress.downloadedStr || '0.0MB'}</span>
                <span>总计 {installProgress.totalStr || '获取中...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
