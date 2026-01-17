import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import SaveButtons from '@/components/button/save_buttons';
import PageLoading from '@/components/page_loading';

import QQManager from '@/controllers/qq_manager';
import ProcessManager from '@/controllers/process_manager';
import { waitForBackendReady } from '@/utils/process_utils';

const LoginConfigCard = () => {
  const [isRestarting, setIsRestarting] = useState(false);
  const {
    data: quickLoginData,
    loading: quickLoginLoading,
    error: quickLoginError,
    refreshAsync: refreshQuickLogin,
  } = useRequest(QQManager.getQuickLoginQQ);
  const {
    control,
    handleSubmit: handleOnebotSubmit,
    formState: { isSubmitting },
    setValue: setOnebotValue,
  } = useForm<{
    quickLoginQQ: string;
  }>({
    defaultValues: {
      quickLoginQQ: '',
    },
  });

  const reset = () => {
    setOnebotValue('quickLoginQQ', quickLoginData ?? '');
  };

  const onSubmit = handleOnebotSubmit(async (data) => {
    try {
      await QQManager.setQuickLoginQQ(data.quickLoginQQ);
      toast.success('保存成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存失败: ${msg}`);
    }
  });

  const onRefresh = async () => {
    try {
      await refreshQuickLogin();
      toast.success('刷新成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`刷新失败: ${msg}`);
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
  }, [quickLoginData]);

  if (quickLoginLoading) return <PageLoading loading />;

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
      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting || quickLoginLoading}
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
    </>
  );
};

export default LoginConfigCard;
