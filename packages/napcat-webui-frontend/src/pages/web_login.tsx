import { Button } from '@heroui/button';
import { CardBody, CardHeader } from '@heroui/card';
import { Image } from '@heroui/image';
import { Input } from '@heroui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoKeyOutline, IoLockClosed, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import logo from '@/assets/images/logo.png';

import key from '@/const/key';

import HoverEffectCard from '@/components/effect_card';
import { title } from '@/components/primitives';
import { ThemeSwitch } from '@/components/theme-switch';

import WebUIManager from '@/controllers/webui_manager';
import PureLayout from '@/layouts/pure';
import { motion } from 'motion/react';

type LoginStep = 'token' | '2fa';

export default function WebLoginPage () {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const token = urlSearchParams.get('token');
  const navigate = useNavigate();
  const [tokenValue, setTokenValue] = useState<string>(token || '');
  const [totpCode, setTotpCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState<boolean>(true);
  const [loginStep, setLoginStep] = useState<LoginStep>('token');
  const [, setLocalToken] = useLocalStorage<string>(key.token, '');

  function base64UrlToUint8Array (base64Url: string): Uint8Array {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function uint8ArrayToBase64Url (uint8Array: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...uint8Array));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  const tryPasskeyLogin = async () => {
    if (!navigator.credentials || !navigator.credentials.get) {
      return;
    }
    try {
      const options = await WebUIManager.generatePasskeyAuthenticationOptions();

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: base64UrlToUint8Array(options.challenge) as BufferSource,
          allowCredentials: options.allowCredentials?.map((cred: any) => ({
            id: base64UrlToUint8Array(cred.id) as BufferSource,
            type: cred.type,
            transports: cred.transports,
          })),
          userVerification: options.userVerification,
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Passkey authentication cancelled');
      }

      const authResponse = credential.response as AuthenticatorAssertionResponse;
      const response = {
        id: credential.id,
        rawId: uint8ArrayToBase64Url(new Uint8Array(credential.rawId)),
        response: {
          authenticatorData: uint8ArrayToBase64Url(new Uint8Array(authResponse.authenticatorData)),
          clientDataJSON: uint8ArrayToBase64Url(new Uint8Array(authResponse.clientDataJSON)),
          signature: uint8ArrayToBase64Url(new Uint8Array(authResponse.signature)),
          userHandle: authResponse.userHandle ? uint8ArrayToBase64Url(new Uint8Array(authResponse.userHandle)) : null,
        },
        type: credential.type,
      };

      const data = await WebUIManager.verifyPasskeyAuthentication(response);

      if (data) {
        if (data.require2FA) {
          setLoginStep('2fa');
          return true;
        }
        if (data.Credential) {
          setLocalToken(data.Credential);
          navigate('/qq_login', { replace: true });
          return true;
        }
      }
    } catch (error) {
      console.log('Passkey login failed or not available:', error);
    }
    return false;
  };

  const onTokenSubmit = async () => {
    if (!tokenValue) {
      toast.error('请输入token');
      return;
    }
    setIsLoading(true);
    try {
      const data = await WebUIManager.loginWithToken(tokenValue);

      if (data) {
        if (data.require2FA) {
          setLoginStep('2fa');
          return;
        }
        setLocalToken(data.Credential);
        navigate('/qq_login', { replace: true });
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const on2FASubmit = async () => {
    if (!totpCode) {
      toast.error('请输入验证码');
      return;
    }
    if (totpCode.length !== 6) {
      toast.error('验证码必须是6位数字');
      return;
    }
    setIsLoading(true);
    try {
      const data = await WebUIManager.loginWithToken(tokenValue, totpCode);

      if (data && data.Credential) {
        setLocalToken(data.Credential);
        navigate('/qq_login', { replace: true });
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToToken = () => {
    setLoginStep('token');
    setTotpCode('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isPasskeyLoading) {
      if (loginStep === 'token') {
        onTokenSubmit();
      } else {
        on2FASubmit();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tokenValue, totpCode, isLoading, isPasskeyLoading, loginStep]);

  useEffect(() => {
    if (token) {
      setIsPasskeyLoading(false);
      onTokenSubmit();
      return;
    }

    tryPasskeyLogin().finally(() => {
      setIsPasskeyLoading(false);
    });
  }, []);

  return (
    <>
      <title>WebUI登录 - NapCat WebUI</title>
      <PureLayout>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
          className='w-[608px] max-w-full py-8 px-2 md:px-8 overflow-hidden'
        >
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
              {isPasskeyLoading && loginStep === 'token' && (
                <div className='text-center text-small text-default-600 dark:text-default-400 px-2'>
                  🔐 正在检查Passkey...
                </div>
              )}

              {loginStep === 'token' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onTokenSubmit();
                  }}
                >
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
                    isDisabled={isLoading || isPasskeyLoading}
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
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    on2FASubmit();
                  }}
                >
                  <div className='flex items-center gap-2 mb-4 cursor-pointer' onClick={goBackToToken}>
                    <IoLockClosed className='text-sm text-default-500' />
                    <span className='text-sm text-default-500 hover:text-default-700'>返回密码输入</span>
                  </div>
                  <Input
                    type='text'
                    inputMode='numeric'
                    pattern='[0-9]*'
                    maxLength={6}
                    classNames={{
                      label: 'text-black/50 dark:text-white/90',
                      input: [
                        'bg-transparent text-center text-2xl tracking-widest',
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
                    label='验证码'
                    placeholder='000000'
                    radius='lg'
                    size='lg'
                    startContent={
                      <IoCheckmarkCircleOutline className='text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0' />
                    }
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <div className='text-center text-small text-default-600 dark:text-default-400 px-2 mt-4'>
                    💡 请打开 Authenticator 应用获取验证码
                  </div>
                </form>
              )}

              {loginStep === 'token' && (
                <div className='text-center text-small text-default-600 dark:text-default-400 px-2'>
                  💡 提示：请从 NapCat 启动日志中查看登录密钥
                </div>
              )}

              <Button
                className='mx-10 mt-10 text-lg py-7'
                color='primary'
                isLoading={isLoading}
                radius='full'
                size='lg'
                variant='shadow'
                onPress={loginStep === 'token' ? onTokenSubmit : on2FASubmit}
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
                {loginStep === 'token' ? '登录' : '验证'}
              </Button>
            </CardBody>
          </HoverEffectCard>
        </motion.div>
      </PureLayout>
    </>
  );
}