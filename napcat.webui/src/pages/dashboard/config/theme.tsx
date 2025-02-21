import { Accordion, AccordionItem } from '@heroui/accordion'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { useRequest } from 'ahooks'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaUserAstronaut } from 'react-icons/fa'
import { FaPaintbrush } from 'react-icons/fa6'
import { IoIosColorPalette } from 'react-icons/io'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

import themes from '@/const/themes'

import ColorPicker from '@/components/ColorPicker'
import SaveButtons from '@/components/button/save_buttons'
import PageLoading from '@/components/page_loading'

import { colorKeys, generateTheme, loadTheme } from '@/utils/theme'

import WebUIManager from '@/controllers/webui_manager'

export type PreviewThemeCardProps = {
  theme: ThemeInfo
  onPreview: () => void
}

const values = [
  '',
  '-50',
  '-100',
  '-200',
  '-300',
  '-400',
  '-500',
  '-600',
  '-700',
  '-800',
  '-900'
]
const colors = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'default'
]

function PreviewThemeCard({ theme, onPreview }: PreviewThemeCardProps) {
  const style = document.createElement('style')
  style.innerHTML = generateTheme(theme.theme, theme.name)
  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  return (
    <Card
      ref={cardRef}
      shadow="sm"
      radius="sm"
      isPressable
      onPress={onPreview}
      className={clsx('text-primary bg-primary-50', theme.name)}
    >
      <CardHeader className="pb-0 flex flex-col items-start gap-1">
        <div className="px-1 rounded-md bg-primary text-primary-foreground">
          {theme.name}
        </div>
        <div className="text-xs flex items-center gap-1 text-primary-300">
          <FaUserAstronaut />
          {theme.author ?? '未知'}
        </div>
        <div className="text-xs text-primary-200">{theme.description}</div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-1">
          {colors.map((color) => (
            <div className="flex gap-1 items-center flex-wrap" key={color}>
              <div className="text-xs w-4 text-right">
                {color[0].toUpperCase()}
              </div>
              {values.map((value) => (
                <div
                  key={value}
                  className={clsx(
                    'w-2 h-2 rounded-full shadow-small',
                    `bg-${color}${value}`
                  )}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

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

  // 使用 useRef 存储 style 标签引用
  const styleTagRef = useRef<HTMLStyleElement | null>(null)

  // 在组件挂载时创建 style 标签，并在卸载时清理
  useEffect(() => {
    const styleTag = document.createElement('style')
    document.head.appendChild(styleTag)
    styleTagRef.current = styleTag
    return () => {
      if (styleTagRef.current) {
        document.head.removeChild(styleTagRef.current)
      }
    }
  }, [])

  const theme = useWatch({ control, name: 'theme' })

  const reset = () => {
    if (data) setOnebotValue('theme', data)
  }

  const onSubmit = handleOnebotSubmit(async (data) => {
    try {
      await WebUIManager.setThemeConfig(data.theme)
      toast.success('保存成功')
      loadTheme()
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

  useEffect(() => {
    if (theme && styleTagRef.current) {
      const css = generateTheme(theme)
      styleTagRef.current.innerHTML = css
    }
  }, [theme])

  if (loading) return <PageLoading loading={true} />

  if (error)
    return (
      <div className="py-24 text-danger-500 text-center">{error.message}</div>
    )

  return (
    <>
      <title>主题配置 - NapCat WebUI</title>

      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting}
        refresh={onRefresh}
        className="items-end w-full p-4"
      />
      <div className="px-4 text-sm text-default-600">实时预览，记得保存！</div>
      <Accordion variant="splitted" defaultExpandedKeys={['select']}>
        <AccordionItem
          key="select"
          aria-label="Pick Color"
          title="选择主题"
          subtitle="可以切换夜间/白昼模式查看对应颜色"
          className="shadow-small"
          startContent={<IoIosColorPalette />}
        >
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <PreviewThemeCard
                key={theme.name}
                theme={theme}
                onPreview={() => {
                  setOnebotValue('theme', theme.theme)
                }}
              />
            ))}
          </div>
        </AccordionItem>

        <AccordionItem
          key="pick"
          aria-label="Pick Color"
          title="自定义配色"
          className="shadow-small"
          startContent={<FaPaintbrush />}
        >
          <div className="space-y-2">
            {(['dark', 'light'] as const).map((mode) => (
              <div
                key={mode}
                className={clsx(
                  'p-2 rounded-md',
                  mode === 'dark' ? 'text-white' : 'text-black',
                  mode === 'dark'
                    ? 'bg-content1-foreground dark:bg-content1'
                    : 'bg-content1 dark:bg-content1-foreground'
                )}
              >
                <h3 className="text-center p-2 rounded-md bg-content2 mb-2 text-default-800 flex items-center justify-center">
                  {mode === 'dark' ? (
                    <MdDarkMode size={24} />
                  ) : (
                    <MdLightMode size={24} />
                  )}
                  {mode === 'dark' ? '夜间模式主题' : '白昼模式主题'}
                </h3>
                {colorKeys.map((key) => (
                  <div
                    key={key}
                    className="grid grid-cols-2 items-center mb-2 gap-2"
                  >
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
          </div>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default ThemeConfigCard
