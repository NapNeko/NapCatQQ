import { Tab, Tabs } from '@heroui/tabs'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useMediaQuery } from 'react-responsive'

import key from '@/const/key'

import PageLoading from '@/components/page_loading'

import useConfig from '@/hooks/use-config'
import useMusic from '@/hooks/use-music'

import OneBotConfigCard from './onebot'
import WebUIConfigCard from './webui'

export default function ConfigPage() {
  const { config, saveConfigWithoutNetwork, refreshConfig } = useConfig()
  const [loading, setLoading] = useState(false)
  const {
    control: onebotControl,
    handleSubmit: handleOnebotSubmit,
    formState: { isSubmitting: isOnebotSubmitting },
    setValue: setOnebotValue
  } = useForm<IConfig['onebot']>({
    defaultValues: {
      musicSignUrl: '',
      enableLocalFile2Url: false,
      parseMultMsg: false
    }
  })

  const {
    control: webuiControl,
    handleSubmit: handleWebuiSubmit,
    formState: { isSubmitting: isWebuiSubmitting },
    setValue: setWebuiValue
  } = useForm<IConfig['webui']>({
    defaultValues: {
      background: '',
      musicListID: '',
      customIcons: {}
    }
  })

  const isMediumUp = useMediaQuery({ minWidth: 768 })
  const [b64img, setB64img] = useLocalStorage(key.backgroundImage, '')
  const [customIcons, setCustomIcons] = useLocalStorage<Record<string, string>>(
    key.customIcons,
    {}
  )
  const { setListId, listId } = useMusic()
  const resetOneBot = () => {
    setOnebotValue('musicSignUrl', config.musicSignUrl)
    setOnebotValue('enableLocalFile2Url', config.enableLocalFile2Url)
    setOnebotValue('parseMultMsg', config.parseMultMsg)
  }

  const resetWebUI = () => {
    setWebuiValue('musicListID', listId)
    setWebuiValue('customIcons', customIcons)
    setWebuiValue('background', b64img)
  }

  const onOneBotSubmit = handleOnebotSubmit((data) => {
    try {
      saveConfigWithoutNetwork(data)
      toast.success('保存成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`保存失败: ${msg}`)
    }
  })

  const onWebuiSubmit = handleWebuiSubmit((data) => {
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

  const onRefresh = async (shotTip = true) => {
    try {
      setLoading(true)
      await refreshConfig()
      if (shotTip) toast.success('刷新成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`刷新失败: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    resetOneBot()
    resetWebUI()
  }, [config])

  useEffect(() => {
    onRefresh(false)
  }, [])

  return (
    <section className="w-[1000px] max-w-full md:mx-auto gap-4 py-8 px-2 md:py-10">
      <Tabs
        aria-label="config tab"
        fullWidth
        className="w-full"
        isVertical={isMediumUp}
        classNames={{
          tabList: 'sticky flex top-14 bg-opacity-50 backdrop-blur-sm',
          panel: 'w-full relative',
          base: 'md:!w-auto flex-grow-0 flex-shrink-0 mr-0',
          cursor: 'bg-opacity-60 backdrop-blur-sm'
        }}
      >
        <Tab title="OneBot配置" key="onebot">
          <PageLoading loading={loading} />
          <OneBotConfigCard
            isSubmitting={isOnebotSubmitting}
            onRefresh={onRefresh}
            onSubmit={onOneBotSubmit}
            control={onebotControl}
            reset={resetOneBot}
          />
        </Tab>
        <Tab title="WebUI配置" key="webui">
          <WebUIConfigCard
            isSubmitting={isWebuiSubmitting}
            onRefresh={onRefresh}
            onSubmit={onWebuiSubmit}
            control={webuiControl}
            reset={resetWebUI}
          />
        </Tab>
      </Tabs>
    </section>
  )
}
