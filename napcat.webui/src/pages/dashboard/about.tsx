import { Card, CardBody } from '@heroui/card'
import { Image } from '@heroui/image'
import { Link } from '@heroui/link'
import { Skeleton } from '@heroui/skeleton'
import { Spinner } from '@heroui/spinner'
import { useRequest } from 'ahooks'
import { useMemo } from 'react'
import { BsTelegram, BsTencentQq } from 'react-icons/bs'
import { IoDocument } from 'react-icons/io5'

import HoverTiltedCard from '@/components/hover_titled_card'
import NapCatRepoInfo from '@/components/napcat_repo_info'
import RotatingText from '@/components/rotating_text'

import { usePreloadImages } from '@/hooks/use-preload-images'
import { useTheme } from '@/hooks/use-theme'

import logo from '@/assets/images/logo.png'
import WebUIManager from '@/controllers/webui_manager'

function VersionInfo() {
  const { data, loading, error } = useRequest(WebUIManager.getPackageInfo)
  return (
    <div className="flex items-center gap-2 text-2xl font-bold">
      <div className="flex items-center gap-2">
        <div className="text-primary-500 drop-shadow-md">NapCat</div>
        {error ? (
          error.message
        ) : loading ? (
          <Spinner size="sm" />
        ) : (
          <RotatingText
            texts={['WebUI', data?.version ?? '']}
            mainClassName="overflow-hidden flex items-center bg-primary-500 px-2 rounded-lg text-default-50 shadow-md"
            staggerFrom={'last'}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-120%' }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        )}
      </div>
    </div>
  )
}

export default function AboutPage() {
  const { isDark } = useTheme()

  const imageUrls = useMemo(
    () => [
      'https://next.ossinsight.io/widgets/official/compose-recent-active-contributors/thumbnail.png?repo_id=777721566&limit=30&image_size=auto&color_scheme=light',
      'https://next.ossinsight.io/widgets/official/compose-recent-active-contributors/thumbnail.png?repo_id=777721566&limit=30&image_size=auto&color_scheme=dark',
      'https://next.ossinsight.io/widgets/official/compose-activity-trends/thumbnail.png?repo_id=41986369&image_size=auto&color_scheme=light',
      'https://next.ossinsight.io/widgets/official/compose-activity-trends/thumbnail.png?repo_id=41986369&image_size=auto&color_scheme=dark'
    ],
    []
  )

  const { loadedUrls, isLoading } = usePreloadImages(imageUrls)

  const getImageUrl = useMemo(
    () => (baseUrl: string) => {
      const theme = isDark ? 'dark' : 'light'
      const fullUrl = baseUrl.replace(
        /color_scheme=(?:light|dark)/,
        `color_scheme=${theme}`
      )
      return isLoading ? null : loadedUrls[fullUrl] ? fullUrl : null
    },
    [isDark, isLoading, loadedUrls]
  )

  const renderImage = useMemo(
    () => (baseUrl: string, alt: string) => {
      const imageUrl = getImageUrl(baseUrl)

      if (!imageUrl) {
        return <Skeleton className="h-16 rounded-lg" />
      }

      return (
        <Image
          className="flex-1 pointer-events-none select-none rounded-none"
          src={imageUrl}
          alt={alt}
        />
      )
    },
    [getImageUrl]
  )

  return (
    <>
      <title>关于 NapCat WebUI</title>
      <section className="max-w-7xl py-8 md:py-10 px-5 mx-auto space-y-10">
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex flex-col md:flex-row items-center">
            <HoverTiltedCard imageSrc={logo} overlayContent="" />
          </div>
          <div className="flex-1 flex flex-col gap-2 py-2">
            <VersionInfo />
            <div className="space-y-1">
              <p className="font-bold text-primary-400">NapCat 是什么?</p>
              <p className="text-default-800">
                基于TypeScript构建的Bot框架,通过相应的启动器或者框架,主动调用QQ
                Node模块提供给客户端的接口,实现Bot的功能.
              </p>
              <p className="font-bold text-primary-400">魔法版介绍</p>
              <p className="text-default-800">
                猫猫框架通过魔法的手段获得了 QQ 的发送消息、接收消息等接口。
                为了方便使用，猫猫框架将通过一种名为 OneBot 的约定将你的 HTTP /
                WebSocket 请求按照规范读取，
                再去调用猫猫框架所获得的QQ发送接口之类的接口。
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 flex-wrap justify-around">
          <Card
            as={Link}
            shadow="sm"
            isPressable
            isExternal
            href="https://qm.qq.com/q/F9cgs1N3Mc"
          >
            <CardBody className="flex-row items-center gap-2">
              <span className="p-2 rounded-small bg-primary-50 text-primary-500">
                <BsTencentQq size={16} />
              </span>
              <span>官方社群1</span>
            </CardBody>
          </Card>

          <Card
            as={Link}
            shadow="sm"
            isPressable
            isExternal
            href="https://qm.qq.com/q/hSt0u9PVn"
          >
            <CardBody className="flex-row items-center gap-2">
              <span className="p-2 rounded-small bg-primary-50 text-primary-500">
                <BsTencentQq size={16} />
              </span>
              <span>官方社群2</span>
            </CardBody>
          </Card>

          <Card
            as={Link}
            shadow="sm"
            isPressable
            isExternal
            href="https://t.me/MelodicMoonlight"
          >
            <CardBody className="flex-row items-center gap-2">
              <span className="p-2 rounded-small bg-primary-50 text-primary-500">
                <BsTelegram size={16} />
              </span>
              <span>Telegram</span>
            </CardBody>
          </Card>

          <Card
            as={Link}
            shadow="sm"
            isPressable
            isExternal
            href="https://napcat.napneko.icu/"
          >
            <CardBody className="flex-row items-center gap-2">
              <span className="p-2 rounded-small bg-primary-50 text-primary-500">
                <IoDocument size={16} />
              </span>
              <span>使用文档</span>
            </CardBody>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="w-full flex flex-col gap-4">
            {renderImage(
              'https://next.ossinsight.io/widgets/official/compose-recent-active-contributors/thumbnail.png?repo_id=777721566&limit=30&image_size=auto&color_scheme=light',
              'Contributors'
            )}
            {renderImage(
              'https://next.ossinsight.io/widgets/official/compose-activity-trends/thumbnail.png?repo_id=41986369&image_size=auto&color_scheme=light',
              'Activity Trends'
            )}
          </div>

          <NapCatRepoInfo />
        </div>
      </section>
    </>
  )
}
