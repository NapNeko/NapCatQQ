import { Input } from '@heroui/input'
import { useRequest } from 'ahooks'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import SaveButtons from '@/components/button/save_buttons'
import PageLoading from '@/components/page_loading'

import QQManager from '@/controllers/qq_manager'

const LoginConfigCard = () => {
  const {
    data: quickLoginData,
    loading: quickLoginLoading,
    error: quickLoginError,
    refreshAsync: refreshQuickLogin
  } = useRequest(QQManager.getQuickLoginQQ)
  const {
    control,
    handleSubmit: handleOnebotSubmit,
    formState: { isSubmitting },
    setValue: setOnebotValue
  } = useForm<{
    quickLoginQQ: string
  }>({
    defaultValues: {
      quickLoginQQ: ''
    }
  })

  const reset = () => {
    setOnebotValue('quickLoginQQ', quickLoginData ?? '')
  }

  const onSubmit = handleOnebotSubmit(async (data) => {
    try {
      await QQManager.setQuickLoginQQ(data.quickLoginQQ)
      toast.success('保存成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`保存失败: ${msg}`)
    }
  })

  const onRefresh = async () => {
    try {
      await refreshQuickLogin()
      toast.success('刷新成功')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`刷新失败: ${msg}`)
    }
  }

  useEffect(() => {
    reset()
  }, [quickLoginData])

  if (quickLoginLoading) return <PageLoading loading={true} />

  return (
    <>
      <title>OneBot配置 - NapCat WebUI</title>
      <div className="flex-shrink-0 w-full">快速登录QQ</div>
      <Controller
        control={control}
        name="quickLoginQQ"
        render={({ field }) => (
          <Input
            {...field}
            label="快速登录QQ"
            placeholder="请输入QQ号"
            isDisabled={!!quickLoginError}
            errorMessage={quickLoginError ? '获取快速登录QQ失败' : undefined}
          />
        )}
      />
      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting || quickLoginLoading}
        refresh={onRefresh}
      />
    </>
  )
}

export default LoginConfigCard
