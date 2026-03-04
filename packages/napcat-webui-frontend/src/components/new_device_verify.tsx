import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { QRCodeSVG } from 'qrcode.react';

import QQManager from '@/controllers/qq_manager';

interface NewDeviceVerifyProps {
  /** jumpUrl from loginErrorInfo */
  jumpUrl: string;
  /** QQ uin for OIDB requests */
  uin: string;
  /** Called when QR verification is confirmed, passes str_nt_succ_token */
  onVerified: (token: string) => void;
  /** Called when user cancels */
  onCancel?: () => void;
}

type QRStatus = 'loading' | 'waiting' | 'scanned' | 'confirmed' | 'error';

const NewDeviceVerify: React.FC<NewDeviceVerifyProps> = ({
  jumpUrl,
  uin,
  onVerified,
  onCancel,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [status, setStatus] = useState<QRStatus>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback((token: string) => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const result = await QQManager.pollNewDeviceQR(uin, token);
        if (!mountedRef.current) return;
        const s = result?.uint32_guarantee_status;
        if (s === 3) {
          setStatus('scanned');
        } else if (s === 1) {
          stopPolling();
          setStatus('confirmed');
          const ntToken = result?.str_nt_succ_token || '';
          onVerified(ntToken);
        }
        // s === 0 means still waiting, do nothing
      } catch {
        // Ignore poll errors, keep polling
      }
    }, 2500);
  }, [uin, onVerified, stopPolling]);

  const fetchQRCode = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const result = await QQManager.getNewDeviceQRCode(uin, jumpUrl);
      if (!mountedRef.current) return;
      if (result?.str_url) {
        setQrUrl(result.str_url);
        setStatus('waiting');
        // bytes_token 用于轮询，如果 OIDB 未返回则用空字符串
        startPolling(result.bytes_token || '');
      } else {
        setStatus('error');
        setErrorMsg('获取二维码失败，请重试');
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setStatus('error');
      setErrorMsg((e as Error).message || '获取二维码失败');
    }
  }, [uin, jumpUrl, startPolling]);

  useEffect(() => {
    mountedRef.current = true;
    fetchQRCode();
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [fetchQRCode, stopPolling]);

  const statusText: Record<QRStatus, string> = {
    loading: '正在获取二维码...',
    waiting: '请使用手机QQ扫描二维码完成验证',
    scanned: '已扫描，请在手机上确认',
    confirmed: '验证成功，正在登录...',
    error: errorMsg || '获取二维码失败',
  };

  const statusColor: Record<QRStatus, string> = {
    loading: 'text-default-500',
    waiting: 'text-warning',
    scanned: 'text-primary',
    confirmed: 'text-success',
    error: 'text-danger',
  };

  return (
    <div className='flex flex-col gap-4 items-center'>
      <p className='text-warning text-sm'>
        检测到新设备登录，请使用手机QQ扫描下方二维码完成验证
      </p>

      <div className='flex flex-col items-center gap-3' style={{ minHeight: 280 }}>
        {status === 'loading' ? (
          <div className='flex items-center justify-center' style={{ height: 240 }}>
            <Spinner size='lg' />
          </div>
        ) : status === 'error' ? (
          <div className='flex flex-col items-center justify-center gap-3' style={{ height: 240 }}>
            <p className='text-danger text-sm'>{errorMsg}</p>
            <Button color='primary' variant='flat' onPress={fetchQRCode}>
              重新获取
            </Button>
          </div>
        ) : (
          <div className='p-3 bg-white rounded-lg'>
            <QRCodeSVG value={qrUrl} size={220} />
          </div>
        )}

        <p className={`text-sm ${statusColor[status]}`}>
          {statusText[status]}
        </p>
      </div>

      <div className='flex gap-3'>
        {status === 'waiting' && (
          <Button color='default' variant='flat' size='sm' onPress={fetchQRCode}>
            刷新二维码
          </Button>
        )}
        <Button
          variant='light'
          color='danger'
          size='sm'
          onPress={onCancel}
        >
          取消验证
        </Button>
      </div>
    </div>
  );
};

export default NewDeviceVerify;
