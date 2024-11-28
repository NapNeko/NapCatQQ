import { Controller, useForm } from 'react-hook-form'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { IoMdRefresh } from 'react-icons/io'

import useConfig from '@/hooks/use-config'
import SwitchCard from '@/components/switch_card'
import { useLocalStorage } from '@uidotdev/usehooks'
import { Image } from '@nextui-org/image'
export default function ConfigPage() {
  const { config, mergeConfig, refreshConfig } = useConfig()
  const { control, handleSubmit, formState, setValue } = useForm<OneBotConfig>({
    defaultValues: {
      musicSignUrl: '',
      enableLocalFile2Url: false,
      parseMultMsg: false
    }
  })
  const [b64img, setB64img] = useLocalStorage('background-image', '')
  const reset = () => {
    setValue('musicSignUrl', config.musicSignUrl)
    setValue('enableLocalFile2Url', config.enableLocalFile2Url)
    setValue('parseMultMsg', config.parseMultMsg)
  }

  useEffect(() => {
    reset()
  }, [config, setValue])

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="max-w-full mx-3 w-96 flex flex-col justify-center gap-3">
        <Controller
          control={control}
          name="musicSignUrl"
          render={({ field }) => (
            <Input
              {...field}
              label="音乐签名地址"
              placeholder="请输入音乐签名地址"
            />
          )}
        />
        <Controller
          control={control}
          name="enableLocalFile2Url"
          render={({ field }) => (
            <SwitchCard
              {...field}
              description="启用本地文件到URL"
              label="启用本地文件到URL"
            />
          )}
        />
        <Controller
          control={control}
          name="parseMultMsg"
          render={({ field }) => (
            <SwitchCard
              {...field}
              description="启用上报解析合并消息"
              label="启用上报解析合并消息"
            />
          )}
        />
        <div className="bg-background p-3 rounded-md flex flex-col gap-2 justify-center items-center">
          <div className="flex-shrink-0 w-full">背景图</div>
          <div className="flex gap-2 items-center">
            <Input
              type="file"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = async () => {
                    const base64 = reader.result as string
                    setB64img(base64)
                    e.target.value = ''
                  }
                  reader.readAsDataURL(file)
                }
              }}
            />
            <Button
              onClick={() => {
                setB64img('')
              }}
            >
              删除背景图
            </Button>
          </div>
          {b64img && <Image src={b64img} alt="background" height={100} />}
        </div>
        <div className="flex items-center justify-center gap-2 mt-5">
          <Button
            color="default"
            onClick={() => {
              reset()
              toast.success('重置成功')
            }}
          >
            重置
          </Button>
          <Button
            color="primary"
            isLoading={formState.isSubmitting}
            onClick={handleSubmit((data) => {
              try {
                mergeConfig(data)
                toast.success('保存成功')
              } catch (error) {
                const msg = (error as Error).message

                toast.error(`保存失败: ${msg}`)
              }
            })}
          >
            保存
          </Button>
          <Button
            isIconOnly
            color="secondary"
            radius="full"
            variant="flat"
            onClick={async () => {
              try {
                await refreshConfig()
                toast.success('刷新成功')
              } catch (error) {
                const msg = (error as Error).message

                toast.error(`刷新失败: ${msg}`)
              }
            }}
          >
            <IoMdRefresh size={24} />
          </Button>
        </div>
      </div>
    </section>
  )
}
