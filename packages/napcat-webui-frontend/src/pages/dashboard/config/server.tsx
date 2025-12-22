import { Input } from '@heroui/input';
import { useRequest } from 'ahooks';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import SaveButtons from '@/components/button/save_buttons';
import PageLoading from '@/components/page_loading';
import SwitchCard from '@/components/switch_card';

import WebUIManager from '@/controllers/webui_manager';

const ServerConfigCard = () => {
  const {
    data: configData,
    loading: configLoading,
    error: configError,
    refreshAsync: refreshConfig,
  } = useRequest(WebUIManager.getWebUIConfig);

  const {
    control,
    handleSubmit: handleConfigSubmit,
    formState: { isSubmitting },
    setValue: setConfigValue,
  } = useForm<{
    host: string;
    port: number;
    loginRate: number;
    disableWebUI: boolean;
    disableNonLANAccess: boolean;
  }>({
    defaultValues: {
      host: '0.0.0.0',
      port: 6099,
      loginRate: 10,
      disableWebUI: false,
      disableNonLANAccess: false,
    },
  });

  const reset = () => {
    if (configData) {
      setConfigValue('host', configData.host);
      setConfigValue('port', configData.port);
      setConfigValue('loginRate', configData.loginRate);
      setConfigValue('disableWebUI', configData.disableWebUI);
      setConfigValue('disableNonLANAccess', configData.disableNonLANAccess);
    }
  };

  const onSubmit = handleConfigSubmit(async (data) => {
    try {
      await WebUIManager.updateWebUIConfig(data);
      toast.success('保存成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存失败: ${msg}`);
    }
  });

  const onRefresh = async () => {
    try {
      await refreshConfig();
      toast.success('刷新成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`刷新失败: ${msg}`);
    }
  };

  useEffect(() => {
    reset();
  }, [configData]);

  if (configLoading) return <PageLoading loading />;

  return (
    <>
      <title>服务器配置 - NapCat WebUI</title>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3'>
          <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>服务器配置</div>
          <Controller
            control={control}
            name='host'
            render={({ field }) => (
              <Input
                {...field}
                label='监听地址'
                placeholder='请输入监听地址'
                description='服务器监听的IP地址，0.0.0.0表示监听所有网卡'
                isDisabled={!!configError}
                errorMessage={configError ? '获取配置失败' : undefined}
                classNames={{
                  inputWrapper:
                    'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
                  input: 'bg-transparent text-default-700 placeholder:text-default-400',
                }}
              />
            )}
          />
          <Controller
            control={control}
            name='port'
            render={({ field }) => (
              <Input
                {...field}
                type='number'
                value={field.value?.toString() || ''}
                label='监听端口'
                placeholder='请输入监听端口'
                description='服务器监听的端口号，范围1-65535'
                isDisabled={!!configError}
                errorMessage={configError ? '获取配置失败' : undefined}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                classNames={{
                  inputWrapper:
                    'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
                  input: 'bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
                }}
              />
            )}
          />
          <Controller
            control={control}
            name='loginRate'
            render={({ field }) => (
              <Input
                {...field}
                type='number'
                value={field.value?.toString() || ''}
                label='登录速率限制'
                placeholder='请输入登录速率限制'
                description='每小时允许的登录尝试次数'
                isDisabled={!!configError}
                errorMessage={configError ? '获取配置失败' : undefined}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                classNames={{
                  inputWrapper:
                    'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
                  input: 'bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
                }}
              />
            )}
          />
        </div>

        <div className='flex flex-col gap-3'>
          <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>安全配置</div>
          <Controller
            control={control}
            name='disableWebUI'
            render={({ field }) => (
              <SwitchCard
                value={field.value}
                onValueChange={(value: boolean) => field.onChange(value)}
                disabled={!!configError}
                label='禁用WebUI'
                description='启用后将完全禁用WebUI服务，需要重启生效'
              />
            )}
          />
          <Controller
            control={control}
            name='disableNonLANAccess'
            render={({ field }) => (
              <SwitchCard
                value={field.value}
                onValueChange={(value: boolean) => field.onChange(value)}
                disabled={!!configError}
                label='禁用非局域网访问'
                description='启用后只允许局域网内的设备访问WebUI，提高安全性'
              />
            )}
          />
        </div>
      </div>

      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting || configLoading}
        refresh={onRefresh}
      />
    </>
  );
};

export default ServerConfigCard;
