import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { Avatar } from '@heroui/avatar';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import SaveButtons from '@/components/button/save_buttons';
import GUIDManager from '@/components/guid_manager';
import PageLoading from '@/components/page_loading';

import QQManager from '@/controllers/qq_manager';
import ProcessManager from '@/controllers/process_manager';
import { waitForBackendReady } from '@/utils/process_utils';

const LoginConfigCard = () => {
  const [isRestarting, setIsRestarting] = useState(false);
  const [loginList, setLoginList] = useState<LoginListItem[]>([]);
  const [loginListLoading, setLoginListLoading] = useState(false);
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
    watch,
  } = useForm<{
    quickLoginQQ: string;
  }>({
    defaultValues: {
      quickLoginQQ: '',
    },
  });

  const currentQQ = watch('quickLoginQQ');

  const reset = () => {
    setOnebotValue('quickLoginQQ', quickLoginData ?? '');
  };

  const fetchLoginList = async () => {
    try {
      setLoginListLoading(true);
      const list = await QQManager.getQQQuickLoginListNew();
      setLoginList(list ?? []);
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`获取账号列表失败: ${msg}`);
    } finally {
      setLoginListLoading(false);
    }
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
      <title>登录配置 - NapCat WebUI</title>
      <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>快速登录QQ</div>
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
            classNames={{
              inputWrapper:
                'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
              input: 'bg-transparent text-default-700 placeholder:text-default-400',
            }}
          />
        )}
      />

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            color='primary'
            variant='flat'
            onPress={fetchLoginList}
            isLoading={loginListLoading}
          >
            获取已登录账号列表
          </Button>
          {loginList.length > 0 && (
            <span className='text-xs text-default-400'>
              共 {loginList.length} 个账号，点击选择
            </span>
          )}
        </div>
        {loginList.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            {loginList.filter(item => item.isQuickLogin).map((item) => (
              <button
                key={item.uin}
                type='button'
                onClick={() => setOnebotValue('quickLoginQQ', item.uin)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left
                  ${currentQQ === item.uin
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-sm'
                    : 'border-default-200 dark:border-default-100/10 bg-default-100/50 dark:bg-white/5 hover:bg-default-200/50 dark:hover:bg-white/10'
                  }`}
              >
                <Avatar
                  src={item.faceUrl}
                  name={item.nickName?.charAt(0) || item.uin.charAt(0)}
                  size='sm'
                  className='flex-shrink-0'
                />
                <div className='flex flex-col min-w-0'>
                  <span className='text-sm font-medium text-default-700 truncate'>
                    {item.nickName || '未知昵称'}
                  </span>
                  <span className='text-xs text-default-400 truncate'>
                    {item.uin}
                  </span>
                </div>
                {currentQQ === item.uin && (
                  <span className='ml-auto text-xs text-primary font-medium flex-shrink-0'>已选择</span>
                )}
              </button>
            ))}
            {loginList.filter(item => !item.isQuickLogin).length > 0 && (
              <div className='col-span-full text-xs text-default-400 mt-1'>
                以下账号不支持快速登录：
                {loginList.filter(item => !item.isQuickLogin).map(item => item.uin).join('、')}
              </div>
            )}
          </div>
        )}
      </div>

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
