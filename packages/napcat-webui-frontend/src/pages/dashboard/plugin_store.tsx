import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Tab, Tabs } from '@heroui/tabs';
import { Card, CardBody } from '@heroui/card';
import { Tooltip } from '@heroui/tooltip';
import { Spinner } from '@heroui/spinner';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh, IoMdSearch, IoMdSettings } from 'react-icons/io';
import clsx from 'clsx';
import { EventSourcePolyfill } from 'event-source-polyfill';

import PluginStoreCard, { InstallStatus } from '@/components/display_card/plugin_store_card';
import PluginManager, { PluginItem } from '@/controllers/plugin_manager';
import MirrorSelectorModal from '@/components/mirror_selector_modal';
import { PluginStoreItem } from '@/types/plugin-store';
import useDialog from '@/hooks/use-dialog';
import key from '@/const/key';

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

  // 商店列表源相关状态
  const [storeSourceModalOpen, setStoreSourceModalOpen] = useState(false);
  const [currentStoreSource, setCurrentStoreSource] = useState<string | undefined>(undefined);

  // 下载镜像弹窗状态（安装时使用）
  const [downloadMirrorModalOpen, setDownloadMirrorModalOpen] = useState(false);
  const [pendingInstallPlugin, setPendingInstallPlugin] = useState<PluginStoreItem | null>(null);
  const [selectedDownloadMirror, setSelectedDownloadMirror] = useState<string | undefined>(undefined);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      const data = await PluginManager.getPluginStoreList();
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
    };

    return categories;
  }, [plugins, searchQuery]);

  // 获取插件的安装状态和已安装版本
  const getPluginInstallInfo = (plugin: PluginStoreItem): { status: InstallStatus; installedVersion?: string; } => {
    // 通过 id (包名) 或 name 匹配已安装的插件
    const installed = installedPlugins.find(p => p.id === plugin.id);

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
    ];
  }, [categorizedPlugins]);

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
            eventSource.close();
          } else if (data.success) {
            toast.success('插件安装成功！', { id: loadingToast });
            eventSource.close();
            // 刷新插件列表
            loadPlugins();
            // 安装成功后检查插件管理器状态
            if (pluginManagerNotFound) {
              dialog.confirm({
                title: '插件管理器未加载',
                content: (
                  <div className="space-y-2">
                    <p className="text-sm text-default-600">
                      插件已安装成功，但插件管理器尚未加载。
                    </p>
                    <p className="text-sm text-default-600">
                      是否立即注册插件管理器？注册后插件才能正常运行。
                    </p>
                  </div>
                ),
                confirmText: '注册插件管理器',
                cancelText: '稍后再说',
                onConfirm: async () => {
                  try {
                    await PluginManager.registerPluginManager();
                    toast.success('插件管理器注册成功');
                    setPluginManagerNotFound(false);
                  } catch (e: any) {
                    toast.error('注册失败: ' + e.message);
                  }
                },
              });
            }
          } else if (data.message) {
            toast.loading(data.message, { id: loadingToast });
          }
        } catch (e) {
          console.error('Failed to parse SSE message:', e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE连接出错:', error);
        toast.error('连接中断，安装失败', { id: loadingToast });
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

  return (
    <>
      <title>插件商店 - NapCat WebUI</title>
      <div className="p-2 md:p-4 relative">
        {/* 头部 */}
        <div className="flex mb-6 items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">插件商店</h1>
            <Button
              isIconOnly
              className="bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md"
              radius="full"
              onPress={loadPlugins}
              isLoading={loading}
            >
              <IoMdRefresh size={24} />
            </Button>
          </div>

          {/* 商店列表源卡片 */}
          <Card className="bg-default-100/50 backdrop-blur-md shadow-sm">
            <CardBody className="py-2 px-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-default-500">列表源:</span>
                  <span className="text-sm font-medium">{getStoreSourceDisplayName()}</span>
                </div>
                <Tooltip content="切换列表源">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setStoreSourceModalOpen(true)}
                  >
                    <IoMdSettings size={16} />
                  </Button>
                </Tooltip>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <Input
            placeholder="搜索插件名称、描述、作者或标签..."
            startContent={<IoMdSearch className="text-default-400" />}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="max-w-md"
          />
        </div>

        {/* 标签页 */}
        <div className="relative">
          {/* 加载遮罩 - 只遮住插件列表区域 */}
          {loading && (
            <div className="absolute inset-0 bg-zinc-500/10 z-30 flex justify-center items-center backdrop-blur-sm rounded-lg">
              <Spinner size='lg' />
            </div>
          )}
          
          <Tabs
            aria-label="Plugin Store Categories"
            className="max-w-full"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(String(key))}
            classNames={{
              tabList: 'bg-white/40 dark:bg-black/20 backdrop-blur-md',
              cursor: 'bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-sm',
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                title={`${tab.title} (${tab.count})`}
              >
                <EmptySection isEmpty={!categorizedPlugins[tab.key]?.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-start items-stretch gap-x-2 gap-y-4">
                  {categorizedPlugins[tab.key]?.map((plugin) => {
                    const installInfo = getPluginInstallInfo(plugin);
                    return (
                      <PluginStoreCard
                        key={plugin.id}
                        data={plugin}
                        installStatus={installInfo.status}
                        installedVersion={installInfo.installedVersion}
                        onInstall={() => handleInstall(plugin)}
                      />
                    );
                  })}
                </div>
              </Tab>
            ))}
          </Tabs>
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
        type="raw"
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
        type="file"
      />
    </>
  );
}
