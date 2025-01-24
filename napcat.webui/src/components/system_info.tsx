import { Card, CardBody, CardHeader } from '@heroui/card'
import { Spinner } from '@heroui/spinner'
import { useRequest } from 'ahooks'
import { FaCircleInfo } from 'react-icons/fa6'
import { FaQq } from 'react-icons/fa6'
import { IoLogoChrome, IoLogoOctocat } from 'react-icons/io'
import { RiMacFill } from 'react-icons/ri'

import WebUIManager from '@/controllers/webui_manager'

import packageJson from '../../package.json'

export interface SystemInfoItemProps {
  title: string
  icon?: React.ReactNode
  value?: React.ReactNode
}

const SystemInfoItem: React.FC<SystemInfoItemProps> = ({
  title,
  value = '--',
  icon
}) => {
  return (
    <div className="flex text-sm gap-1 p-2 items-center shadow-sm shadow-danger-50 dark:shadow-danger-100 rounded text-danger-400">
      {icon}
      <div className="w-24">{title}</div>
      <div className="text-danger-200">{value}</div>
    </div>
  )
}

export interface SystemInfoProps {
  archInfo?: string
}
const SystemInfo: React.FC<SystemInfoProps> = (props) => {
  const { archInfo } = props
  const {
    data: packageData,
    loading: packageLoading,
    error: packageError
  } = useRequest(WebUIManager.getPackageInfo)
  const {
    data: qqVersionData,
    loading: qqVersionLoading,
    error: qqVersionError
  } = useRequest(WebUIManager.getQQVersion)
  return (
    <Card className="bg-opacity-60 shadow-sm shadow-danger-50 dark:shadow-danger-100 overflow-visible flex-1">
      <CardHeader className="pb-0 items-center gap-1 text-danger-500 font-extrabold">
        <FaCircleInfo className="text-lg" />
        <span>系统信息</span>
      </CardHeader>
      <CardBody className="flex-1">
        <div className="flex flex-col justify-between h-full">
          <SystemInfoItem
            title="NapCat 版本"
            icon={<IoLogoOctocat className="text-xl" />}
            value={
              packageError ? (
                `错误：${packageError.message}`
              ) : packageLoading ? (
                <Spinner size="sm" />
              ) : (
                packageData?.version
              )
            }
          />
          <SystemInfoItem
            title="WebUI 版本"
            icon={<IoLogoChrome className="text-xl" />}
            value={packageJson.version}
          />
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
