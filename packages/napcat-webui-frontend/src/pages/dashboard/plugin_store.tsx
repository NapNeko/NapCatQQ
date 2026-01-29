import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Tab, Tabs } from '@heroui/tabs';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh, IoMdSearch } from 'react-icons/io';
import clsx from 'clsx';
import { useRequest } from 'ahooks';
import { EventSourcePolyfill } from 'event-source-polyfill';

import PageLoading from '@/components/page_loading';
import PluginStoreCard, { InstallStatus } from '@/components/display_card/plugin_store_card';
import PluginManager, { PluginItem } from '@/controllers/plugin_manager';
import WebUIManager from '@/controllers/webui_manager';
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

  // 获取镜像列表
  const { data: mirrorsData } = useRequest(WebUIManager.getMirrors, {
    cacheKey: 'napcat-mirrors',
    staleTime: 60 * 60 * 1000,
  });
  const mirrors = mirrorsData?.mirrors || [];

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
  }, []);

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
    // 检测是否是 GitHub 下载链接
    const githubPattern = /^https:\/\/github\.com\//;
    const isGitHubUrl = githubPattern.test(plugin.downloadUrl);

    // 如果是 GitHub 链接，弹出镜像选择对话框
    if (isGitHubUrl) {
      let selectedMirror: string | undefined = undefined;

      dialog.confirm({
        title: '安装插件',
        content: (
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2">
                插件名称: <span className="font-semibold">{plugin.name}</span>
              </p>
              <p className="text-sm mb-2">
                版本: <span className="font-semibold">v{plugin.version}</span>
              </p>
              <p className="text-sm text-default-500 mb-4">
                {plugin.description}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">选择下载镜像源</label>
              <Select
                placeholder="自动选择 (默认)"
                defaultSelectedKeys={['default']}
                onSelectionChange={(keys) => {
                  const m = Array.from(keys)[0] as string;
                  selectedMirror = m === 'default' ? undefined : m;
                }}
                size="sm"
                aria-label="选择镜像源"
              >
                {['default', ...mirrors].map(m => (
                  <SelectItem key={m} textValue={m === 'default' ? '自动选择' : m}>
                    {m === 'default' ? '自动选择 (默认)' : m}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        ),
        confirmText: '开始安装',
        cancelText: '取消',
        onConfirm: async () => {
          await installPluginWithSSE(plugin.id, selectedMirror);
        },
      });
    } else {
      // 非 GitHub 链接，直接安装
      await installPluginWithSSE(plugin.id);
    }
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

  return (
    <>
      <title>插件商店 - NapCat WebUI</title>
      <div className="p-2 md:p-4 relative">
        <PageLoading loading={loading} />

        {/* 头部 */}
        <div className="flex mb-6 items-center gap-4">
          <h1 className="text-2xl font-bold">插件商店</h1>
          <Button
            isIconOnly
            className="bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md"
            radius="full"
            onPress={loadPlugins}
          >
            <IoMdRefresh size={24} />
          </Button>
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
    </>
  );
}
