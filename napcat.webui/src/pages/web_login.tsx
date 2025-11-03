import { Button } from '@heroui/button';
import { CardBody, CardHeader } from '@heroui/card';
import { Image } from '@heroui/image';
import { Input } from '@heroui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoKeyOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import key from '@/const/key';

import HoverEffectCard from '@/components/effect_card';
import { title } from '@/components/primitives';
import { ThemeSwitch } from '@/components/theme-switch';

import logo from '@/assets/images/logo.png';
import WebUIManager from '@/controllers/webui_manager';
import PureLayout from '@/layouts/pure';

export default function WebLoginPage () {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const token = urlSearchParams.get('token');
  const navigate = useNavigate();
  const [tokenValue, setTokenValue] = useState<string>(token || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setLocalToken] = useLocalStorage<string>(key.token, '');
  const onSubmit = async () => {
    if (!tokenValue) {
      toast.error('请输入token');

      return;
    }
    setIsLoading(true);
    try {
      const data = await WebUIManager.loginWithToken(tokenValue);

      if (data) {
        setLocalToken(data);
        navigate('/qq_login', { replace: true });
      }
    } catch (_error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理全局键盘事件
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSubmit();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tokenValue, isLoading]); // 依赖项包含用于登录的状态

  useEffect(() => {
    if (token) {
      onSubmit();
    }
  }, []);

  return (
    <>
      <title>WebUI登录 - NapCat WebUI</title>
      <PureLayout>
        <div className='w-[608px] max-w-full py-8 px-2 md:px-8 overflow-hidden'>
          <HoverEffectCard
            className='items-center gap-4 pt-0 pb-6 bg-default-50'
            maxXRotation={3}
            maxYRotation={3}
          >
            <CardHeader className='inline-block max-w-lg text-center justify-center'>
              <div className='flex items-center justify-center w-full gap-2 pt-10'>
                <Image alt='logo' height='7em' src={logo} />
                <div>
                  <span className={title()}>Web&nbsp;</span>
                  <span className={title({ color: 'violet' })}>
                    Login&nbsp;
                  </span>
                </div>
              </div>
              <ThemeSwitch className='absolute right-4 top-4' />
            </CardHeader>

            <CardBody className='flex gap-5 py-5 px-5 md:px-10'>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                {/* 隐藏的用户名字段，帮助浏览器识别登录表单 */}
                <input
                  type='text'
                  name='username'
                  value='napcat-webui'
                  autoComplete='username'
                  className='absolute -left-[9999px] opacity-0 pointer-events-none'
                  readOnly
                  tabIndex={-1}
                  aria-label='Username'
                />
                <Input
                  isClearable
                  type='password'
                  name='password'
                  autoComplete='current-password'
                  classNames={{
                    label: 'text-black/50 dark:text-white/90',
                    input: [
                      'bg-transparent',
                      'text-black/90 dark:text-white/90',
                      'placeholder:text-default-700/50 dark:placeholder:text-white/60',
                    ],
                    innerWrapper: 'bg-transparent',
                    inputWrapper: [
                      'shadow-xl',
                      'bg-default-100/70',
                      'dark:bg-default/60',
                      'backdrop-blur-xl',
                      'backdrop-saturate-200',
                      'hover:bg-default-0/70',
                      'dark:hover:bg-default/70',
                      'group-data-[focus=true]:bg-default-100/50',
                      'dark:group-data-[focus=true]:bg-default/60',
                      '!cursor-text',
                    ],
                  }}
                  isDisabled={isLoading}
                  label='Token'
                  placeholder='请输入token'
                  radius='lg'
                  size='lg'
                  startContent={
                    <IoKeyOutline className='text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0' />
                  }
                  value={tokenValue}
                  onChange={(e) => setTokenValue(e.target.value)}
                  onClear={() => setTokenValue('')}
                />
              </form>
              <div className='text-center text-small text-default-600 dark:text-default-400 px-2'>
                💡 提示：请从 NapCat 启动日志中查看登录密钥
              </div>
              <Button
                className='mx-10 mt-10 text-lg py-7'
                color='primary'
                isLoading={isLoading}
                radius='full'
                size='lg'
                variant='shadow'
                onPress={onSubmit}
              >
                {!isLoading && (
                  <Image
                    alt='logo'
                    classNames={{
                      wrapper: '-ml-8',
                    }}
                    height='2em'
                    src={logo}
                  />
                )}
                登录
              </Button>
            </CardBody>
          </HoverEffectCard>
        </div>
      </PureLayout>
    </>
  );
}
