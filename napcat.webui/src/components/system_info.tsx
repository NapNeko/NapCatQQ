import { Button } from '@heroui/button'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Spinner } from '@heroui/spinner'
import { Tooltip } from '@heroui/tooltip'
import { useRequest } from 'ahooks'
import { useEffect } from 'react'
import { BsStars } from 'react-icons/bs'
import { FaCircleInfo, FaInfo, FaQq } from 'react-icons/fa6'
import { IoLogoChrome, IoLogoOctocat } from 'react-icons/io'
import { RiMacFill } from 'react-icons/ri'

import useDialog from '@/hooks/use-dialog'

import { request } from '@/utils/request'
import { compareVersion } from '@/utils/version'

import WebUIManager from '@/controllers/webui_manager'
import { GithubRelease } from '@/types/github'

import TailwindMarkdown from './tailwind_markdown'

export interface SystemInfoItemProps {
  title: string
  icon?: React.ReactNode
  value?: React.ReactNode
  endContent?: React.ReactNode
}

const SystemInfoItem: React.FC<SystemInfoItemProps> = ({
  title,
  value = '--',
  icon,
  endContent
}) => {
  return (
    <div className="flex text-sm gap-1 p-2 items-center shadow-sm shadow-primary-100 dark:shadow-primary-100 rounded text-primary-400">
      {icon}
      <div className="w-24">{title}</div>
      <div className="text-primary-200">{value}</div>
      <div className="ml-auto">{endContent}</div>
    </div>
  )
}

export interface NewVersionTipProps {
  currentVersion?: string
}

const NewVersionTip = (props: NewVersionTipProps) => {
  const { currentVersion } = props
  const dialog = useDialog()
  const { data: releaseData, error } = useRequest(() =>
    request.get<GithubRelease[]>(
      'https://api.github.com/repos/NapNeko/NapCatQQ/releases'
    )
  )

  if (error) {
    return (
      <Tooltip content="检查新版本失败">
        <Button
          isIconOnly
          radius="full"
          color="primary"
          variant="shadow"
          className="!w-5 !h-5 !min-w-0 text-small shadow-md"
          onPress={() => {
            dialog.alert({
              title: '检查新版本失败',
              content: error.message
            })
          }}
        >
          <FaInfo />
        </Button>
      </Tooltip>
    )
  }

  const latestVersion = releaseData?.data?.[0]?.tag_name

  if (!latestVersion || !currentVersion) {
    return null
  }

  if (compareVersion(latestVersion, currentVersion) <= 0) {
    return null
  }

  const middleVersions: GithubRelease[] = []

  for (let i = 0; i < releaseData.data.length; i++) {
    const versionInfo = releaseData.data[i]
    if (compareVersion(versionInfo.tag_name, currentVersion) > 0) {
      middleVersions.push(versionInfo)
    } else {
      break
    }
  }

  const AISummaryComponent = () => {
    const {
      data: aiSummaryData,
      loading: aiSummaryLoading,
      error: aiSummaryError,
      run: runAiSummary
    } = useRequest(
      (version) =>
        request.get<ServerResponse<string | null>>(
          `https://release.nc.152710.xyz/?version=${version}`,
          {
            timeout: 30000
          }
        ),
      {
        manual: true
      }
    )

    useEffect(() => {
      runAiSummary(currentVersion)
    }, [currentVersion, runAiSummary])

    if (aiSummaryLoading) {
      return (
        <div className="flex justify-center py-1">
          <Spinner size="sm" />
        </div>
      )
    }
    if (aiSummaryError) {
      return <div className="text-center text-primary-500">AI 摘要获取失败</div>
    }
    return <span className="text-default-700">{aiSummaryData?.data.data}</span>
  }

  return (
    <Tooltip content="有新版本可用">
      <Button
        isIconOnly
        radius="full"
        color="primary"
        variant="shadow"
        className="!w-5 !h-5 !min-w-0 text-small shadow-md"
        onPress={() => {
          dialog.confirm({
            title: '有新版本可用',
            content: (
              <div className="space-y-2">
                <div className="text-sm space-x-2">
                  <span>当前版本</span>
                  <Chip color="primary" variant="flat">
                    v{currentVersion}
                  </Chip>
                </div>
                <div className="text-sm space-x-2">
                  <span>最新版本</span>
                  <Chip color="primary">{latestVersion}</Chip>
                </div>
                <div className="p-2 rounded-md bg-content2 text-sm">
                  <div className="text-primary-400 font-bold flex items-center gap-1 mb-1">
                    <BsStars />
                    <span>AI总结</span>
                  </div>
                  {<AISummaryComponent />}
                </div>
                <div className="text-sm space-y-2 !mt-4">
                  {middleVersions.map((versionInfo) => (
                    <div
                      key={versionInfo.tag_name}
                      className="p-4 bg-content1 rounded-md shadow-small"
                    >
                      <TailwindMarkdown content={versionInfo.body} />
                    </div>
                  ))}
                </div>
              </div>
            ),
            scrollBehavior: 'inside',
            size: '3xl',
            confirmText: '前往下载',
            onConfirm() {
              window.open(
                'https://github.com/NapNeko/NapCatQQ/releases',
                '_blank',
                'noopener'
              )
            }
          })
        }}
      >
        <FaInfo />
      </Button>
    </Tooltip>
  )
}

const NapCatVersion = () => {
  const {
    data: packageData,
    loading: packageLoading,
    error: packageError
  } = useRequest(WebUIManager.getPackageInfo)

  const currentVersion = packageData?.version

  return (
    <SystemInfoItem
      title="NapCat 版本"
      icon={<IoLogoOctocat className="text-xl" />}
      value={
        packageError ? (
          `错误：${packageError.message}`
        ) : packageLoading ? (
          <Spinner size="sm" />
        ) : (
          currentVersion
        )
      }
      endContent={<NewVersionTip currentVersion={currentVersion} />}
    />
  )
}

export interface SystemInfoProps {
  archInfo?: string
}
const SystemInfo: React.FC<SystemInfoProps> = (props) => {
  const { archInfo } = props
  const {
    data: qqVersionData,
    loading: qqVersionLoading,
    error: qqVersionError
  } = useRequest(WebUIManager.getQQVersion)
  return (
    <Card className="bg-opacity-60 shadow-sm shadow-primary-100 dark:shadow-primary-100 overflow-visible flex-1">
      <CardHeader className="pb-0 items-center gap-1 text-primary-500 font-extrabold">
        <FaCircleInfo className="text-lg" />
        <span>系统信息</span>
      </CardHeader>
      <CardBody className="flex-1">
        <div className="flex flex-col justify-between h-full">
          <NapCatVersion />
          <SystemInfoItem
            title="QQ 版本"
            icon={<FaQq className="text-lg" />}
            value={
              qqVersionError ? (
                `错误：${qqVersionError.message}`
              ) : qqVersionLoading ? (
                <Spinner size="sm" />
              ) : (
                qqVersionData
              )
            }
          />
          <SystemInfoItem
            title="WebUI 版本"
            icon={<IoLogoChrome className="text-xl" />}
            value="Next"
          />
          <SystemInfoItem
            title="系统版本"
            icon={<RiMacFill className="text-xl" />}
            value={archInfo}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default SystemInfo
