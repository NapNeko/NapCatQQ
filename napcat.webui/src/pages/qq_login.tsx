import { Button } from '@heroui/button'
import { CardBody, CardHeader } from '@heroui/card'
import { Image } from '@heroui/image'
import { Tab, Tabs } from '@heroui/tabs'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import HoverEffectCard from '@/components/effect_card'
import { title } from '@/components/primitives'
import QrCodeLogin from '@/components/qr_code_login'
import QuickLogin from '@/components/quick_login'
import type { QQItem } from '@/components/quick_login'
import { ThemeSwitch } from '@/components/theme-switch'

import logo from '@/assets/images/logo.png'
import QQManager from '@/controllers/qq_manager'
import PureLayout from '@/layouts/pure'

export default function QQLoginPage() {
  const navigate = useNavigate()
  const [uinValue, setUinValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [qrcode, setQrcode] = useState<string>('')
  const [qqList, setQQList] = useState<(QQItem | LoginListItem)[]>([])
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
    } catch (error) {
      const msg = (error as Error).message

      toast.error(`快速登录QQ失败: ${msg}`)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
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
      const data = await QQManager.getQQQuickLoginListNew()
      setQQList(data)
    } catch (error) {
      try {
        const data = await QQManager.getQQQuickLoginList()

        const qqList = data.map((item) => ({
          uin: item
        }))

        setQQList(qqList)
      } catch (error) {
        const msg = (error as Error).message

        toast.error(`获取QQ列表失败: ${msg}`)
      }
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
    <>
      <title>QQ登录 - NapCat WebUI</title>
      <PureLayout>
        <div className="w-[608px] max-w-full py-8 px-2 md:px-8 overflow-hidden">
          <HoverEffectCard
            className="items-center gap-4 pt-0 pb-6 bg-default-50"
            maxXRotation={3}
            maxYRotation={3}
          >
            <CardHeader className="inline-block max-w-lg text-center justify-center">
              <div className="flex items-center justify-center w-full gap-2 pt-10">
                <Image alt="logo" height="7em" src={logo} />
                <div>
                  <span className={title()}>Web&nbsp;</span>
                  <span className={title({ color: 'violet' })}>
                    Login&nbsp;
                  </span>
                </div>
              </div>
              <ThemeSwitch className="absolute right-4 top-4" />
            </CardHeader>

            <CardBody className="flex gap-5 p-10 pt-0">
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
              <Button
                className="w-fit mx-auto"
                variant="light"
                color="primary"
                onPress={() => {
                  navigate('/web_login', {
                    replace: true
                  })
                }}
              >
                返回 Web Login
              </Button>
            </CardBody>
          </HoverEffectCard>
        </div>
      </PureLayout>
    </>
  )
}
