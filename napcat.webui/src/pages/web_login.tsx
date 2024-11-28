import { CardHeader, CardBody } from '@nextui-org/card'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'
import { Image } from '@nextui-org/image'
import { IoKeyOutline } from 'react-icons/io5'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useNavigate } from 'react-router-dom'

import logo from '@/assets/images/logo.png'
import { title } from '@/components/primitives'
import HoverEffectCard from '@/components/effect_card'
import PureLayout from '@/layouts/pure'
import { ThemeSwitch } from '@/components/theme-switch'
import WebUIManager from '@/controllers/webui_manager'

export default function WebLoginPage() {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const token = urlSearchParams.get('token')
  const navigate = useNavigate()
  const [tokenValue, setTokenValue] = useState<string>(token || '')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [, setLocalToken] = useLocalStorage<string>('token', '')
  const onSubmit = async () => {
    if (!tokenValue) {
      toast.error('请输入token')

      return
    }
    setIsLoading(true)
    try {
      const data = await WebUIManager.loginWithToken(tokenValue)

      if (data) {
        setLocalToken(data)
        navigate('/qq_login', { replace: true })
      }
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

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
            <span className={title()}>Web&nbsp;</span>
            <span className={title({ color: 'violet' })}>Login&nbsp;</span>
            <ThemeSwitch className="absolute right-4 top-4" />
          </CardHeader>

          <CardBody className="flex gap-10 p-10">
            <Input
              isClearable
              classNames={{
                label: 'text-black/50 dark:text-white/90',
                input: [
                  'bg-transparent',
                  'text-black/90 dark:text-white/90',
                  'placeholder:text-default-700/50 dark:placeholder:text-white/60'
                ],
                innerWrapper: 'bg-transparent',
                inputWrapper: [
                  'shadow-xl',
                  'bg-default-100/70',
                  'dark:bg-default/60',
                  'backdrop-blur-xl',
                  'backdrop-saturate-200',
                  'hover:bg-default-0/70',
                  'dark:hover:bg-default/70',
                  'group-data-[focus=true]:bg-default-100/50',
                  'dark:group-data-[focus=true]:bg-default/60',
                  '!cursor-text'
                ]
              }}
              isDisabled={isLoading}
              label="Token"
              placeholder="请输入token"
              radius="lg"
              size="lg"
              startContent={
                <IoKeyOutline className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
              }
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
              onClear={() => setTokenValue('')}
            />
            <Button
              className="mx-10 mt-10 text-lg py-7"
              color="primary"
              isLoading={isLoading}
              radius="full"
              size="lg"
              variant="shadow"
              onClick={onSubmit}
            >
              {!isLoading && (
                <Image
                  alt="logo"
                  classNames={{
                    wrapper: '-ml-8'
                  }}
                  height="2em"
                  src={logo}
                />
              )}
              登录
            </Button>
          </CardBody>
        </HoverEffectCard>
      </div>
    </PureLayout>
  )
}
