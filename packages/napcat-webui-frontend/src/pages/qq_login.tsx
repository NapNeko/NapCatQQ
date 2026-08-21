import { Button } from '@heroui/button';
import { CardBody, CardHeader } from '@heroui/card';
import { Image } from '@heroui/image';
import { Tab, Tabs } from '@heroui/tabs';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { MdSettings } from 'react-icons/md';

import logo from '@/assets/images/logo.png';
import GUIDManager from '@/components/guid_manager';
import Modal from '@/components/modal';

import HoverEffectCard from '@/components/effect_card';
import { title } from '@/components/primitives';
import PasswordLogin from '@/components/password_login';
import QrCodeLogin from '@/components/qr_code_login';
import QuickLogin from '@/components/quick_login';
import type { QQItem } from '@/components/quick_login';
import { ThemeSwitch } from '@/components/theme-switch';
import type { CaptchaCallbackData } from '@/components/tencent_captcha';

import QQManager from '@/controllers/qq_manager';
import useDialog from '@/hooks/use-dialog';
import PureLayout from '@/layouts/pure';
import { motion } from 'motion/react';

const parseLoginError = (errorStr: string) => {
  if (errorStr.startsWith('登录失败: ')) {
    const jsonPart = errorStr.substring('登录失败: '.length);

    try {
      const parsed = JSON.parse(jsonPart);

      if (Array.isArray(parsed) && parsed[1]) {
        const info = parsed[1];
        const codeStr = info.serverErrorCode ? ` (错误码: ${info.serverErrorCode})` : '';

        return `${info.message || errorStr}${codeStr}`;
      }
    } catch (_e) {
      // 忽略解析错误
    }
  }

  return errorStr;
};

export default function QQLoginPage () {
  const navigate = useNavigate();
  const dialog = useDialog();
  const [uinValue, setUinValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qrcode, setQrcode] = useState<string>('');
  const [loginPhase, setLoginPhase] = useState<string>('waiting_qrcode');
  const [isRecoveringLoginService, setIsRecoveringLoginService] = useState(false);
  const qrcodeRef = useRef<string>('');
  const qrcodeRequestVersionRef = useRef(0);
  const isRefreshingQRCodeRef = useRef(false);
  const [loginError, setLoginError] = useState<string>('');
  const lastErrorRef = useRef<string>('');
  const [qqList, setQQList] = useState<(QQItem | LoginListItem)[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('shortcut');
  const firstLoad = useRef<boolean>(true);
  const [captchaState, setCaptchaState] = useState<{
    needCaptcha: boolean;
    proofWaterUrl: string;
    uin: string;
    password: string;
  } | null>(null);
  const [captchaVerifying, setCaptchaVerifying] = useState(false);
  const [newDeviceState, setNewDeviceState] = useState<{
    needNewDevice: boolean;
    jumpUrl: string;
    newDevicePullQrCodeSig: string;
    uin: string;
    password: string;
  } | null>(null);
  // newDevicePullQrCodeSig is kept for step:2 login after QR verification
  const onSubmit = async () => {
    if (!uinValue) {
      toast.error('请选择快捷登录的QQ');

      return;
    }
    setIsLoading(true);
    try {
      await QQManager.setQuickLogin(uinValue);
    } catch (error) {
      const msg = (error as Error).message;

      toast.error(`快速登录QQ失败: ${msg}`);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const onPasswordSubmit = async (uin: string, password: string) => {
    setIsLoading(true);
    try {
      // 计算密码的MD5值
      const passwordMd5 = CryptoJS.MD5(password).toString();
      const result = await QQManager.passwordLogin(uin, passwordMd5);
      if (result?.needCaptcha && result.proofWaterUrl) {
        // 需要验证码，显示验证码组件
        setCaptchaState({
          needCaptcha: true,
          proofWaterUrl: result.proofWaterUrl,
          uin,
          password,
        });
        toast('需要安全验证，请完成验证码', { icon: '🔒' });
      } else if (result?.needNewDevice && result.jumpUrl) {
        setNewDeviceState({
          needNewDevice: true,
          jumpUrl: result.jumpUrl,
          newDevicePullQrCodeSig: result.newDevicePullQrCodeSig || '',
          uin,
          password,
        });
        toast('检测到新设备，请扫码验证', { icon: '📱' });
      } else {
        toast.success('密码登录请求已发送');
      }
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`密码登录失败: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onCaptchaSubmit = async (uin: string, password: string, captchaData: CaptchaCallbackData) => {
    setIsLoading(true);
    setCaptchaVerifying(true);
    try {
      const passwordMd5 = CryptoJS.MD5(password).toString();
      const result = await QQManager.captchaLogin(uin, passwordMd5, captchaData.ticket, captchaData.randstr, captchaData.sid);
      if (result?.needNewDevice && result.jumpUrl) {
        setCaptchaState(null);
        setNewDeviceState({
          needNewDevice: true,
          jumpUrl: result.jumpUrl,
          newDevicePullQrCodeSig: result.newDevicePullQrCodeSig || '',
          uin,
          password,
        });
        toast('检测到异常设备，请扫码验证', { icon: '📱' });
      } else {
        toast.success('验证码登录请求已发送');
        setCaptchaState(null);
      }
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`验证码登录失败: ${msg}`);
      setCaptchaState(null);
    } finally {
      setIsLoading(false);
      setCaptchaVerifying(false);
    }
  };

  const onCaptchaCancel = () => {
    setCaptchaState(null);
  };

  const onNewDeviceVerified = async (token: string) => {
    if (!newDeviceState) return;
    setIsLoading(true);
    try {
      const passwordMd5 = CryptoJS.MD5(newDeviceState.password).toString();
      // Use the str_nt_succ_token from QR verification as newDevicePullQrCodeSig for step:2
      const sig = token || newDeviceState.newDevicePullQrCodeSig;
      const result = await QQManager.newDeviceLogin(newDeviceState.uin, passwordMd5, sig);
      if (result?.needNewDevice && result.jumpUrl) {
        // 新设备验证后又触发了异常设备验证，更新 jumpUrl
        setNewDeviceState({
          needNewDevice: true,
          jumpUrl: result.jumpUrl,
          newDevicePullQrCodeSig: result.newDevicePullQrCodeSig || '',
          uin: newDeviceState.uin,
          password: newDeviceState.password,
        });
        toast('检测到异常设备，请继续扫码验证', { icon: '📱' });
      } else {
        toast.success('新设备验证登录请求已发送');
        setNewDeviceState(null);
      }
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`新设备验证登录失败: ${msg}`);
      setNewDeviceState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onNewDeviceCancel = () => {
    setNewDeviceState(null);
  };

  const onUpdateQrCode = async () => {
    const requestVersion = qrcodeRequestVersionRef.current;
    if (firstLoad.current) setIsLoading(true);
    try {
      const data = await QQManager.checkQQLoginStatusWithQrcode();
      setLoginPhase(data.loginPhase || (data.isLogin ? 'ready' : 'waiting_qrcode'));
      if (data.loginPhase === 'reconnecting') {
        setIsRecoveringLoginService(true);
      }

      if (firstLoad.current) {
        setIsLoading(false);
        firstLoad.current = false;
      }
      if (data.isLogin) {
        toast.success('QQ登录成功');
        navigate('/', { replace: true });
      } else {
        // 刷新二维码是一个需要等待结果的操作。忽略在它开始前发出的
        // 轮询响应，避免旧 URL 在刷新完成后覆盖刚拿到的新二维码。
        if (requestVersion === qrcodeRequestVersionRef.current && !isRefreshingQRCodeRef.current) {
          qrcodeRef.current = data.qrcodeurl;
          setQrcode(data.qrcodeurl);
          if (data.qrcodeurl) {
            setIsRecoveringLoginService(false);
          }
        }
        if (data.loginError && data.loginError !== lastErrorRef.current) {
          lastErrorRef.current = data.loginError;
          setLoginError(data.loginError);
          const friendlyMsg = parseLoginError(data.loginError);

          // 被踢下线时页面会自动进入登录服务恢复流程。它不是可由用户
          // 处理的登录表单错误，也不应弹出对话框遮住恢复状态。
          const isRecovering = data.loginPhase === 'reconnecting' || isRecoveringLoginService;
          const isQrCodeExpired = friendlyMsg.includes('二维码') && (friendlyMsg.includes('过期') || friendlyMsg.includes('失效'));

          if (!isRecovering && (!isQrCodeExpired || activeTab === 'qrcode')) {
            dialog.alert({
              title: '登录失败',
              content: friendlyMsg,
              confirmText: '确定',
            });
          }
        } else if (!data.loginError) {
          lastErrorRef.current = '';
          setLoginError('');
        }
      }
    } catch (error) {
      const msg = (error as Error).message;
      // Worker 重启时，旧连接被关闭是预期现象。恢复状态持续轮询即可，
      // 不要把 ERR_EMPTY_RESPONSE 作为用户可操作的错误反复弹出。
      if (!isRecoveringLoginService) {
        toast.error(`获取二维码失败: ${msg}`);
      }
    }
  };

  const onUpdateQQList = async () => {
    setRefresh(true);
    try {
      const data = await QQManager.getQQQuickLoginListNew();
      setQQList(data);
    } catch (_error) {
      try {
        const data = await QQManager.getQQQuickLoginList();

        const qqList = data.map((item) => ({
          uin: item,
        }));

        setQQList(qqList);
      } catch (_error) {
        const msg = (_error as Error).message;

        toast.error(`获取QQ列表失败: ${msg}`);
      }
    } finally {
      setRefresh(false);
    }
  };

  const handleSelectionChange: React.ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setUinValue(e.target.value);
  };

  const onRefreshQRCode = async () => {
    if (isRecoveringLoginService || loginPhase === 'reconnecting') {
      toast('QQ 登录服务正在恢复，请等待新的二维码…', { icon: '⏳' });
      return;
    }
    if (isRefreshingQRCodeRef.current) {
      return;
    }
    qrcodeRequestVersionRef.current += 1;
    isRefreshingQRCodeRef.current = true;
    setIsRefreshingQRCode(true);
    try {
      lastErrorRef.current = '';
      setLoginError('');
      const { qrcodeurl, restarting } = await QQManager.refreshQRCode();
      if (restarting) {
        setIsRecoveringLoginService(true);
        setLoginPhase('reconnecting');
        return;
      }
      if (!qrcodeurl || qrcodeurl === qrcodeRef.current) {
        throw new Error('未获取到新的二维码');
      }
      qrcodeRef.current = qrcodeurl;
      setQrcode(qrcodeurl);
      toast.success('二维码已刷新');
    } catch (error) {
      const msg = (error as Error).message;
      if (msg.includes('QQ_LOGIN_SERVICE_RESTARTING')) {
        setIsRecoveringLoginService(true);
        setLoginPhase('reconnecting');
        toast('QQ 登录服务正在重启，正在生成新的二维码…', { icon: '⏳' });
      } else if (msg.includes('二维码刷新超时')) {
        toast.error('未能取得新的二维码，请稍后重试');
      } else {
        toast.error(`刷新二维码失败: ${msg}`);
      }
    } finally {
      qrcodeRequestVersionRef.current += 1;
      isRefreshingQRCodeRef.current = false;
      setIsRefreshingQRCode(false);
    }
  };

  const [showGUIDManager, setShowGUIDManager] = useState(false);
  const [isRefreshingQRCode, setIsRefreshingQRCode] = useState(false);

  useEffect(() => {
    const isLoginTransitioning = loginPhase === 'qrcode_scanned' || loginPhase === 'initializing' || loginPhase === 'reconnecting' || isRecoveringLoginService;
    const pollInterval = isRefreshingQRCode || isLoginTransitioning ? 500 : 3000;
    const timer = setInterval(() => {
      onUpdateQrCode();
    }, pollInterval);

    onUpdateQrCode();
    onUpdateQQList();

    return () => clearInterval(timer);
  }, [isRefreshingQRCode, loginPhase, isRecoveringLoginService]);

  useEffect(() => {
    if (!isRecoveringLoginService) return;
    const timer = setTimeout(() => {
      setIsRecoveringLoginService(false);
      setLoginPhase('offline');
      setLoginError('QQ 登录服务恢复超时，请稍后重试');
    }, 180_000);
    return () => clearTimeout(timer);
  }, [isRecoveringLoginService]);

  return (
    <>
      <title>QQ登录 - NapCat WebUI</title>
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
              <div className='absolute right-4 top-4 flex items-center gap-2'>
                <Button isIconOnly variant='light' aria-label='Settings' onPress={() => setShowGUIDManager(true)}>
                  <MdSettings size={22} />
                </Button>
                <ThemeSwitch />
              </div>
            </CardHeader>

            <CardBody className='flex gap-5 p-10 pt-0'>
              <Tabs
                fullWidth
                classNames={{
                  tabList: 'shadow-sm dark:shadow-none',
                }}
                isDisabled={isLoading}
                size='lg'
                selectedKey={activeTab}
                onSelectionChange={(key) => key !== null && setActiveTab(key.toString())}
              >
                <Tab key='shortcut' title='快速登录'>
                  <QuickLogin
                    handleSelectionChange={handleSelectionChange}
                    isLoading={isLoading}
                    qqList={qqList}
                    refresh={refresh}
                    selectedQQ={uinValue}
                    onSubmit={onSubmit}
                    onUpdateQQList={onUpdateQQList}
                  />
                </Tab>
                <Tab key='password' title='密码登录'>
                  <PasswordLogin
                    isLoading={isLoading}
                    onSubmit={onPasswordSubmit}
                    onCaptchaSubmit={onCaptchaSubmit}
                    onNewDeviceVerified={onNewDeviceVerified}
                    qqList={qqList}
                    captchaState={captchaState}
                    captchaVerifying={captchaVerifying}
                    newDeviceState={newDeviceState}
                    onCaptchaCancel={onCaptchaCancel}
                    onNewDeviceCancel={onNewDeviceCancel}
                  />
                </Tab>
                <Tab key='qrcode' title='扫码登录'>
                  <QrCodeLogin
                    loginError={parseLoginError(loginError)}
                    qrcode={qrcode}
                    onRefresh={onRefreshQRCode}
                    isRefreshing={isRefreshingQRCode}
                    loginPhase={loginPhase}
                    isRecoveringLoginService={isRecoveringLoginService}
                  />
                </Tab>
              </Tabs>
              <Button
                className='w-fit mx-auto'
                variant='light'
                color='primary'
                onPress={() => {
                  navigate('/web_login', {
                    replace: true,
                  });
                }}
              >
                返回 Web Login
              </Button>
            </CardBody>
          </HoverEffectCard>
        </motion.div>
      </PureLayout>
      {showGUIDManager && (
        <Modal
          title='设备 GUID 管理'
          content={<GUIDManager compact showRestart />}
          size='lg'
          hideFooter
          onClose={() => setShowGUIDManager(false)}
        />
      )}
    </>
  );
}
