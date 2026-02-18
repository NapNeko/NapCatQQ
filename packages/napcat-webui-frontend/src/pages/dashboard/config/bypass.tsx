import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import SaveButtons from '@/components/button/save_buttons';
import PageLoading from '@/components/page_loading';
import SwitchCard from '@/components/switch_card';

import QQManager from '@/controllers/qq_manager';

interface BypassFormData {
  hook: boolean;
  window: boolean;
  module: boolean;
  process: boolean;
  container: boolean;
  js: boolean;
}

const defaultBypass: BypassFormData = {
  hook: true,
  window: true,
  module: true,
  process: true,
  container: true,
  js: true,
};

const BypassConfigCard = () => {
  const [loading, setLoading] = useState(true);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<BypassFormData>({
    defaultValues: defaultBypass,
  });

  const loadConfig = async (showTip = false) => {
    try {
      setLoading(true);
      const config = await QQManager.getNapCatConfig();
      const bypass = config.bypass ?? defaultBypass;
      setValue('hook', bypass.hook ?? true);
      setValue('window', bypass.window ?? true);
      setValue('module', bypass.module ?? true);
      setValue('process', bypass.process ?? true);
      setValue('container', bypass.container ?? true);
      setValue('js', bypass.js ?? true);
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
      await QQManager.setNapCatConfig({ bypass: data });
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
      <title>反检测配置 - NapCat WebUI</title>
      <div className='flex flex-col gap-1 mb-2'>
        <h3 className='text-lg font-semibold text-default-700'>反检测开关配置</h3>
        <p className='text-sm text-default-500'>
          控制 Napi2Native 模块的各项反检测功能，修改后需重启生效。
        </p>
      </div>
      <Controller
        control={control}
        name='hook'
        render={({ field }) => (
          <SwitchCard
            {...field}
            label='Hook'
            description='hook特征隐藏'
          />
        )}
      />
      <Controller
        control={control}
        name='window'
        render={({ field }) => (
          <SwitchCard
            {...field}
            label='Window'
            description='窗口伪造'
          />
        )}
      />
      <Controller
        control={control}
        name='module'
        render={({ field }) => (
          <SwitchCard
            {...field}
            label='Module'
            description='加载模块隐藏'
          />
        )}
      />
      <Controller
        control={control}
        name='process'
        render={({ field }) => (
          <SwitchCard
            {...field}
            label='Process'
            description='进程反检测'
          />
        )}
      />
      <Controller
        control={control}
        name='container'
        render={({ field }) => (
          <SwitchCard
            {...field}
            label='Container'
            description='容器反检测'
          />
        )}
      />
      <Controller
        control={control}
        name='js'
        render={({ field }) => (
          <SwitchCard
            {...field}
            label='JS'
            description='JS反检测'
          />
        )}
      />
      <SaveButtons
        onSubmit={onSubmit}
        reset={onReset}
        isSubmitting={isSubmitting}
        refresh={onRefresh}
      />
    </>
  );
};

export default BypassConfigCard;
