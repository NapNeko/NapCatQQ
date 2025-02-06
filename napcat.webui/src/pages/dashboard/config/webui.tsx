import { Input } from '@heroui/input'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import key from '@/const/key'

import SaveButtons from '@/components/button/save_buttons'
import FileInput from '@/components/input/file_input'
import ImageInput from '@/components/input/image_input'

import useMusic from '@/hooks/use-music'

import { siteConfig } from '@/config/site'
import FileManager from '@/controllers/file_manager'

const WebUIConfigCard = () => {
  const {
    control,
    handleSubmit: handleWebuiSubmit,
    formState: { isSubmitting },
    setValue: setWebuiValue
  } = useForm<IConfig['webui']>({
    defaultValues: {
      background: '',
      musicListID: '',
      customIcons: {}
    }
  })

  const [b64img, setB64img] = useLocalStorage(key.backgroundImage, '')
  const [customIcons, setCustomIcons] = useLocalStorage<Record<string, string>>(
    key.customIcons,
    {}
  )
  const { setListId, listId } = useMusic()

  const reset = () => {
    setWebuiValue('musicListID', listId)
    setWebuiValue('customIcons', customIcons)
    setWebuiValue('background', b64img)
  }

  const onSubmit = handleWebuiSubmit((data) => {
    try {
      setListId(data.musicListID)
      setCustomIcons(data.customIcons)
      setB64img(data.background)
      toast.success('保存成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`保存失败: ${msg}`)
    }
  })

  useEffect(() => {
    reset()
  }, [listId, customIcons, b64img])

  return (
    <>
      <title>WebUI配置 - NapCat WebUI</title>
      <div className="flex flex-col gap-2">
        <div className="flex-shrink-0 w-full">WebUI字体</div>
        <div className="text-sm text-default-400">
          此项不需要手动保存，上传成功后需清空网页缓存并刷新
          <FileInput
            label="中文字体"
            onChange={async (file) => {
              try {
                await FileManager.uploadWebUIFont(file)
                toast.success('上传成功')
                setTimeout(() => {
                  window.location.reload()
                }, 1000)
              } catch (error) {
                toast.error('上传失败: ' + (error as Error).message)
              }
            }}
            onDelete={async () => {
              try {
                await FileManager.deleteWebUIFont()
                toast.success('删除成功')
                setTimeout(() => {
                  window.location.reload()
                }, 1000)
              } catch (error) {
                toast.error('删除失败: ' + (error as Error).message)
              }
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex-shrink-0 w-full">WebUI音乐播放器</div>
        <Controller
          control={control}
          name="musicListID"
          render={({ field }) => (
            <Input
              {...field}
              label="网易云音乐歌单ID（网页内音乐播放器）"
              placeholder="请输入歌单ID"
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex-shrink-0 w-full">背景图</div>
        <Controller
          control={control}
          name="background"
          render={({ field }) => <ImageInput {...field} />}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div>自定义图标</div>
        {siteConfig.navItems.map((item) => (
          <Controller
            key={item.label}
            control={control}
            name={`customIcons.${item.label}`}
            render={({ field }) => <ImageInput {...field} label={item.label} />}
          />
        ))}
      </div>
      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default WebUIConfigCard
