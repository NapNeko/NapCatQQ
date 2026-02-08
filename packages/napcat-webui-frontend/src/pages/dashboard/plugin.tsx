import { Button } from '@heroui/button';
import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh } from 'react-icons/io';
import { FiUpload } from 'react-icons/fi';
import { useDisclosure } from '@heroui/modal';
import { EventSourcePolyfill } from 'event-source-polyfill';

import PageLoading from '@/components/page_loading';
import PluginDisplayCard from '@/components/display_card/plugin_card';
import PluginManager, { PluginItem } from '@/controllers/plugin_manager';
import useDialog from '@/hooks/use-dialog';
import PluginConfigModal from '@/pages/dashboard/plugin_config_modal';
import key from '@/const/key';

export default function PluginPage () {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pluginManagerNotFound, setPluginManagerNotFound] = useState(false);
  const dialog = useDialog();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentPluginId, setCurrentPluginId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const loadPluginsQuiet = useCallback(async () => {
    try {
      const listResult = await PluginManager.getPluginList();
      if (listResult.pluginManagerNotFound) {
        setPluginManagerNotFound(true);
        setPlugins([]);
      } else {
        setPluginManagerNotFound(false);
        setPlugins(listResult.plugins);
      }
    } catch {
      // 静默刷新失败不弹 toast
    }
  }, []);

  useEffect(() => {
    loadPlugins();
  }, []);

  // 连接 SSE 监听插件列表变更，自动刷新
  // 同时定期轮询以发现文件夹中直接添加的新插件（HMR 未启动时）
  useEffect(() => {
    const token = localStorage.getItem(key.token);
    if (!token) return;

    let _token: string;
    try {
      _token = JSON.parse(token);
    } catch {
      return;
    }

    // SSE 实时推送
    const url = PluginManager.getPluginEventsSSEUrl();
    const es = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${_token}`,
        Accept: 'text/event-stream',
      },
      withCredentials: true,
    });

    es.addEventListener('plugin-list-changed', () => {
      loadPluginsQuiet();
    });

    es.onerror = () => {
      // SSE 连接出错时不处理，浏览器会自动重连
    };

    // 定期轮询兜底（每 5 秒），用于发现文件夹中直接添加的新插件
    const pollTimer = setInterval(() => {
      loadPluginsQuiet();
    }, 5000);

    return () => {
      es.close();
      clearInterval(pollTimer);
    };
  }, [loadPluginsQuiet]);



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
      dialog.confirm({
        title: '卸载插件',
        content: (
          <div className="flex flex-col gap-2">
            <p>确定要卸载插件「{plugin.name}」吗? 此操作不可恢复。</p>
            <p className="text-small text-default-500">如果插件创建了数据文件，是否一并删除？</p>
          </div>
        ),
        // This 'dialog' utility might not support returning a value from UI interacting.
        // We might need to implement a custom confirmation flow if we want a checkbox.
        // Alternatively, use two buttons? "Uninstall & Clean", "Uninstall Only"?
        // Standard dialog usually has Confirm/Cancel.
        // Let's stick to a simpler "Uninstall" and then maybe a second prompt? Or just clean data?
        // User requested: "Uninstall prompts whether to clean data".
        // Let's use `window.confirm` for the second step or assume `dialog.confirm` is flexible enough?
        // I will implement a two-step confirmation or try to modify the dialog hook if visible (not visible here).
        // Let's use a standard `window.confirm` for the data cleanup question if the custom dialog doesn't support complex return.
        // Better: Inside onConfirm, ask again?
        onConfirm: async () => {
          // Ask for data cleanup
          // Since we are in an async callback, we can use another dialog or confirm.
          // Native confirm is ugly but works reliably for logic:
          const cleanData = window.confirm(`是否同时清理插件「${plugin.name}」的数据文件？\n点击“确定”清理数据，点击“取消”仅卸载插件。`);

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
        }
      });
    });
  };

  const handleConfig = (plugin: PluginItem) => {
    setCurrentPluginId(plugin.id);
    onOpen();
  };

  const handleImportClick = () => {
    if (pluginManagerNotFound) {
      dialog.confirm({
        title: '插件管理器未加载',
        content: (
          <div className="space-y-2">
            <p className="text-sm text-default-600">
              插件管理器尚未加载，无法导入插件。
            </p>
            <p className="text-sm text-default-600">
              是否立即注册插件管理器？
            </p>
          </div>
        ),
        confirmText: '注册插件管理器',
        cancelText: '取消',
        onConfirm: async () => {
          try {
            await PluginManager.registerPluginManager();
            toast.success('插件管理器注册成功');
            setPluginManagerNotFound(false);
            // 注册成功后打开文件选择器
            fileInputRef.current?.click();
          } catch (e: any) {
            toast.error('注册失败: ' + e.message);
          }
        },
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 重置 input，允许重复选择同一文件
    e.target.value = '';

    if (!file.name.endsWith('.zip')) {
      toast.error('请选择 .zip 格式的插件包');
      return;
    }

    const loadingToast = toast.loading('正在导入插件...');
    try {
      const result = await PluginManager.importLocalPlugin(file);
      toast.success(result.message, { id: loadingToast });
      loadPlugins();
    } catch (err: any) {
      toast.error(err.message || '导入失败', { id: loadingToast });
    }
  };

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
          <h1 className="text-2xl font-bold">插件管理</h1>
          <Button
            isIconOnly
            className="bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md"
            radius='full'
            onPress={loadPlugins}
          >
            <IoMdRefresh size={24} />
          </Button>
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
        </div>

        {pluginManagerNotFound ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-default-700 dark:text-white/90 mb-2">
              无插件加载
            </h2>
            <p className="text-default-500 dark:text-white/60 max-w-md">
              插件管理器未加载，请检查 plugins 目录是否存在
            </p>
          </div>
        ) : plugins.length === 0 ? (
          <div className="text-default-400">暂时没有安装插件</div>
        ) : (
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
                hasConfig={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
