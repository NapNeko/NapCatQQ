import { useEffect, useRef, useCallback } from 'react';
import { Spinner } from '@heroui/spinner';

declare global {
  interface Window {
    TencentCaptcha: new (
      appid: string,
      callback: (res: TencentCaptchaResult) => void,
      options?: Record<string, unknown>
    ) => { show: () => void; destroy: () => void; };
  }
}

export interface TencentCaptchaResult {
  ret: number;
  appid?: string;
  ticket?: string;
  randstr?: string;
  errorCode?: number;
  errorMessage?: string;
}

export interface CaptchaCallbackData {
  ticket: string;
  randstr: string;
  appid: string;
  sid: string;
}

interface TencentCaptchaProps {
  /** proofWaterUrl returned from login error, contains uin/sid/aid params */
  proofWaterUrl: string;
  /** Called when captcha verification succeeds */
  onSuccess: (data: CaptchaCallbackData) => void;
  /** Called when captcha is cancelled or fails */
  onCancel?: () => void;
}

function parseUrlParams (url: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const u = new URL(url);
    u.searchParams.forEach((v, k) => { params[k] = v; });
  } catch {
    const match = url.match(/[?&]([^#]+)/);
    if (match) {
      match[1].split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) params[k] = decodeURIComponent(v || '');
      });
    }
  }
  return params;
}

function loadScript (src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.TencentCaptcha) {
      resolve();
      return;
    }
    const tag = document.createElement('script');
    tag.src = src;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(tag);
  });
}

const TencentCaptchaModal: React.FC<TencentCaptchaProps> = ({
  proofWaterUrl,
  onSuccess,
  onCancel,
}) => {
  const captchaRef = useRef<{ destroy: () => void; } | null>(null);
  const mountedRef = useRef(true);

  const handleResult = useCallback((res: TencentCaptchaResult, sid: string) => {
    if (!mountedRef.current) return;
    if (res.ret === 0 && res.ticket && res.randstr) {
      onSuccess({
        ticket: res.ticket,
        randstr: res.randstr,
        appid: res.appid || '',
        sid,
      });
    } else {
      onCancel?.();
    }
  }, [onSuccess, onCancel]);

  useEffect(() => {
    mountedRef.current = true;
    const params = parseUrlParams(proofWaterUrl);
    const appid = params.aid || '2081081773';
    const sid = params.sid || '';

    const init = async () => {
      try {
        await loadScript('https://captcha.gtimg.com/TCaptcha.js');
      } catch {
        try {
          await loadScript('https://ssl.captcha.qq.com/TCaptcha.js');
        } catch {
          // Both CDN failed, generate fallback ticket
          if (mountedRef.current) {
            handleResult({
              ret: 0,
              ticket: `terror_1001_${appid}_${Math.floor(Date.now() / 1000)}`,
              randstr: '@' + Math.random().toString(36).substring(2),
              errorCode: 1001,
              errorMessage: 'jsload_error',
            }, sid);
          }
          return;
        }
      }

      if (!mountedRef.current) return;

      try {
        const captcha = new window.TencentCaptcha(
          appid,
          (res) => handleResult(res, sid),
          {
            type: 'popup',
            showHeader: false,
            login_appid: params.login_appid,
            uin: params.uin,
            sid: params.sid,
            enableAged: true,
          }
        );
        captchaRef.current = captcha;
        captcha.show();
      } catch {
        if (mountedRef.current) {
          handleResult({
            ret: 0,
            ticket: `terror_1001_${appid}_${Math.floor(Date.now() / 1000)}`,
            randstr: '@' + Math.random().toString(36).substring(2),
            errorCode: 1001,
            errorMessage: 'init_error',
          }, sid);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      captchaRef.current?.destroy();
      captchaRef.current = null;
    };
  }, [proofWaterUrl, handleResult]);

  return (
    <div className="flex items-center justify-center py-8 gap-3">
      <Spinner size="lg" />
      <span className="text-default-500">正在加载验证码...</span>
    </div>
  );
};

export default TencentCaptchaModal;
