import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { Image } from '@heroui/image';
import { Input } from '@heroui/input';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoChevronDown } from 'react-icons/io5';

import type { QQItem } from '@/components/quick_login';
import { isQQQuickNewItem } from '@/utils/qq';
import TencentCaptchaModal from '@/components/tencent_captcha';
import type { CaptchaCallbackData } from '@/components/tencent_captcha';
import NewDeviceVerify from '@/components/new_device_verify';

interface PasswordLoginProps {
  onSubmit: (uin: string, password: string) => void;
  onCaptchaSubmit?: (uin: string, password: string, captchaData: CaptchaCallbackData) => void;
  onNewDeviceVerified?: (token: string) => void;
  isLoading: boolean;
  qqList: (QQItem | LoginListItem)[];
  captchaState?: {
    needCaptcha: boolean;
    proofWaterUrl: string;
    uin: string;
    password: string;
  } | null;
  newDeviceState?: {
    needNewDevice: boolean;
    jumpUrl: string;
    uin: string;
  } | null;
  onCaptchaCancel?: () => void;
  onNewDeviceCancel?: () => void;
}

const PasswordLogin: React.FC<PasswordLoginProps> = ({ onSubmit, onCaptchaSubmit, onNewDeviceVerified, isLoading, qqList, captchaState, newDeviceState, onCaptchaCancel, onNewDeviceCancel }) => {
  const [uin, setUin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!uin) {
      toast.error('请输入QQ号');
      return;
    }
    if (!password) {
      toast.error('请输入密码');
      return;
    }
    onSubmit(uin, password);
  };

  return (
    <div className='flex flex-col gap-8'>
      {newDeviceState?.needNewDevice && newDeviceState.jumpUrl ? (
        <NewDeviceVerify
          jumpUrl={newDeviceState.jumpUrl}
          uin={newDeviceState.uin}
          onVerified={(token) => onNewDeviceVerified?.(token)}
          onCancel={onNewDeviceCancel}
        />
      ) : captchaState?.needCaptcha && captchaState.proofWaterUrl ? (
        <div className='flex flex-col gap-4 items-center'>
          <p className='text-warning text-sm'>登录需要安全验证，请完成验证码</p>
          <TencentCaptchaModal
            proofWaterUrl={captchaState.proofWaterUrl}
            onSuccess={(data) => {
              onCaptchaSubmit?.(captchaState.uin, captchaState.password, data);
            }}
            onCancel={onCaptchaCancel}
          />
          <Button
            variant='light'
            color='danger'
            size='sm'
            onPress={onCaptchaCancel}
          >
            取消验证
          </Button>
        </div>
      ) : (
        <>
          <div className='flex justify-center'>
            <Image
              className='shadow-lg'
              height={100}
              radius='full'
              src={`https://q1.qlogo.cn/g?b=qq&nk=${uin || '0'}&s=100`}
              width={100}
              alt="QQ Avatar"
            />
          </div>
          <div className='flex flex-col gap-4'>
            <Input
              type="text"
              label="QQ账号"
              placeholder="请输入QQ号"
              value={uin}
              onValueChange={setUin}
              variant="bordered"
              size='lg'
              autoComplete="off"
              endContent={
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly variant="light" size="sm" radius="full">
                      <IoChevronDown size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="QQ Login History"
                    items={qqList}
                    onAction={(key) => setUin(key.toString())}
                  >
                    {(item) => (
                      <DropdownItem key={item.uin} textValue={item.uin}>
                        <div className='flex items-center gap-2'>
                          <Avatar
                            alt={item.uin}
                            className='flex-shrink-0'
                            size='sm'
                            src={
                              isQQQuickNewItem(item)
                                ? item.faceUrl
                                : `https://q1.qlogo.cn/g?b=qq&nk=${item.uin}&s=1`
                            }
                          />
                          <div className='flex flex-col'>
                            {isQQQuickNewItem(item)
                              ? `${item.nickName}(${item.uin})`
                              : item.uin}
                          </div>
                        </div>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              }
            />
            <Input
              type="password"
              label="密码"
              placeholder="请输入密码"
              value={password}
              onValueChange={setPassword}
              variant="bordered"
              size='lg'
              autoComplete="new-password"
            />
          </div>
          <div className='flex justify-center mt-5'>
            <Button
              className='w-64 max-w-full'
              color='primary'
              isLoading={isLoading}
              radius='full'
              size='lg'
              variant='shadow'
              onPress={handleSubmit}
            >
              登录
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PasswordLogin;
