import { Input } from '@heroui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import key from '@/const/key';

import SaveButtons from '@/components/button/save_buttons';

import WebUIManager from '@/controllers/webui_manager';

const ChangePasswordCard = () => {
  const {
    control,
    handleSubmit: handleWebuiSubmit,
    formState: { isSubmitting, errors },
    reset,
    watch,
  } = useForm<{
    oldToken: string
    newToken: string
  }>({
    defaultValues: {
      oldToken: '',
      newToken: '',
    },
  });

  const navigate = useNavigate();
  const [, setToken] = useLocalStorage(key.token, '');

  // 监听旧密码的值
  const oldTokenValue = watch('oldToken');

  const onSubmit = handleWebuiSubmit(async (data) => {
    try {
      // 使用正常密码更新流程
      await WebUIManager.changePassword(data.oldToken, data.newToken);

      toast.success('修改成功');
      setToken('');
      localStorage.removeItem(key.token);
      navigate('/web_login');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`修改失败: ${msg}`);
    }
  });

  return (
    <>
      <title>修改密码 - NapCat WebUI</title>

      <Controller
        control={control}
        name='oldToken'
        rules={{
          required: '旧密码不能为空',
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return '旧密码不能为空';
            }
            return true;
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            label='旧密码'
            placeholder='请输入旧密码'
            type='password'
            isRequired
            isInvalid={!!errors.oldToken}
            errorMessage={errors.oldToken?.message}
          />
        )}
      />

      <Controller
        control={control}
        name='newToken'
        rules={{
          required: '新密码不能为空',
          minLength: {
            value: 6,
            message: '新密码至少需要6个字符',
          },
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return '新密码不能为空';
            }
            if (value.trim().length !== value.length) {
              return '新密码不能包含前后空格';
            }
            if (value === oldTokenValue) {
              return '新密码不能与旧密码相同';
            }
            // 检查是否包含字母
            if (!/[a-zA-Z]/.test(value)) {
              return '新密码必须包含字母';
            }
            // 检查是否包含数字
            if (!/[0-9]/.test(value)) {
              return '新密码必须包含数字';
            }
            return true;
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            label='新密码'
            placeholder='至少6位，包含字母和数字'
            type='password'
            isRequired
            isInvalid={!!errors.newToken}
            errorMessage={errors.newToken?.message}
          />
        )}
      />

      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default ChangePasswordCard;
