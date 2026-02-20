import { Button } from '@heroui/button';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

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

              // 立即调用WebAuthn API，不要用async/await
              navigator.credentials.create({
                publicKey: {
                  challenge: base64UrlToUint8Array(registrationOptions.challenge) as BufferSource,
                  rp: {
                    name: registrationOptions.rp.name,
                    id: registrationOptions.rp.id
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
