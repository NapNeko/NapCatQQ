import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Image } from '@heroui/image';
import { Link } from '@heroui/link';
import { Spinner } from '@heroui/spinner';
import { useRequest } from 'ahooks';
import {
  BsCodeSlash,
  BsCpu,
  BsGithub,
  BsGlobe,
  BsPlugin,
  BsTelegram,
  BsTencentQq
} from 'react-icons/bs';
import { IoDocument, IoRocketSharp } from 'react-icons/io5';

import logo from '@/assets/images/logo.png';
import WebUIManager from '@/controllers/webui_manager';

function VersionInfo () {
  const { data, loading, error } = useRequest(WebUIManager.GetNapCatVersion);

  return (
    <div className='flex items-center gap-2'>
      {error ? (
        <Chip color="danger" variant="flat" size="sm">{error.message}</Chip>
      ) : loading ? (
        <Spinner size='sm' color="default" />
      ) : (
        <div className="flex items-center gap-2">
          <Chip size="sm" color="default" variant="flat" className="text-default-500">WebUI v0.0.6</Chip>
          <Chip size="sm" color="primary" variant="flat">Core {data?.version}</Chip>
        </div>
      )}
    </div>
  );
}

export default function AboutPage () {
  const features = [
    {
      icon: <IoRocketSharp size={20} />,
      title: '高性能架构',
      desc: 'Node.js + Native 混合架构，资源占用低，响应速度快。',
      className: 'bg-primary-50 text-primary'
    },
    {
      icon: <BsGlobe size={20} />,
      title: '全平台支持',
      desc: '适配 Windows、Linux 及 Docker 环境。',
      className: 'bg-success-50 text-success'
    },
    {
      icon: <BsCodeSlash size={20} />,
      title: 'OneBot 11',
      desc: '深度集成标准协议，兼容现有生态。',
      className: 'bg-warning-50 text-warning'
    },
    {
      icon: <BsPlugin size={20} />,
      title: '极易扩展',
      desc: '提供丰富的 API 接口与 WebHook 支持。',
      className: 'bg-secondary-50 text-secondary'
    }
  ];

  const links = [
    { icon: <BsGithub />, name: 'GitHub', href: 'https://github.com/NapNeko/NapCatQQ' },
    { icon: <BsTelegram />, name: 'Telegram', href: 'https://t.me/napcatqq' },
    { icon: <BsTencentQq />, name: 'QQ 群 1', href: 'https://qm.qq.com/q/F9cgs1N3Mc' },
    { icon: <BsTencentQq />, name: 'QQ 群 2', href: 'https://qm.qq.com/q/hSt0u9PVn' },
    { icon: <IoDocument />, name: '文档', href: 'https://napcat.napneko.icu/' },
  ];

  const cardStyle = "bg-default/40 backdrop-blur-lg border-none shadow-none";

  return (
    <div className='flex flex-col h-full w-full gap-6 p-2 md:p-6'>
      <title>关于 - NapCat WebUI</title>

      {/* 头部标题区 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-default-900">
          <Image src={logo} alt="NapCat Logo" width={32} height={32} />
          关于 NapCat
        </h1>
        <div className="flex items-center gap-4 text-small text-default-500">
          <p>现代化、轻量级的 QQ 机器人框架</p>
          <Divider orientation="vertical" className="h-4" />
          <VersionInfo />
        </div>
      </div>

      <Divider className="opacity-50" />

      {/* 主内容区：双栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">

        {/* 左侧：介绍与特性 */}
        <div className="lg:col-span-2 space-y-6">
          <Card shadow="sm" className={cardStyle}>
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h2 className="text-lg font-bold">项目简介</h2>
            </CardHeader>
            <CardBody className="py-4 text-default-600 leading-relaxed space-y-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((item, index) => (
              <Card key={index} shadow="sm" className={cardStyle}>
                <CardBody className="flex flex-row items-start gap-4 p-4">
                  <div className={`p-3 rounded-lg ${item.className}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-default-900">{item.title}</h3>
                    <p className="text-small text-default-500 mt-1">{item.desc}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* 右侧：信息与链接 */}
        <div className="space-y-6">
          <Card shadow="sm" className={cardStyle}>
            <CardHeader className="pb-0 pt-4 px-4">
              <h2 className="text-lg font-bold">相关资源</h2>
            </CardHeader>
            <CardBody className="py-4">
              <div className="flex flex-col gap-2">
                {links.map((link, idx) => (
                  <Link
                    key={idx}
                    isExternal
                    href={link.href}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-default-100/50 transition-colors text-default-600"
                  >
                    <span className="flex items-center gap-3">
                      {link.icon}
                      {link.name}
                    </span>
                    <span className="text-tiny text-default-400">跳转 &rarr;</span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm" className={cardStyle}>
            <CardHeader className="pb-0 pt-4 px-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BsCpu /> 技术栈
              </h2>
            </CardHeader>
            <CardBody className="py-4">
              <div className="flex flex-wrap gap-2">
                {['TypeScript', 'React', 'Vite', 'Node.js', 'Electron', 'HeroUI'].map((tech) => (
                  <Chip key={tech} size="sm" variant="flat" className="bg-default-100/50 text-default-600">
                    {tech}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 底部版权 - 移出 grid 布局 */}
      <div className="w-full text-center text-tiny text-default-400 py-4 mt-auto flex flex-col items-center gap-1">
        <p className="flex items-center justify-center gap-1">
          Made with <span className="text-danger">❤️</span> by NapCat Team
        </p>
        <p>MIT License © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}