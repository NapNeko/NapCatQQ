import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Switch } from '@heroui/switch'
import { useRequest } from 'ahooks'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MdDeleteSweep } from 'react-icons/md'

import SaveButtons from '@/components/button/save_buttons'
import PageLoading from '@/components/page_loading'

import useDialog from '@/hooks/use-dialog'

import WebUIManager from '@/controllers/webui_manager'

const ServerConfigCard = () => {
  const dialog = useDialog()
  const [isCleaningCache, setIsCleaningCache] = useState(false)
  const {
    data: configData,
    loading: configLoading,
    error: configError,
    refreshAsync: refreshConfig
  } = useRequest(WebUIManager.getWebUIConfig)

  const {
    control,
    handleSubmit: handleConfigSubmit,
    formState: { isSubmitting },
    setValue: setConfigValue
  } = useForm<{
    host: string
    port: number
    loginRate: number
    disableWebUI: boolean
    disableNonLANAccess: boolean
  }>({
    defaultValues: {
      host: '0.0.0.0',
      port: 6099,
      loginRate: 10,
      disableWebUI: false,
      disableNonLANAccess: false
    }
  })

  const reset = () => {
    if (configData) {
      setConfigValue('host', configData.host)
      setConfigValue('port', configData.port)
      setConfigValue('loginRate', configData.loginRate)
      setConfigValue('disableWebUI', configData.disableWebUI)
      setConfigValue('disableNonLANAccess', configData.disableNonLANAccess)
    }
  }

  const onSubmit = handleConfigSubmit(async (data) => {
    try {
      await WebUIManager.updateWebUIConfig(data)
      toast.success('保存成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`保存失败: ${msg}`)
    }
  })

  const onRefresh = async () => {
    try {
      await refreshConfig()
      toast.success('刷新成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`刷新失败: ${msg}`)
    }
  }

  const handleCleanCache = () => {
    dialog.confirm({
      title: '清理缓存',
      content: (
        <div className="space-y-2">
          <p>确定要清理缓存吗？此操作将清理以下内容：</p>
          <ul className="list-disc list-inside text-sm text-default-600">
            <li>临时文件夹中的所有文件</li>
            <li>图片缓存 (Pic)</li>
            <li>语音缓存 (Ptt)</li>
            <li>视频缓存 (Video)</li>
            <li>文件缓存 (File)</li>
            <li>日志文件 (log)</li>
          </ul>
          <p className="text-warning text-sm">此操作不可撤销，请谨慎操作。</p>
        </div>
      ),
      onConfirm: async () => {
        setIsCleaningCache(true)
        try {
          const result = await WebUIManager.cleanCache()
          if (result.result) {
            toast.success(result.message || '缓存清理成功')
          } else {
            toast.error(result.message || '缓存清理失败')
          }
        } catch (error) {
          const msg = (error as Error).message
          toast.error(`清理缓存失败: ${msg}`)
        } finally {
          setIsCleaningCache(false)
        }
      }
    })
  }

  useEffect(() => {
    reset()
  }, [configData])

  if (configLoading) return <PageLoading loading={true} />

  return (
    <>
      <title>服务器配置 - NapCat WebUI</title>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex-shrink-0 w-full">服务器配置</div>
          <Controller
            control={control}
            name="host"
            render={({ field }) => (
              <Input
                {...field}
                label="监听地址"
                placeholder="请输入监听地址"
                description="服务器监听的IP地址，0.0.0.0表示监听所有网卡"
                isDisabled={!!configError}
                errorMessage={configError ? '获取配置失败' : undefined}
              />
            )}
          />
          <Controller
            control={control}
            name="port"
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                value={field.value?.toString() || ''}
                label="监听端口"
                placeholder="请输入监听端口"
                description="服务器监听的端口号，范围1-65535"
                isDisabled={!!configError}
                errorMessage={configError ? '获取配置失败' : undefined}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
          <Controller
            control={control}
            name="loginRate"
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                value={field.value?.toString() || ''}
                label="登录速率限制"
                placeholder="请输入登录速率限制"
                description="每小时允许的登录尝试次数"
                isDisabled={!!configError}
                errorMessage={configError ? '获取配置失败' : undefined}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex-shrink-0 w-full">维护操作</div>
          <div className="flex flex-col gap-2 p-4 rounded-lg bg-default-50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium">清理缓存</div>
                <div className="text-sm text-default-500">
                  清理临时文件、图片、语音、视频、文件缓存和日志文件
                </div>
              </div>
              <Button
                color="danger"
                variant="flat"
                startContent={<MdDeleteSweep size={20} />}
                onPress={handleCleanCache}
                isLoading={isCleaningCache}
                isDisabled={!!configError}
              >
                清理缓存
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex-shrink-0 w-full">安全配置</div>
          <Controller
            control={control}
            name="disableWebUI"
            render={({ field }) => (
              <Switch
                isSelected={field.value}
                onValueChange={field.onChange}
                isDisabled={!!configError}
              >
                <div className="flex flex-col">
                  <span>禁用WebUI</span>
                  <span className="text-sm text-default-400">
                    启用后将完全禁用WebUI服务，需要重启生效
                  </span>
                </div>
              </Switch>
            )}
          />
          <Controller
            control={control}
            name="disableNonLANAccess"
            render={({ field }) => (
              <Switch
                isSelected={field.value}
                onValueChange={field.onChange}
                isDisabled={!!configError}
              >
                <div className="flex flex-col">
                  <span>禁用非局域网访问</span>
                  <span className="text-sm text-default-400">
                    启用后只允许局域网内的设备访问WebUI，提高安全性
                  </span>
                </div>
              </Switch>
            )}
          />
        </div>
      </div>

      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting || configLoading}
        refresh={onRefresh}
      />
    </>
  )
}

export default ServerConfigCard
