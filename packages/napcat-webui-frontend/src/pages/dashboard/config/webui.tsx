import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { IoQrCode } from 'react-icons/io5';
import { QRCodeSVG } from 'qrcode.react';

import key from '@/const/key';

import SaveButtons from '@/components/button/save_buttons';
import ImageInput from '@/components/input/image_input';

import { siteConfig } from '@/config/site';
import WebUIManager from '@/controllers/webui_manager';

// Base64URL to Uint8Array converter
function base64UrlToUint8Array (base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Uint8Array to Base64URL converter
function uint8ArrayToBase64Url (uint8Array: Uint8Array): string {
  const base64 = window.btoa(String.fromCharCode(...uint8Array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const WebUIConfigCard = () => {
  const {
    control,
    handleSubmit: handleWebuiSubmit,
    formState: { isSubmitting },
    setValue: setWebuiValue,
  } = useForm({
    defaultValues: {
      background: '',
      customIcons: {} as Record<string, string>,
    },
  });

  const [b64img, setB64img] = useLocalStorage(key.backgroundImage, '');
  const [customIcons, setCustomIcons] = useLocalStorage<Record<string, string>>(
    key.customIcons,
    {}
  );
  const [registrationOptions, setRegistrationOptions] = useState<any>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // 2FA 相关状态
  const [twoFAStatus, setTwoFAStatus] = useState<{ enable2FA: boolean; hasSecret: boolean }>({ enable2FA: false, hasSecret: false });
  const [twoFASecret, setTwoFASecret] = useState<string>('');
  const [twoFAQrCodeUrl, setTwoFAQrCodeUrl] = useState<string>('');
  const [twoFATotpCode, setTwoFATotpCode] = useState<string>('');
  const [disableTotpCode, setDisableTotpCode] = useState<string>('');
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  const loadTwoFAStatus = async () => {
    try {
      const status = await WebUIManager.get2FAStatus();
      setTwoFAStatus(status);
    } catch (error) {
      console.error('获取2FA状态失败:', error);
    }
  };

  const generateTwoFASecret = async () => {
    setIsGeneratingSecret(true);
    try {
      const data = await WebUIManager.generate2FASecret();
      setTwoFASecret(data.secret);
      setTwoFAQrCodeUrl(data.qrCodeUrl);
      toast.success('密钥已生成，请使用Authenticator应用扫码');
    } catch (error) {
      toast.error(`生成密钥失败: ${(error as Error).message}`);
    } finally {
      setIsGeneratingSecret(false);
    }
  };

  const enableTwoFA = async () => {
    if (!twoFASecret || !twoFATotpCode) {
      toast.error('请先生成密钥并输入验证码');
      return;
    }
    if (twoFATotpCode.length !== 6) {
      toast.error('验证码必须是6位数字');
      return;
    }
    setIsEnabling2FA(true);
    try {
      await WebUIManager.enable2FA(twoFASecret, twoFATotpCode);
      await loadTwoFAStatus();
      setTwoFASecret('');
      setTwoFAQrCodeUrl('');
      setTwoFATotpCode('');
      toast.success('双因素认证已启用');
    } catch (error) {
      toast.error(`启用失败: ${(error as Error).message}`);
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const disableTwoFA = async () => {
    if (!disableTotpCode || disableTotpCode.length !== 6) {
      toast.error('请输入6位验证码');
      return;
    }
    setIsDisabling2FA(true);
    try {
      await WebUIManager.disable2FA(disableTotpCode);
      await loadTwoFAStatus();
      setDisableTotpCode('');
      toast.success('双因素认证已禁用');
    } catch (error) {
      toast.error(`禁用失败: ${(error as Error).message}`);
    } finally {
      setIsDisabling2FA(false);
    }
  };

  useEffect(() => {
    loadTwoFAStatus();
  }, []);

  // 修改密码独立表单
  const navigate = useNavigate();
  const [, setToken] = useLocalStorage(key.token, '');
  const {
    control: pwdControl,
    handleSubmit: handlePwdSubmit,
    formState: { isSubmitting: isPwdSubmitting, errors: pwdErrors },
    watch,
  } = useForm<{
    oldToken: string;
    newToken: string;
  }>({
    defaultValues: {
      oldToken: '',
      newToken: '',
    },
  });
  const oldTokenValue = watch('oldToken');

  // 修复类型错误：显式包装为无参函数，满足 onPress 的类型要求
  const onPasswordSubmit = handlePwdSubmit(async (data) => {
    try {
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

  // 预先获取注册选项（可以在任何时候调用）
  const preloadRegistrationOptions = async () => {
    setIsLoadingOptions(true);
    try {
      console.log('预先获取注册选项...');
      const options = await WebUIManager.generatePasskeyRegistrationOptions();
      setRegistrationOptions(options);
      console.log('✅ 注册选项已获取并存储');
      toast.success('注册选项已准备就绪，请点击注册按钮');
    } catch (error) {
      console.error('❌ 获取注册选项失败:', error);
      toast.error('获取注册选项失败，请重试');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const reset = () => {
    setWebuiValue('customIcons', customIcons);
    setWebuiValue('background', b64img);
  };

  const onSubmit = handleWebuiSubmit((data) => {
    try {
      setCustomIcons(data.customIcons);
      setB64img(data.background);
      toast.success('保存成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存失败: ${msg}`);
    }
  });

  useEffect(() => {
    reset();
  }, [customIcons, b64img]);

  return (
    <>
      <title>WebUI配置 - NapCat WebUI</title>

      {/* 修改密码区块 - 移到顶部 */}
      <div className='flex flex-col gap-4'>
        <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>修改密码</div>
        <Controller
          control={pwdControl}
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
              isInvalid={!!pwdErrors.oldToken}
              errorMessage={pwdErrors.oldToken?.message}
            />
          )}
        />
        <Controller
          control={pwdControl}
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
              if (!/[a-zA-Z]/.test(value)) {
                return '新密码必须包含字母';
              }
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
              isInvalid={!!pwdErrors.newToken}
              errorMessage={pwdErrors.newToken?.message}
            />
          )}
        />
        {/* 自定义确认按钮，无取消按钮；onPress 调用 onPasswordSubmit（已通过 handlePwdSubmit 包装，类型兼容） */}
        <div className='flex justify-end'>
          <Button
            color='primary'
            onPress={() => { onPasswordSubmit(); }}
            isLoading={isPwdSubmitting}
          >
            确认修改密码
          </Button>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>背景图</div>
        <Controller
          control={control}
          name='background'
          render={({ field }) => (
            <ImageInput
              {...field}
            />
          )}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>自定义图标</div>
        {siteConfig.navItems.map((item) => (
          <Controller
            key={item.label}
            control={control}
            name={`customIcons.${item.label}`}
            render={({ field }) => (
              <ImageInput
                {...field}
                label={item.label}
              />
            )}
          />
        ))}
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>Passkey认证</div>

        {!window.isSecureContext
          ? (
            <div className='text-sm text-warning-500 bg-warning-50 p-2 rounded-md border border-warning-200'>
              ⚠️ 当前处于非安全环境（即既非 HTTPS 也非 localhost），浏览器已禁用 WebAuthn 功能。<br />
              如果您是通过局域网 IP 访问 WebUI，将无法注册和使用 Passkey。
            </div>
          )
          : (
            <>
              <div className='text-sm text-default-400 mb-2'>
                注册Passkey后，您可以更便捷地登录WebUI，无需每次输入token
              </div>
              <div className='flex gap-2'>
                <Button
                  color='secondary'
                  variant='flat'
                  onPress={preloadRegistrationOptions}
                  isLoading={isLoadingOptions}
                  className='w-fit'
                >
                  {!isLoadingOptions}
                  准备选项
                </Button>
                <Button
                  color='primary'
                  variant='flat'
                  onPress={() => {
                  // 必须在用户手势的同步上下文中立即调用WebAuthn API
                    if (!registrationOptions) {
                      toast.error('请先点击"准备选项"按钮获取注册选项');
                      return;
                    }

                    console.log('开始Passkey注册...');
                    console.log('使用预先获取的选项:', registrationOptions);

                    if (!navigator.credentials || !navigator.credentials.create) {
                      toast.error('当前浏览器环境不支持 Passkey 注册。');
                      return;
                    }

                    // 立即调用WebAuthn API，不要用async/await
                    navigator.credentials.create({
                      publicKey: {
                        challenge: base64UrlToUint8Array(registrationOptions.challenge) as BufferSource,
                        rp: {
                          name: registrationOptions.rp.name,
                          id: registrationOptions.rp.id,
                        },
                        user: {
                          id: base64UrlToUint8Array(registrationOptions.user.id) as BufferSource,
                          name: registrationOptions.user.name,
                          displayName: registrationOptions.user.displayName,
                        },
                        pubKeyCredParams: registrationOptions.pubKeyCredParams,
                        timeout: 30000,
                        excludeCredentials: registrationOptions.excludeCredentials?.map((cred: any) => ({
                          id: base64UrlToUint8Array(cred.id) as BufferSource,
                          type: cred.type,
                          transports: cred.transports,
                        })) || [],
                        attestation: registrationOptions.attestation,
                      },
                    }).then(async (credential) => {
                      console.log('✅ 注册成功！凭据已创建');
                      console.log('凭据ID:', (credential as PublicKeyCredential).id);
                      console.log('凭据类型:', (credential as PublicKeyCredential).type);

                      // Prepare response for verification - convert to expected format
                      const cred = credential as PublicKeyCredential;
                      const response = {
                        id: cred.id,  // 保持为base64url字符串
                        rawId: uint8ArrayToBase64Url(new Uint8Array(cred.rawId)),  // 转换为base64url字符串
                        response: {
                          attestationObject: uint8ArrayToBase64Url(new Uint8Array((cred.response as AuthenticatorAttestationResponse).attestationObject)),  // 转换为base64url字符串
                          clientDataJSON: uint8ArrayToBase64Url(new Uint8Array(cred.response.clientDataJSON)),  // 转换为base64url字符串
                          transports: (cred.response as AuthenticatorAttestationResponse).getTransports?.() || [],
                        },
                        type: cred.type,
                      };

                      console.log('准备验证响应:', response);

                      try {
                      // Verify registration
                        const result = await WebUIManager.verifyPasskeyRegistration(response);

                        if (result.verified) {
                          toast.success('Passkey注册成功！现在您可以使用Passkey自动登录');
                          setRegistrationOptions(null); // 清除已使用的选项
                        } else {
                          throw new Error('Passkey registration failed');
                        }
                      } catch (verifyError) {
                        console.error('❌ 验证失败:', verifyError);
                        const err = verifyError as Error;
                        toast.error(`Passkey验证失败: ${err.message}`);
                      }
                    }).catch((error) => {
                      console.error('❌ 注册失败:', error);
                      const err = error as Error;
                      console.error('错误名称:', err.name);
                      console.error('错误信息:', err.message);

                      // Provide more specific error messages
                      if (err.name === 'NotAllowedError') {
                        toast.error('Passkey注册被拒绝。请确保您允许了生物识别认证权限。');
                      } else if (err.name === 'NotSupportedError') {
                        toast.error('您的浏览器不支持Passkey功能。');
                      } else if (err.name === 'SecurityError') {
                        toast.error('安全错误：请确保使用HTTPS或localhost环境。');
                      } else {
                        toast.error(`Passkey注册失败: ${err.message}`);
                      }
                    });
                  }}
                  disabled={!registrationOptions}
                  className='w-fit'
                >
                  注册Passkey
                </Button>
              </div>
              {registrationOptions && (
                <div className='text-xs text-green-600'>
                  注册选项已准备就绪，可以开始注册
                </div>
              )}
            </>
          )}
      </div>

      {/* 双因素认证 (2FA) */}
      <div className='flex flex-col gap-2'>
        <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1 flex items-center gap-2'>
          <span>双因素认证 (2FA)</span>
          <span className={`text-sm px-2 py-0.5 rounded-full ${twoFAStatus.enable2FA ? 'bg-green-100 text-green-700' : 'bg-default-200 text-default-600'}`}>
            {twoFAStatus.enable2FA ? '已启用' : '已禁用'}
          </span>
        </div>

        {twoFAStatus.enable2FA ? (
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <div className='text-sm text-green-700 mb-3'>✅ 双因素认证已启用</div>
            <div className='mb-3'>
              <div className='text-sm text-default-600 mb-2'>输入验证码以禁用</div>
              <input
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={6}
                value={disableTotpCode}
                onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder='000000'
                className='w-32 px-3 py-2 border border-default-300 rounded-lg text-center text-lg tracking-widest'
              />
            </div>
            <Button
              color='danger'
              variant='flat'
              onPress={disableTwoFA}
              isLoading={isDisabling2FA}
              disabled={!disableTotpCode || disableTotpCode.length !== 6}
              className='w-fit'
            >
              禁用双因素认证
            </Button>
          </div>
        ) : (
          <>
            <div className='text-sm text-default-400 mb-2'>
              启用双因素认证后，登录时需要额外输入Authenticator应用生成的验证码
            </div>
            <div className='bg-default-50 border border-default-200 rounded-lg p-4'>
              <Button
                color='secondary'
                variant='flat'
                onPress={generateTwoFASecret}
                isLoading={isGeneratingSecret}
                className='w-fit mb-4'
              >
                <IoQrCode className='mr-2' />
                生成密钥
              </Button>

              {twoFASecret && (
                <>
                  <div className='mb-4'>
                    <div className='text-sm text-default-600 mb-2'>请使用 Authenticator 应用扫描下方二维码</div>
                    <div className='flex items-center gap-4'>
                      <div className='bg-white border border-default-300 rounded-lg p-3'>
                        <QRCodeSVG
                          value={twoFAQrCodeUrl}
                          size={128}
                          level='M'
                          includeMargin={false}
                        />
                      </div>
                      <div>
                        <div className='text-xs text-default-500 mb-1'>密钥（手动输入用）</div>
                        <div className='font-mono text-sm bg-default-100 px-3 py-2 rounded break-all max-w-[200px]'>
                          {twoFASecret}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='mb-4'>
                    <div className='text-sm text-default-600 mb-2'>输入Authenticator验证码</div>
                    <input
                      type='text'
                      inputMode='numeric'
                      pattern='[0-9]*'
                      maxLength={6}
                      value={twoFATotpCode}
                      onChange={(e) => setTwoFATotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder='000000'
                      className='w-32 px-3 py-2 border border-default-300 rounded-lg text-center text-lg tracking-widest'
                    />
                  </div>
                  <Button
                    color='primary'
                    variant='flat'
                    onPress={enableTwoFA}
                    isLoading={isEnabling2FA}
                    disabled={!twoFATotpCode || twoFATotpCode.length !== 6}
                    className='w-fit'
                  >
                    启用双因素认证
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default WebUIConfigCard;