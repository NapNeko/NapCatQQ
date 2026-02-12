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

interface PasswordLoginProps {
  onSubmit: (uin: string, password: string) => void;
  isLoading: boolean;
  qqList: (QQItem | LoginListItem)[];
}

const PasswordLogin: React.FC<PasswordLoginProps> = ({ onSubmit, isLoading, qqList }) => {
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
      <div className='flex justify-center'>
        <Image
          className='shadow-lg'
          height={100}
          radius='full'
          src={`https://q1.qlogo.cn/g?b=qq&nk=${uin || '0'}&s=100`}
          width={100}
          alt='QQ Avatar'
        />
      </div>
      <div className='flex flex-col gap-4'>
        <Input
          type='text'
          label='QQ账号'
          placeholder='请输入QQ号'
          value={uin}
          onValueChange={setUin}
          variant='bordered'
          size='lg'
          autoComplete='off'
          endContent={
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant='light' size='sm' radius='full'>
                  <IoChevronDown size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label='QQ Login History'
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
          type='password'
          label='密码'
          placeholder='请输入密码'
          value={password}
          onValueChange={setPassword}
          variant='bordered'
          size='lg'
          autoComplete='new-password'
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
    </div>
  );
};

export default PasswordLogin;
