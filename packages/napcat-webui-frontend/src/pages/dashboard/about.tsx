import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Image } from '@heroui/image';
import { Link } from '@heroui/link';
import { Select, SelectItem } from '@heroui/select';
import { Snippet } from '@heroui/snippet';
import { Spinner } from '@heroui/spinner';
import { Tooltip } from '@heroui/tooltip';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import {
  BsCodeSlash,
  BsCpu,
  BsGithub,
  BsGlobe,
  BsPlugin,
  BsTelegram,
  BsTencentQq,
} from 'react-icons/bs';
import { IoDocument, IoRocketSharp } from 'react-icons/io5';

import CryptoJS from 'crypto-js';

import logo from '@/assets/images/logo.png';
import QQManager from '@/controllers/qq_manager';
import WebUIManager from '@/controllers/webui_manager';

function VersionInfo () {
  const { data, loading, error } = useRequest(WebUIManager.GetNapCatVersion);

  return (
    <div className='flex items-center gap-2'>
      {error
        ? (
          <Chip color='danger' variant='flat' size='sm'>{error.message}</Chip>
        )
        : loading
          ? (
            <Spinner size='sm' color='default' />
          )
          : (
            <div className='flex items-center gap-2'>
              <Chip size='sm' color='default' variant='flat' className='text-default-500'>WebUI v0.0.6</Chip>
              <Chip size='sm' color='primary' variant='flat'>Core {data?.version}</Chip>
            </div>
          )}
    </div>
  );
}

function NapCatFileHash () {
  const { data: hashData, loading: hashLoading, error: hashError } = useRequest(WebUIManager.GetNapCatFileHash);
  const { data: loginList, loading: listLoading, error: listError } = useRequest(QQManager.getQQQuickLoginListNew);
  const { data: loginData, loading: loginLoading, error: loginError } = useRequest(QQManager.getQQLoginInfo);

  const [selectedUin, setSelectedUin] = useState<string | null>(null);

  const loading = hashLoading || listLoading || loginLoading;
  const error = hashError || listError || loginError;

  // 优先使用 getLoginList 返回的账号列表，回退到当前登录账号
  const accounts: { uin: string; label: string; }[] = [];

  // 添加 LoginList 账号
  if (loginList && loginList.length > 0) {
    loginList.forEach(item => {
      accounts.push({
        uin: item.uin,
        label: item.nickName ? `${item.nickName}（${item.uin}）` : item.uin,
      });
    });
  }

  // 确保当前登录账号也在列表中
  // 注意：API 返回的 uin 类型可能不一致（string/number），做一次转换比较
  if (loginData?.uin) {
    const isLoginAccountInList = accounts.some(acc => String(acc.uin) === String(loginData.uin));
    if (!isLoginAccountInList) {
      accounts.push({
        uin: String(loginData.uin),
        label: loginData.nick ? `${loginData.nick}（${loginData.uin}）` : String(loginData.uin),
      });
    }
  }

  // 自动选择第一个账号
  useEffect(() => {
    if (accounts.length > 0) {
      const isSelectedValid = selectedUin && accounts.some(acc => acc.uin === selectedUin);

      if (!isSelectedValid) {
        if (loginData?.uin && accounts.some((acc) => acc.uin == loginData.uin)) {
          setSelectedUin(loginData.uin);
        } else {
          setSelectedUin(accounts[0].uin);
        }
      }
    }
  }, [accounts, selectedUin, loginData]);

  const currentAccount = accounts.find((acc) => acc.uin === selectedUin) || accounts[0];
  const password = (hashData && currentAccount)
    ? CryptoJS.SHA512(hashData.hash + currentAccount.uin).toString().substring(0, 7)
    : null;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2 text-sm font-medium text-default-700'>
        <span>入群密码</span>
        {loading && <Spinner size='sm' color='default' />}
      </div>
      {error
        ? (
          <Chip color='warning' variant='flat' size='sm'>无法计算：{(error as Error).message}</Chip>
        )
        : loading
          ? null
          : accounts.length > 0
            ? (
              <div className='space-y-3'>
                {accounts.length > 1 && (
                  <Select
                    label='选择账号'
                    size='sm'
                    selectedKeys={selectedUin ? [selectedUin] : []}
                    onChange={(e) => setSelectedUin(e.target.value)}
                    className='max-w-full'
                  >
                    {accounts.map((acc) => (
                      <SelectItem key={acc.uin} textValue={acc.label}>
                        {acc.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                {password && (
                  <div className='space-y-1'>
                    {accounts.length === 1 && <p className='text-xs text-default-500'>{currentAccount.label}</p>}
                    <Tooltip content={`使用 ${currentAccount.label} 申请入群，以此值作为入群密码`} placement='top'>
                      <Snippet
                        size='sm'
                        variant='flat'
                        symbol=''
                        codeString={password}
                        className='w-full'
                        classNames={{
                          pre: 'text-xs break-all whitespace-pre-wrap font-mono',
                        }}
                      >
                        {password}
                      </Snippet>
                    </Tooltip>
                  </div>
                )}
                <p className='text-xs text-warning-500'>入群密钥绑定QQ，使用对应QQ申请入群即可。</p>
              </div>
            )
            : null}
    </div>
  );
}

export default function AboutPage () {
  const features = [
    {
      icon: <IoRocketSharp size={20} />,
      title: '高性能架构',
      desc: 'Node.js + Native 混合架构，资源占用低，响应速度快。',
      className: 'bg-primary-50 text-primary',
    },
    {
      icon: <BsGlobe size={20} />,
      title: '全平台支持',
      desc: '适配 Windows、Linux 及 Docker 环境。',
      className: 'bg-success-50 text-success',
    },
    {
      icon: <BsCodeSlash size={20} />,
      title: 'OneBot 11',
      desc: '深度集成标准协议，兼容现有生态。',
      className: 'bg-warning-50 text-warning',
    },
    {
      icon: <BsPlugin size={20} />,
      title: '极易扩展',
      desc: '提供丰富的 API 接口与 WebHook 支持。',
      className: 'bg-secondary-50 text-secondary',
    },
  ];

  const links = [
    { icon: <BsGithub />, name: 'GitHub', href: 'https://github.com/NapNeko/NapCatQQ' },
    { icon: <BsTelegram />, name: 'Telegram', href: 'https://t.me/napcatqq' },
    { icon: <BsTencentQq />, name: '交流群 欢乐一家亲', href: 'https://qm.qq.com/q/VwpnklcXqo' },
    { icon: <BsTencentQq />, name: '交流群 皇亲国戚', href: 'https://qm.qq.com/q/gq18RH7o7S' },
    { icon: <BsTencentQq />, name: '交流群 相亲相爱一家人', href: 'https://qm.qq.com/q/XyiyGPqa42' },
    { icon: <BsTencentQq />, name: '交流群 开心家族', href: 'https://qm.qq.com/q/E4nfkGD6oK' },
    { icon: <IoDocument />, name: '文档', href: 'https://napcat.napneko.icu/' },
  ];

  const cardStyle = 'bg-default/40 backdrop-blur-lg border-none shadow-none';

  return (
    <div className='flex flex-col h-full w-full gap-6 p-2 md:p-6'>
      <title>关于 - NapCat WebUI</title>

      {/* 头部标题区 */}
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl font-bold flex items-center gap-3 text-default-900'>
          <Image src={logo} alt='NapCat Logo' width={32} height={32} />
          关于 NapCat
        </h1>
        <div className='flex items-center gap-4 text-small text-default-500'>
          <p>现代化、轻量级的 QQ 机器人框架</p>
          <Divider orientation='vertical' className='h-4' />
          <VersionInfo />
        </div>
      </div>

      <Divider className='opacity-50' />

      {/* 主内容区：双栏布局 */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow'>

        {/* 左侧：介绍与特性 */}
        <div className='lg:col-span-2 space-y-6'>
          <Card shadow='sm' className={cardStyle}>
            <CardHeader className='pb-0 pt-4 px-4 flex-col items-start'>
              <h2 className='text-lg font-bold'>项目简介</h2>
            </CardHeader>
            <CardBody className='py-4 text-default-600 leading-relaxed space-y-2'>
              <p>
                NapCat (瞌睡猫) 是一个致力于打破 QQ 机器人开发壁垒的开源项目。我们利用 NTQQ 的底层能力，
                构建了一个无需 GUI 即可在服务器端稳定运行的 Headless 框架。
              </p>
              <p>
                无论是个人开发者还是企业用户，NapCat 都能提供开箱即用的 OneBot 11 协议支持，
                助您快速将创意转化为现实。
              </p>
            </CardBody>
          </Card>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {features.map((item, index) => (
              <Card key={index} shadow='sm' className={cardStyle}>
                <CardBody className='flex flex-row items-start gap-4 p-4'>
                  <div className={`p-3 rounded-lg ${item.className}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className='font-semibold text-default-900'>{item.title}</h3>
                    <p className='text-small text-default-500 mt-1'>{item.desc}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* 右侧：信息与链接 */}
        <div className='space-y-6'>
          <Card shadow='sm' className={cardStyle}>
            <CardHeader className='pb-0 pt-4 px-4'>
              <h2 className='text-lg font-bold'>相关资源</h2>
            </CardHeader>
            <CardBody className='py-4 space-y-4'>
              <NapCatFileHash />
              <div className='flex flex-col gap-2'>
                {links.map((link, idx) => (
                  <Link
                    key={idx}
                    isExternal
                    href={link.href}
                    className='flex items-center justify-between p-3 rounded-xl hover:bg-default-100/50 transition-colors text-default-600'
                  >
                    <span className='flex items-center gap-3'>
                      {link.icon}
                      {link.name}
                    </span>
                    <span className='text-tiny text-default-400'>跳转 &rarr;</span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card shadow='sm' className={cardStyle}>
            <CardHeader className='pb-0 pt-4 px-4'>
              <h2 className='text-lg font-bold flex items-center gap-2'>
                <BsCpu /> 技术栈
              </h2>
            </CardHeader>
            <CardBody className='py-4'>
              <div className='flex flex-wrap gap-2'>
                {['TypeScript', 'React', 'Vite', 'Node.js', 'Electron', 'HeroUI'].map((tech) => (
                  <Chip key={tech} size='sm' variant='flat' className='bg-default-100/50 text-default-600'>
                    {tech}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 底部版权 - 移出 grid 布局 */}
      <div className='w-full text-center text-tiny text-default-400 py-4 mt-auto flex flex-col items-center gap-1'>
        <p className='flex items-center justify-center gap-1'>
          Made with <span className='text-danger'>❤️</span> by NapCat Team
        </p>
        <p>MIT License © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
