import { Input } from '@heroui/input';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Select, SelectItem } from '@heroui/select';

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

  const [ipListText, setIpListText] = useState('');

  const {
    control,
    handleSubmit: handleConfigSubmit,
    formState: { isSubmitting },
    setValue: setConfigValue,
    watch,
  } = useForm<{
    host: string;
    port: number;
    loginRate: number;
    disableWebUI: boolean;
    accessControlMode: 'none' | 'whitelist' | 'blacklist';
    ipWhitelist: string[];
    ipBlacklist: string[];
    enableXForwardedFor: boolean;
  }>({
    defaultValues: {
      host: '0.0.0.0',
      port: 6099,
      loginRate: 10,
      disableWebUI: false,
      accessControlMode: 'none',
      ipWhitelist: [],
      ipBlacklist: [],
      enableXForwardedFor: false,
    },
  });

  const accessControlMode = watch('accessControlMode');

  const reset = () => {
    if (configData) {
      setConfigValue('host', configData.host);
      setConfigValue('port', configData.port);
      setConfigValue('loginRate', configData.loginRate);
      setConfigValue('disableWebUI', configData.disableWebUI);
      setConfigValue('accessControlMode', configData.accessControlMode || 'none');
      setConfigValue('ipWhitelist', configData.ipWhitelist || []);
      setConfigValue('ipBlacklist', configData.ipBlacklist || []);
      setConfigValue('enableXForwardedFor', configData.enableXForwardedFor || false);

      // 更新IP列表文本
      if (configData.accessControlMode === 'whitelist') {
        setIpListText((configData.ipWhitelist || []).join('\n'));
      } else if (configData.accessControlMode === 'blacklist') {
        setIpListText((configData.ipBlacklist || []).join('\n'));
      }
    }
  };

  const onSubmit = handleConfigSubmit(async (data) => {
    try {
      // 解析IP列表
      const ipList = ipListText
        .split('\n')
        .map(ip => ip.trim())
        .filter(ip => ip.length > 0);

      const submitData = {
        ...data,
        ipWhitelist: data.accessControlMode === 'whitelist' ? ipList : [],
        ipBlacklist: data.accessControlMode === 'blacklist' ? ipList : [],
      };

      await WebUIManager.updateWebUIConfig(submitData);
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

  useEffect(() => {
    // 当模式切换时，更新IP列表文本
    const handleModeChange = async () => {
      if (configData) {
        if (accessControlMode === 'whitelist') {
          const currentList = configData.ipWhitelist || [];
          // 如果白名单为空，自动获取当前IP并填入
          if (currentList.length === 0) {
            try {
              const clientIPData = await WebUIManager.getClientIP();
              if (clientIPData?.ip) {
                setIpListText(clientIPData.ip);
              } else {
                setIpListText('');
              }
            } catch (error) {
              console.error('获取客户端IP失败:', error);
              setIpListText('');
            }
          } else {
            setIpListText(currentList.join('\n'));
          }
        } else if (accessControlMode === 'blacklist') {
          setIpListText((configData.ipBlacklist || []).join('\n'));
        } else {
          setIpListText('');
        }
      }
    };

    handleModeChange();
  }, [accessControlMode, configData]);

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

          <div className='flex flex-col gap-3 mt-2'>
            <div className='text-sm font-medium text-default-700 dark:text-default-300 px-1'>网络访问控制</div>
            <Controller
              control={control}
              name='accessControlMode'
              render={({ field }) => (
                <Select
                  {...field}
                  label='访问控制模式'
                  placeholder='选择访问控制模式'
                  description='选择如何控制网络访问'
                  selectedKeys={[field.value]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as 'none' | 'whitelist' | 'blacklist';
                    field.onChange(value);
                  }}
                  isDisabled={!!configError}
                  classNames={{
                    trigger:
                      'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
                  }}
                >
                  <SelectItem key='none' value='none'>
                    不限制
                  </SelectItem>
                  <SelectItem key='whitelist' value='whitelist'>
                    白名单模式
                  </SelectItem>
                  <SelectItem key='blacklist' value='blacklist'>
                    黑名单模式
                  </SelectItem>
                </Select>
              )}
            />

            {accessControlMode !== 'none' && (
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium text-default-700 dark:text-default-300'>
                    {accessControlMode === 'whitelist' ? 'IP白名单' : 'IP黑名单'}
                  </label>
                  <textarea
                    value={ipListText}
                    onChange={(e) => setIpListText(e.target.value)}
                    placeholder={`每行一个IP地址或规则\n支持格式：\nIPv4:\n- 精确IP: 192.168.1.100\n- 通配符: 192.168.1.*\n- CIDR: 192.168.1.0/24\nIPv6:\n- 精确IP: 2001:db8::1\n- CIDR: 2001:db8::/32`}
                    disabled={!!configError}
                    rows={10}
                    className='w-full px-3 py-2 bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm hover:border-default-300 rounded-lg text-default-700 dark:text-default-300 placeholder:text-default-400 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  <p className='text-xs text-default-500'>
                    {accessControlMode === 'whitelist'
                      ? '只有列表中的IP可以访问'
                      : '列表中的IP将被拒绝访问'}
                  </p>
                </div>
                <div className='text-xs text-default-500 px-1'>
                  <div className='font-medium mb-1'>示例规则：</div>
                  <div className='space-y-0.5 font-mono'>
                    <div>• 127.0.0.1 (IPv4 本地回环)</div>
                    <div>• 192.168.1.* (IPv4 通配符)</div>
                    <div>• 10.0.0.0/8 (IPv4 CIDR)</div>
                    <div>• ::1 (IPv6 本地回环)</div>
                    <div>• 2001:db8::/32 (IPv6 CIDR)</div>
                  </div>
                </div>
              </div>
            )}

            <Controller
              control={control}
              name='enableXForwardedFor'
              render={({ field }) => (
                <SwitchCard
                  value={field.value}
                  onValueChange={(value: boolean) => field.onChange(value)}
                  disabled={!!configError}
                  label='启用 X-Forwarded-For'
                  description='启用后将从 X-Forwarded-For 头部获取真实IP地址（适用于反向代理场景）'
                />
              )}
            />
          </div>
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
