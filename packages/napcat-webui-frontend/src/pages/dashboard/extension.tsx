import { Tab, Tabs } from '@heroui/tabs';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { IoMdRefresh } from 'react-icons/io';
import { MdExtension } from 'react-icons/md';

import PageLoading from '@/components/page_loading';
import pluginManager from '@/controllers/plugin_manager';

interface ExtensionPage {
  pluginId: string;
  pluginName: string;
  path: string;
  title: string;
  icon?: string;
  description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export default function ExtensionPage () {
  const [loading, setLoading] = useState(true);
  const [extensionPages, setExtensionPages] = useState<ExtensionPage[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [iframeLoading, setIframeLoading] = useState(false);

  const fetchExtensionPages = async () => {
    setLoading(true);
    try {
      const result = await pluginManager.getPluginList();
      if (result.pluginManagerNotFound) {
        setExtensionPages([]);
      } else {
        setExtensionPages(result.extensionPages || []);
        // 默认选中第一个
        if (result.extensionPages?.length > 0 && !selectedTab) {
          setSelectedTab(`${result.extensionPages[0].pluginId}:${result.extensionPages[0].path}`);
        }
      }
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`获取扩展页面失败: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchExtensionPages();
  };

  // 生成 tabs
  const tabs = useMemo(() => {
    return extensionPages.map(page => ({
      key: `${page.pluginId}:${page.path}`,
      title: page.title,
      pluginId: page.pluginId,
      pluginName: page.pluginName,
      path: page.path,
      icon: page.icon,
      description: page.description,
    }));
  }, [extensionPages]);

  // 获取当前选中页面的 iframe URL
  // 新路由格式不需要鉴权: /plugin/:pluginId/page/:pagePath
  const currentPageUrl = useMemo(() => {
    if (!selectedTab) return '';
    const [pluginId, ...pathParts] = selectedTab.split(':');
    const path = pathParts.join(':').replace(/^\//, '');
    return `/plugin/${pluginId}/page/${path}`;
  }, [selectedTab]);

  useEffect(() => {
    fetchExtensionPages();
  }, []);

  useEffect(() => {
    if (currentPageUrl) {
      setIframeLoading(true);
    }
  }, [currentPageUrl]);

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  // 在新窗口打开页面（新路由不需要鉴权）
  const openInNewWindow = (pluginId: string, path: string) => {
    const cleanPath = path.replace(/^\//, '');
    const url = `/plugin/${pluginId}/page/${cleanPath}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <title>扩展页面 - NapCat WebUI</title>
      <div className='p-2 md:p-4 relative h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col'>
        <PageLoading loading={loading} />

        <div className='flex mb-4 items-center justify-between gap-4 flex-wrap'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 text-default-600'>
              <MdExtension size={24} />
              <span className='text-lg font-medium'>插件扩展页面</span>
            </div>
            <Button
              isIconOnly
              className='bg-default-100/50 hover:bg-default-200/50 text-default-700 backdrop-blur-md'
              radius='full'
              onPress={refresh}
            >
              <IoMdRefresh size={24} />
            </Button>
          </div>
          {extensionPages.length > 0 && (
            <Tabs
              aria-label='Extension Pages'
              className='max-w-full'
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              classNames={{
                tabList: 'bg-white/40 dark:bg-black/20 backdrop-blur-md',
                cursor: 'bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-sm',
                panel: 'hidden',
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  title={
                    <div className='flex items-center gap-2'>
                      {tab.icon && <span>{tab.icon}</span>}
                      <span
                        className='cursor-pointer hover:underline truncate max-w-[6rem] md:max-w-none'
                        title={`插件：${tab.pluginName}\n点击在新窗口打开`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openInNewWindow(tab.pluginId, tab.path);
                        }}
                      >
                        {tab.title}
                      </span>
                      <span className='text-xs text-default-400 hidden md:inline'>({tab.pluginName})</span>
                    </div>
                  }
                />
              ))}
            </Tabs>
          )}
        </div>

        {extensionPages.length === 0 && !loading
          ? (
            <div className='flex-1 flex flex-col items-center justify-center text-default-400'>
              <MdExtension size={64} className='mb-4 opacity-50' />
              <p className='text-lg'>暂无插件扩展页面</p>
              <p className='text-sm mt-2'>插件可以通过注册页面来扩展 WebUI 功能</p>
            </div>
          )
          : (
            <div className='flex-1 min-h-0 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-lg overflow-hidden relative'>
              {iframeLoading && (
                <div className='absolute inset-0 flex items-center justify-center bg-default-100/50 z-10'>
                  <Spinner size='lg' />
                </div>
              )}
              <iframe
                src={currentPageUrl}
                className='w-full h-full border-0'
                onLoad={handleIframeLoad}
                title='extension-page'
                sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
              />
            </div>
          )}
      </div>
    </>
  );
}
