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

  useEffect(() => {
    reset()
  }, [data])

  if (loading) return <PageLoading loading={true} />

  if (error)
    return (
      <div className="py-24 text-danger-500 text-center">{error.message}</div>
    )

  // 将颜色 key 补全为 ThemeConfigItem 中定义的所有颜色相关属性
  const colorKeys = [
    '--heroui-background',

    '--heroui-foreground-50',
    '--heroui-foreground-100',
    '--heroui-foreground-200',
    '--heroui-foreground-300',
    '--heroui-foreground-400',
    '--heroui-foreground-500',
    '--heroui-foreground-600',
    '--heroui-foreground-700',
    '--heroui-foreground-800',
    '--heroui-foreground-900',
    '--heroui-foreground',

    '--heroui-content1',
    '--heroui-content1-foreground',
    '--heroui-content2',
    '--heroui-content2-foreground',
    '--heroui-content3',
    '--heroui-content3-foreground',
    '--heroui-content4',
    '--heroui-content4-foreground',

    '--heroui-default-50',
    '--heroui-default-100',
    '--heroui-default-200',
    '--heroui-default-300',
    '--heroui-default-400',
    '--heroui-default-500',
    '--heroui-default-600',
    '--heroui-default-700',
    '--heroui-default-800',
    '--heroui-default-900',
    '--heroui-default-foreground',
    '--heroui-default',

    '--heroui-danger-50',
    '--heroui-danger-100',
    '--heroui-danger-200',
    '--heroui-danger-300',
    '--heroui-danger-400',
    '--heroui-danger-500',
    '--heroui-danger-600',
    '--heroui-danger-700',
    '--heroui-danger-800',
    '--heroui-danger-900',
    '--heroui-danger-foreground',
    '--heroui-danger',

    '--heroui-primary-50',
    '--heroui-primary-100',
    '--heroui-primary-200',
    '--heroui-primary-300',
    '--heroui-primary-400',
    '--heroui-primary-500',
    '--heroui-primary-600',
    '--heroui-primary-700',
    '--heroui-primary-800',
    '--heroui-primary-900',
    '--heroui-primary-foreground',
    '--heroui-primary',

    '--heroui-secondary-50',
    '--heroui-secondary-100',
    '--heroui-secondary-200',
    '--heroui-secondary-300',
    '--heroui-secondary-400',
    '--heroui-secondary-500',
    '--heroui-secondary-600',
    '--heroui-secondary-700',
    '--heroui-secondary-800',
    '--heroui-secondary-900',
    '--heroui-secondary-foreground',
    '--heroui-secondary',

    '--heroui-success-50',
    '--heroui-success-100',
    '--heroui-success-200',
    '--heroui-success-300',
    '--heroui-success-400',
    '--heroui-success-500',
    '--heroui-success-600',
    '--heroui-success-700',
    '--heroui-success-800',
    '--heroui-success-900',
    '--heroui-success-foreground',
    '--heroui-success',

    '--heroui-warning-50',
    '--heroui-warning-100',
    '--heroui-warning-200',
    '--heroui-warning-300',
    '--heroui-warning-400',
    '--heroui-warning-500',
    '--heroui-warning-600',
    '--heroui-warning-700',
    '--heroui-warning-800',
    '--heroui-warning-900',
    '--heroui-warning-foreground',
    '--heroui-warning',

    '--heroui-focus',
    '--heroui-overlay',
    '--heroui-divider',
    '--heroui-code-background',
    '--heroui-strong',
    '--heroui-code-mdx'
  ] as const

  return (
    <>
      <title>主题配置 - NapCat WebUI</title>
      <div className="flex-shrink-0 w-full">主题配置</div>
      {(['dark', 'light'] as const).map((mode) => (
        <div key={mode}>
          <h3>{mode === 'dark' ? '暗色主题' : '亮色主题'}</h3>
          {colorKeys.map((key) => (
            <div key={key} className="grid grid-cols-2 items-center mb-2 gap-2">
              <label className="text-right">{key}</label>
              <Controller
                control={control}
                name={`theme.${mode}.${key}`}
                render={({ field: { value, onChange } }) => {
                  const hslArray = value?.split(' ') ?? [0, 0, 0]
                  const color = `hsl(${hslArray[0]}, ${hslArray[1]}, ${hslArray[2]})`
                  return (
                    <ColorPicker
                      color={color}
                      onChange={(result) => {
                        onChange(
                          `${result.hsl.h} ${result.hsl.s * 100}% ${result.hsl.l * 100}%`
                        )
                      }}
                    />
                  )
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
