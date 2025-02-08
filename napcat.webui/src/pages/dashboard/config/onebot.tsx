import { Input } from '@heroui/input'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import SaveButtons from '@/components/button/save_buttons'
import PageLoading from '@/components/page_loading'
import SwitchCard from '@/components/switch_card'

import useConfig from '@/hooks/use-config'

const OneBotConfigCard = () => {
  const { config, saveConfigWithoutNetwork, refreshConfig } = useConfig()
  const [loading, setLoading] = useState(false)
  const {
    control,
    handleSubmit: handleOnebotSubmit,
    formState: { isSubmitting },
    setValue: setOnebotValue
  } = useForm<IConfig['onebot']>({
    defaultValues: {
      musicSignUrl: '',
      enableLocalFile2Url: false,
      parseMultMsg: false
    }
  })
  const reset = () => {
    setOnebotValue('musicSignUrl', config.musicSignUrl)
    setOnebotValue('enableLocalFile2Url', config.enableLocalFile2Url)
    setOnebotValue('parseMultMsg', config.parseMultMsg)
  }

  const onSubmit = handleOnebotSubmit(async (data) => {
    try {
      await saveConfigWithoutNetwork(data)
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
    reset()
  }, [config])

  useEffect(() => {
    onRefresh(false)
  }, [])

  if (loading) return <PageLoading loading={true} />

  return (
    <>
      <title>OneBot配置 - NapCat WebUI</title>
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
      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting}
        refresh={onRefresh}
      />
    </>
  )
}

export default OneBotConfigCard
