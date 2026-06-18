import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import SaveButtons from '@/components/button/save_buttons';
import PageLoading from '@/components/page_loading';
import SwitchCard from '@/components/switch_card';

import QQManager from '@/controllers/qq_manager';

interface CoreFormData {
  fileLog: boolean;
  consoleLog: boolean;
  autoTimeSync: boolean;
}

const CoreConfigCard = () => {
  const [loading, setLoading] = useState(true);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<CoreFormData>();

  const loadConfig = async (showTip = false) => {
    try {
      setLoading(true);
      const config = await QQManager.getNapCatUinConfig();
      setValue('fileLog', config.fileLog ?? false);
      setValue('consoleLog', config.consoleLog ?? true);
      setValue('autoTimeSync', config.autoTimeSync ?? true);
      if (showTip) toast.success('刷新成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`获取配置失败: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await QQManager.setNapCatUinConfig(data);
      toast.success('保存成功，重启后生效');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存失败: ${msg}`);
    }
  });

  const onReset = () => {
    loadConfig();
  };

  const onRefresh = async () => {
    await loadConfig(true);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  if (loading) return <PageLoading loading />;

  return (
    <>
      <title>核心配置 - NapCat WebUI</title>
      <div className='flex flex-col gap-1 mb-2'>
        <h3 className='text-lg font-semibold text-default-700'>NapCat 核心配置</h3>
        <p className='text-sm text-default-500'>
          控制 NapCat 框架底层的核心行为设定，修改后需重启生效。
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        <Controller
          control={control}
          name='autoTimeSync'
          render={({ field }) => (
            <SwitchCard
              {...field}
              label='自动对时'
              description='自动校验并矫正系统时间偏差'
            />
          )}
        />
        <Controller
          control={control}
          name='fileLog'
          render={({ field }) => (
            <SwitchCard
              {...field}
              label='文件日志'
              description='是否将登录后日志写入到本地文件'
            />
          )}
        />
        <Controller
          control={control}
          name='consoleLog'
          render={({ field }) => (
            <SwitchCard
              {...field}
              label='控制台日志'
              description='是否在终端标准输出显示日志'
            />
          )}
        />
      </div>
      <SaveButtons
        onSubmit={onSubmit}
        reset={onReset}
        isSubmitting={isSubmitting}
        refresh={onRefresh}
      />
    </>
  );
};

export default CoreConfigCard;
