import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Tabs, Tab } from '@nextui-org/tabs'
import { CardHeader, CardBody } from '@nextui-org/card'
import { Image } from '@nextui-org/image'

import { title } from '@/components/primitives'
import HoverEffectCard from '@/components/effect_card'
import PureLayout from '@/layouts/pure'
import { ThemeSwitch } from '@/components/theme-switch'
import QQManager from '@/controllers/qq_manager'
import QuickLogin from '@/components/quick_login'
import QrCodeLogin from '@/components/qr_code_login'
import logo from '@/assets/images/logo.png'

export interface QQItem {
  uin: string
}

export default function QQLoginPage() {
  const navigate = useNavigate()
  const [uinValue, setUinValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [qrcode, setQrcode] = useState<string>('')
  const [qqList, setQQList] = useState<QQItem[]>([])
  const [refresh, setRefresh] = useState<boolean>(false)
  const firstLoad = useRef<boolean>(true)
  const onSubmit = async () => {
    if (!uinValue) {
      toast.error('请选择快捷登录的QQ')

      return
    }
    setIsLoading(true)
    try {
      await QQManager.setQuickLogin(uinValue)

      toast.success('QQ登录成功')
      navigate('/', { replace: true })
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`快速登录QQ失败: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  const onUpdateQrCode = async () => {
    if (firstLoad.current) setIsLoading(true)
    try {
      const data = await QQManager.checkQQLoginStatusWithQrcode()

      if (firstLoad.current) {
        setIsLoading(false)
        firstLoad.current = false
      }
      if (data.isLogin) {
        toast.success('QQ登录成功')
        navigate('/', { replace: true })
      } else {
        setQrcode(data.qrcodeurl)
      }
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`获取二维码失败: ${msg}`)
    }
  }

  const onUpdateQQList = async () => {
    setRefresh(true)
    try {
      const data = await QQManager.getQQQuickLoginList()

      const qqList = data.map((item) => ({
        uin: item
      }))

      setQQList(qqList)
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`获取QQ列表失败: ${msg}`)
    } finally {
      setRefresh(false)
    }
  }

  const handleSelectionChange: React.ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setUinValue(e.target.value)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      onUpdateQrCode()
    }, 3000)

    onUpdateQrCode()
    onUpdateQQList()

    return () => clearInterval(timer)
  }, [])

  return (
    <PureLayout>
      <div className="w-[608px] max-w-full p-8 overflow-hidden">
        <HoverEffectCard
          className="items-center gap-4 pt-0 pb-6 bg-default-50"
          maxXRotation={3}
          maxYRotation={3}
        >
          <CardHeader className="inline-block max-w-lg text-center justify-center">
            <div className="flex justify-center">
              <Image alt="logo" height="7em" src={logo} />
            </div>
            <span className={title()}>QQ&nbsp;</span>
            <span className={title({ color: 'violet' })}>Login&nbsp;</span>
            <ThemeSwitch className="absolute right-4 top-4" />
          </CardHeader>

          <CardBody className="flex gap-10 p-10 pt-0">
            <Tabs
              fullWidth
              classNames={{
                tabList: 'shadow-sm dark:shadow-none'
              }}
              isDisabled={isLoading}
              size="lg"
            >
              <Tab key="shortcut" title="快速登录">
                <QuickLogin
                  handleSelectionChange={handleSelectionChange}
                  isLoading={isLoading}
                  qqList={qqList}
                  refresh={refresh}
                  selectedQQ={uinValue}
                  onSubmit={onSubmit}
                  onUpdateQQList={onUpdateQQList}
                />
              </Tab>
              <Tab key="qrcode" title="扫码登录">
                <QrCodeLogin qrcode={qrcode} />
              </Tab>
            </Tabs>
          </CardBody>
        </HoverEffectCard>
      </div>
    </PureLayout>
  )
}
