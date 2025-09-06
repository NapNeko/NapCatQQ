import { Input } from '@heroui/input'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import key from '@/const/key'

import SaveButtons from '@/components/button/save_buttons'

import WebUIManager from '@/controllers/webui_manager'

const ChangePasswordCard = () => {
  const [isDefaultToken, setIsDefaultToken] = useState<boolean>(false)
  const [isLoadingCheck, setIsLoadingCheck] = useState<boolean>(true)
  
  const {
    control,
    handleSubmit: handleWebuiSubmit,
    formState: { isSubmitting },
    reset
  } = useForm<{
    oldToken: string
    newToken: string
  }>({
    defaultValues: {
      oldToken: '',
      newToken: ''
    }
  })

  const navigate = useNavigate()
  const [_, setToken] = useLocalStorage(key.token, '')

  // 检查是否使用默认密码
  useEffect(() => {
    const checkDefaultToken = async () => {
      try {
        const isDefault = await WebUIManager.checkUsingDefaultToken()
        setIsDefaultToken(isDefault)
      } catch (error) {
        console.error('检查默认密码状态失败:', error)
      } finally {
        setIsLoadingCheck(false)
      }
    }
    
    checkDefaultToken()
  }, [])

  const onSubmit = handleWebuiSubmit(async (data) => {
    try {
      if (isDefaultToken) {
        // 从默认密码更新
        await WebUIManager.changePasswordFromDefault(data.newToken)
      } else {
        // 正常密码更新
        await WebUIManager.changePassword(data.oldToken, data.newToken)
      }
      
      toast.success('修改成功')
      setToken('')
      localStorage.removeItem(key.token)
      navigate('/web_login')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`修改失败: ${msg}`)
    }
  })

  if (isLoadingCheck) {
    return (
      <>
        <title>修改密码 - NapCat WebUI</title>
        <div className="flex justify-center items-center h-32">
          <div className="text-center">加载中...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <title>修改密码 - NapCat WebUI</title>
      
      {isDefaultToken && (
        <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <p className="text-warning-700 text-sm">
            检测到您正在使用默认密码，为了安全起见，请立即设置新密码。
          </p>
        </div>
      )}
      
      {!isDefaultToken && (
        <Controller
          control={control}
          name="oldToken"
          render={({ field }) => (
            <Input
              {...field}
              label="旧密码"
              placeholder="请输入旧密码"
              type="password"
            />
          )}
        />
      )}
      
      <Controller
        control={control}
        name="newToken"
        render={({ field }) => (
          <Input
            {...field}
            label={isDefaultToken ? "设置新密码" : "新密码"}
            placeholder={isDefaultToken ? "请设置一个安全的新密码" : "请输入新密码"}
            type="password"
          />
        )}
      />
      
      <SaveButtons
        onSubmit={onSubmit}
        reset={reset}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default ChangePasswordCard
