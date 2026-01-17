import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh } from 'react-icons/io';

import PageLoading from '@/components/page_loading';
import PluginDisplayCard from '@/components/display_card/plugin_card';
import PluginManager, { PluginItem } from '@/controllers/plugin_manager';
import useDialog from '@/hooks/use-dialog';

export default function PluginPage () {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dialog = useDialog();

  const loadPlugins = async () => {
    setLoading(true);
    try {
      const data = await PluginManager.getPluginList();
      setPlugins(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const handleReload = async (name: string) => {
    const loadingToast = toast.loading('重载中...');
    try {
      await PluginManager.reloadPlugin(name);
      toast.success('重载成功', { id: loadingToast });
      loadPlugins();
    } catch (e: any) {
      toast.error(e.message, { id: loadingToast });
    }
  };

  const handleToggle = async (plugin: PluginItem) => {
    const isEnable = plugin.status !== 'active';
    const actionText = isEnable ? '启用' : '禁用';
    const loadingToast = toast.loading(`${actionText}中...`);
    try {
      await PluginManager.setPluginStatus(plugin.name, isEnable, plugin.filename);
      toast.success(`${actionText}成功`, { id: loadingToast });
      loadPlugins();
    } catch (e: any) {
      toast.error(e.message, { id: loadingToast });
    }
  };

  const handleUninstall = async (plugin: PluginItem) => {
    return new Promise<void>((resolve, reject) => {
      dialog.confirm({
        title: '卸载插件',
        content: `确定要卸载插件「${plugin.name}」吗? 此操作不可恢复。`,
        onConfirm: async () => {
          const loadingToast = toast.loading('卸载中...');
          try {
            await PluginManager.uninstallPlugin(plugin.name, plugin.filename);
            toast.success('卸载成功', { id: loadingToast });
            loadPlugins();
            resolve();
          } catch (e: any) {
            toast.error(e.message, { id: loadingToast });
            reject(e);
          }
        },
        onCancel: () => {
          resolve();
        }
      });
    });
  };

  return (
    <>
      <title>插件管理 - NapCat WebUI</title>
      <div className='p-2 md:p-4 relative'>
        <PageLoading loading={loading} />
        <div className='flex mb-6 items-center gap-4'>
          <h1 className="text-2xl font-bold">插件管理</h1>
          <Button
            isIconOnly
            className="bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md"
            radius='full'
            onPress={loadPlugins}
          >
            <IoMdRefresh size={24} />
          </Button>
        </div>

        {plugins.length === 0 ? (
          <div className="text-default-400">暂时没有安装插件</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-start items-stretch gap-x-2 gap-y-4'>
            {plugins.map(plugin => (
              <PluginDisplayCard
                key={plugin.name}
                data={plugin}
                onReload={() => handleReload(plugin.name)}
                onToggleStatus={() => handleToggle(plugin)}
                onUninstall={() => handleUninstall(plugin)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
