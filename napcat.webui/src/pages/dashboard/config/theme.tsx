import { useRequest } from 'ahooks'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import ColorPicker from '@/components/ColorPicker'
import SaveButtons from '@/components/button/save_buttons'
import PageLoading from '@/components/page_loading'

import WebUIManager from '@/controllers/webui_manager'

const ThemeConfigCard = () => {
  const { data, loading, error, refreshAsync } = useRequest(
    WebUIManager.getThemeConfig
  )
  const {
    control,
    handleSubmit: handleOnebotSubmit,
    formState: { isSubmitting },
    setValue: setOnebotValue
  } = useForm<{
    theme: ThemeConfig
  }>({
    defaultValues: {
      theme: {
        dark: {},
        light: {}
      }
    }
  })

  const reset = () => {
    if (data) setOnebotValue('theme', data)
  }

  const onSubmit = handleOnebotSubmit((data) => {
    try {
      WebUIManager.setThemeConfig(data.theme)
      toast.success('保存成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`保存失败: ${msg}`)
    }
  })

  const onRefresh = async () => {
    try {
      await refreshAsync()
      toast.success('刷新成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`刷新失败: ${msg}`)
    }
  }

  if (loading) return <PageLoading loading={true} />

  if (error)
    return (
      <div className="py-24 text-danger-500 text-center">{error.message}</div>
    )

  const colorKeys = [
    '--heroui-background',
    '--heroui-primary',
    '--heroui-danger'
  ] as const

  return (
    <>
      <title>主题配置 - NapCat WebUI</title>
      <div className="flex-shrink-0 w-full">主题配置</div>
      {(['dark', 'light'] as const).map((mode) => (
        <div key={mode}>
          <h3>{mode === 'dark' ? '暗色主题' : '亮色主题'}</h3>
          {colorKeys.map((key) => (
            <div
              key={key}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
            >
              <label style={{ width: 150 }}>{key}</label>
              <Controller
                control={control}
                name={`theme.${mode}.${key}`}
                render={({ field: { value, onChange } }) => {
                  console.log(value)
                  const hslArray = value?.split(' ') ?? [0, 0, 0]
                  const color = `hsl(${hslArray[0]}, ${hslArray[1]}, ${hslArray[2]})`
                  return <ColorPicker color={color} onChange={onChange} />
                }}
              />
            </div>
          ))}
        </div>
      ))}
      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting}
        refresh={onRefresh}
      />
    </>
  )
}

export default ThemeConfigCard
