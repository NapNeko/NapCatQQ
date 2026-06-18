import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { QRCodeSVG } from 'qrcode.react';
import { IoAlertCircle, IoRefresh } from 'react-icons/io5';

interface QrCodeLoginProps {
  qrcode: string;
  loginError?: string;
  onRefresh?: () => void;
}

const QrCodeLogin: React.FC<QrCodeLoginProps> = ({ qrcode, loginError, onRefresh }) => {
  return (
    <div className='flex flex-col items-center'>
      {loginError
        ? (
          <div className='flex flex-col items-center py-4'>
            <div className='w-full flex justify-center mb-6'>
              <div className='p-4 bg-danger-50 rounded-full'>
                <IoAlertCircle className='text-danger' size={64} />
              </div>
            </div>
            <div className='text-center space-y-2 px-4'>
              <div className='text-xl font-bold text-danger'>登录失败</div>
              <div className='text-default-600 text-sm leading-relaxed max-w-[300px]'>
                {loginError}
              </div>
            </div>
            {onRefresh && (
              <Button
                className='mt-8 min-w-[160px]'
                variant='solid'
                color='primary'
                size='lg'
                startContent={<IoRefresh />}
                onPress={onRefresh}
              >
                重新获取二维码
              </Button>
            )}
          </div>
        )
        : (
          <>
            <div className='bg-white p-2 rounded-md w-fit mx-auto relative overflow-hidden'>
              {!qrcode && (
                <div className='absolute left-0 top-0 right-0 bottom-0 bg-white dark:bg-zinc-900 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-10'>
                  <Spinner color='primary' />
                </div>
              )}
              <QRCodeSVG size={180} value={qrcode || ' '} />
            </div>
            <div className='mt-5 text-center text-default-500 text-sm'>请使用QQ或者TIM扫描上方二维码</div>
            {onRefresh && qrcode && (
              <Button
                className='mt-4'
                variant='flat'
                color='primary'
                size='sm'
                startContent={<IoRefresh />}
                onPress={onRefresh}
              >
                刷新二维码
              </Button>
            )}
          </>
        )}
    </div>
  );
};

export default QrCodeLogin;
