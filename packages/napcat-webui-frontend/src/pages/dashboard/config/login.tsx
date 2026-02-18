import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { useRequest } from 'ahooks';
import CryptoJS from 'crypto-js';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import SaveButtons from '@/components/button/save_buttons';
import GUIDManager from '@/components/guid_manager';
import PageLoading from '@/components/page_loading';

import QQManager from '@/controllers/qq_manager';
import ProcessManager from '@/controllers/process_manager';
import { waitForBackendReady } from '@/utils/process_utils';

interface LoginConfigFormData {
  quickLoginQQ: string;
  autoPasswordLoginQQ: string;
  autoPasswordLoginPassword: string;
}

const LoginConfigCard = () => {
  const [isRestarting, setIsRestarting] = useState(false);
  const {
    data: quickLoginData,
    loading: quickLoginLoading,
    error: quickLoginError,
    refreshAsync: refreshQuickLogin,
  } = useRequest(QQManager.getQuickLoginQQ);
  const {
    data: autoPasswordLoginConfig,
    loading: autoPasswordLoginLoading,
    error: autoPasswordLoginError,
    refreshAsync: refreshAutoPasswordLoginConfig,
  } = useRequest(QQManager.getAutoPasswordLoginConfig);
  const {
    control,
    handleSubmit: handleOnebotSubmit,
    formState: { isSubmitting },
    setValue: setOnebotValue,
  } = useForm<LoginConfigFormData>({
    defaultValues: {
      quickLoginQQ: '',
      autoPasswordLoginQQ: '',
      autoPasswordLoginPassword: '',
    },
  });

  const reset = () => {
    setOnebotValue('quickLoginQQ', quickLoginData ?? '');
    setOnebotValue('autoPasswordLoginQQ', autoPasswordLoginConfig?.uin ?? '');
    setOnebotValue('autoPasswordLoginPassword', '');
  };

  const onSubmit = handleOnebotSubmit(async (data) => {
    try {
      const autoPasswordLoginQQ = data.autoPasswordLoginQQ.trim();
      const autoPasswordLoginPassword = data.autoPasswordLoginPassword.trim();
      if (autoPasswordLoginPassword && !autoPasswordLoginQQ) {
        toast.error('请输入自动回退登录QQ号');
        return;
      }

      await QQManager.setQuickLoginQQ(data.quickLoginQQ);
      if (autoPasswordLoginQQ) {
        const passwordMd5 = autoPasswordLoginPassword
          ? CryptoJS.MD5(autoPasswordLoginPassword).toString()
          : undefined;
        await QQManager.setAutoPasswordLoginConfig(autoPasswordLoginQQ, passwordMd5);
      }

      await Promise.all([refreshQuickLogin(), refreshAutoPasswordLoginConfig()]);
      setOnebotValue('autoPasswordLoginPassword', '');
      toast.success('保存成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存失败: ${msg}`);
    }
  });

  const onRefresh = async () => {
    try {
      await Promise.all([refreshQuickLogin(), refreshAutoPasswordLoginConfig()]);
      toast.success('刷新成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`刷新失败: ${msg}`);
    }
  };

  const onClearAutoPasswordConfig = async () => {
    try {
      await QQManager.clearAutoPasswordLoginConfig();
      await refreshAutoPasswordLoginConfig();
      setOnebotValue('autoPasswordLoginQQ', '');
      setOnebotValue('autoPasswordLoginPassword', '');
      toast.success('已清除自动回退密码登录配置');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`清除失败: ${msg}`);
    }
  };

  const onRestartProcess = async () => {
    setIsRestarting(true);
    try {
      const result = await ProcessManager.restartProcess();
      toast.success(result.message || '进程重启请求已发送');

      // 轮询探测后端是否恢复
      const isReady = await waitForBackendReady(
        30000, // 30秒超时
        () => {
          setIsRestarting(false);
          toast.success('进程重启完成');
        },
        () => {
          setIsRestarting(false);
          toast.error('后端在 30 秒内未响应，请检查 NapCat 运行日志');
        }
      );

      if (!isReady) {
        setIsRestarting(false);
      }
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`进程重启失败: ${msg}`);
      setIsRestarting(false);
    }
  };

  useEffect(() => {
    reset();
  }, [quickLoginData, autoPasswordLoginConfig]);

  if (quickLoginLoading || autoPasswordLoginLoading) return <PageLoading loading />;

  return (
    <>
      <title>OneBot配置 - NapCat WebUI</title>
      <div className='flex-shrink-0 w-full'>快速登录QQ</div>
      <Controller
        control={control}
        name='quickLoginQQ'
        render={({ field }) => (
          <Input
            {...field}
            label='快速登录QQ'
            placeholder='请输入QQ号'
            isDisabled={!!quickLoginError}
            errorMessage={quickLoginError ? '获取快速登录QQ失败' : undefined}
          />
        )}
      />
      <div className='flex-shrink-0 w-full mt-6 pt-6 border-t border-divider'>自动回退密码登录</div>
      <Controller
        control={control}
        name='autoPasswordLoginQQ'
        render={({ field }) => (
          <Input
            {...field}
            label='回退登录QQ'
            placeholder='快速登录失败后使用此QQ号密码登录'
            isDisabled={!!autoPasswordLoginError}
            errorMessage={autoPasswordLoginError ? '获取自动回退配置失败' : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name='autoPasswordLoginPassword'
        render={({ field }) => (
          <Input
            {...field}
            label='回退登录密码'
            placeholder='留空表示不修改已保存密码'
            type='password'
            autoComplete='new-password'
            isDisabled={!!autoPasswordLoginError}
            errorMessage={autoPasswordLoginError ? '获取自动回退配置失败' : undefined}
          />
        )}
      />
      <div className='text-xs text-default-500'>
        当前状态：
        {autoPasswordLoginConfig?.hasPassword ? '已设置回退密码（不会回显）' : '未设置回退密码'}
      </div>
      <Button
        color='danger'
        variant='flat'
        onPress={onClearAutoPasswordConfig}
        isDisabled={!autoPasswordLoginConfig?.uin && !autoPasswordLoginConfig?.hasPassword}
      >
        清除回退密码配置
      </Button>
      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting || quickLoginLoading || autoPasswordLoginLoading}
        refresh={onRefresh}
      />
      <div className='flex-shrink-0 w-full mt-6 pt-6 border-t border-divider'>
        <div className='mb-3 text-sm text-default-600'>进程管理</div>
        <Button
          color='warning'
          variant='flat'
          onPress={onRestartProcess}
          isLoading={isRestarting}
          isDisabled={isRestarting}
          fullWidth
        >
          {isRestarting ? '正在重启进程...' : '重启进程'}
        </Button>
        <div className='mt-2 text-xs text-default-500'>
          重启进程将关闭当前 Worker 进程，等待 3 秒后启动新进程
        </div>
      </div>
      <Divider className='mt-6' />
      <div className='flex-shrink-0 w-full mt-4'>
        <div className='mb-3 text-sm text-default-600'>设备 GUID 管理</div>
        <div className='text-xs text-default-400 mb-3'>
          GUID 是设备登录唯一识别码，存储在 Registry20 文件中。修改后需重启生效。
        </div>
        <GUIDManager showRestart={false} />
      </div>
    </>
  );
};

export default LoginConfigCard;
