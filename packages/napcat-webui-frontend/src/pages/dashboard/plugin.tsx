import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh } from 'react-icons/io';
// import { FiUpload } from 'react-icons/fi';
import { useDisclosure } from '@heroui/modal';

import PageLoading from '@/components/page_loading';
import PluginDisplayCard from '@/components/display_card/plugin_card';
import PluginManager, { PluginItem } from '@/controllers/plugin_manager';
import useDialog from '@/hooks/use-dialog';
import PluginConfigModal from '@/pages/dashboard/plugin_config_modal';

export default function PluginPage () {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pluginManagerNotFound, setPluginManagerNotFound] = useState(false);
  const dialog = useDialog();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentPluginId, setCurrentPluginId] = useState<string>('');
  // const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPlugins = async () => {
    setLoading(true);
    setPluginManagerNotFound(false);
    try {
      const listResult = await PluginManager.getPluginList();

      if (listResult.pluginManagerNotFound) {
        setPluginManagerNotFound(true);
        setPlugins([]);
      } else {
        setPlugins(listResult.plugins);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const handleToggle = async (plugin: PluginItem) => {
    const isEnable = plugin.status !== 'active';
    const actionText = isEnable ? '启用' : '禁用';
    const loadingToast = toast.loading(`${actionText}中...`);
    try {
      await PluginManager.setPluginStatus(plugin.id, isEnable);
      toast.success(`${actionText}成功`, { id: loadingToast });
      loadPlugins();
    } catch (e: any) {
      toast.error(e.message, { id: loadingToast });
    }
  };

  const handleUninstall = async (plugin: PluginItem) => {
    return new Promise<void>((resolve, reject) => {
      let cleanData = false;
      dialog.confirm({
        title: '卸载插件',
        content: (
          <div className='flex flex-col gap-2'>
            <p className='text-base text-default-800'>确定要卸载插件「<span className='font-semibold text-danger'>{plugin.name}</span>」吗? 此操作不可恢复。</p>
            <div className='mt-2 bg-default-100 dark:bg-default-50/10 p-3 rounded-lg flex flex-col gap-1'>
              <label className='flex items-center gap-2 cursor-pointer w-fit'>
                <input
                  type='checkbox'
                  onChange={(e) => { cleanData = e.target.checked; }}
                  className='w-4 h-4 cursor-pointer accent-danger'
                />
                <span className='text-small font-medium text-default-700'>同时删除其配置文件</span>
              </label>
              <p className='text-xs text-default-500 pl-6 break-all w-full'>配置目录: config/plugins/{plugin.id}</p>
            </div>
          </div>
        ),
        confirmText: '确定卸载',
        cancelText: '取消',
        onConfirm: async () => {
          const loadingToast = toast.loading('卸载中...');
          try {
            await PluginManager.uninstallPlugin(plugin.id, cleanData);
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
        },
      });
    });
  };

  const handleConfig = (plugin: PluginItem) => {
    setCurrentPluginId(plugin.id);
    onOpen();
  };

  // const handleImportClick = () => {
  //   if (pluginManagerNotFound) {
  //     dialog.confirm({
  //       title: '插件管理器未加载',
  //       content: (
  //         <div className="space-y-2">
  //           <p className="text-sm text-default-600">
  //             插件管理器尚未加载，无法导入插件。
  //           </p>
  //           <p className="text-sm text-default-600">
  //             是否立即注册插件管理器？
  //           </p>
  //         </div>
  //       ),
  //       confirmText: '注册插件管理器',
  //       cancelText: '取消',
  //       onConfirm: async () => {
  //         try {
  //           await PluginManager.registerPluginManager();
  //           toast.success('插件管理器注册成功');
  //           setPluginManagerNotFound(false);
  //           // 注册成功后打开文件选择器
  //           fileInputRef.current?.click();
  //         } catch (e: any) {
  //           toast.error('注册失败: ' + e.message);
  //         }
  //       },
  //     });
  //     return;
  //   }
  //   fileInputRef.current?.click();
  // };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // 重置 input，允许重复选择同一文件
  //   e.target.value = '';

  //   if (!file.name.endsWith('.zip')) {
  //     toast.error('请选择 .zip 格式的插件包');
  //     return;
  //   }

  //   const loadingToast = toast.loading('正在导入插件...');
  //   try {
  //     const result = await PluginManager.importLocalPlugin(file);
  //     toast.success(result.message, { id: loadingToast });
  //     loadPlugins();
  //   } catch (err: any) {
  //     toast.error(err.message || '导入失败', { id: loadingToast });
  //   }
  // };

  return (
    <>
      <title>插件管理 - NapCat WebUI</title>
      <div className='p-2 md:p-4 relative'>
        <PageLoading loading={loading} />
        <PluginConfigModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          pluginId={currentPluginId}
        />

        <div className='flex mb-6 items-center gap-4'>
          <h1 className='text-2xl font-bold'>插件管理</h1>
          <Button
            isIconOnly
            className='bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md'
            radius='full'
            onPress={loadPlugins}
          >
            <IoMdRefresh size={24} />
          </Button>
          {/* 禁用插件上传
          <Button
            className="bg-primary-100/50 hover:bg-primary-200/50 text-primary-700 backdrop-blur-md"
            radius='full'
            startContent={<FiUpload size={18} />}
            onPress={handleImportClick}
          >
            导入插件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFileChange}
          />
          */}
        </div>

        {pluginManagerNotFound
          ? (
            <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
              <div className='text-6xl mb-4'>📦</div>
              <h2 className='text-xl font-semibold text-default-700 dark:text-white/90 mb-2'>
                无插件加载
              </h2>
              <p className='text-default-500 dark:text-white/60 max-w-md'>
                插件管理器未加载，请检查 plugins 目录是否存在
              </p>
            </div>
          )
          : plugins.length === 0
            ? (
              <div className='text-default-400'>暂时没有安装插件</div>
            )
            : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-start items-stretch gap-x-2 gap-y-4'>
                {plugins.map(plugin => (
                  <PluginDisplayCard
                    key={plugin.id}
                    data={plugin}
                    onToggleStatus={() => handleToggle(plugin)}
                    onUninstall={() => handleUninstall(plugin)}
                    onConfig={() => {
                      if (plugin.status !== 'active') {
                        toast.error('未启用插件，无法配置插件');
                      } else if (plugin.hasConfig) {
                        handleConfig(plugin);
                      } else {
                        toast.error('此插件没有配置哦');
                      }
                    }}
                    hasConfig
                  />
                ))}
              </div>
            )}
      </div>
    </>
  );
}
