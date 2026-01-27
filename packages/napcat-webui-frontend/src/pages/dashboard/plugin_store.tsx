import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Tab, Tabs } from '@heroui/tabs';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh, IoMdSearch } from 'react-icons/io';
import clsx from 'clsx';

import PageLoading from '@/components/page_loading';
import PluginStoreCard from '@/components/display_card/plugin_store_card';
import PluginManager from '@/controllers/plugin_manager';
import { PluginStoreItem } from '@/types/plugin-store';

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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadPlugins = async () => {
    setLoading(true);
    try {
      const data = await PluginManager.getPluginStoreList();
      setPlugins(data.plugins);
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

  const tabs = useMemo(() => {
    return [
      { key: 'all', title: '全部', count: categorizedPlugins.all?.length || 0 },
      { key: 'official', title: '官方', count: categorizedPlugins.official?.length || 0 },
      { key: 'tools', title: '工具', count: categorizedPlugins.tools?.length || 0 },
      { key: 'entertainment', title: '娱乐', count: categorizedPlugins.entertainment?.length || 0 },
      { key: 'other', title: '其它', count: categorizedPlugins.other?.length || 0 },
    ];
  }, [categorizedPlugins]);

  const handleInstall = async () => {
    toast('该功能尚未完工，敬请期待', {
      icon: '🚧',
      duration: 3000,
    });
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
                {categorizedPlugins[tab.key]?.map((plugin) => (
                  <PluginStoreCard
                    key={plugin.id}
                    data={plugin}
                    onInstall={handleInstall}
                  />
                ))}
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  );
}
