import { Input } from '@heroui/input'
import { useLocalStorage } from '@uidotdev/usehooks'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import key from '@/const/key'

import SaveButtons from '@/components/button/save_buttons'

import WebUIManager from '@/controllers/webui_manager'

const ChangePasswordCard = () => {
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

  const onSubmit = handleWebuiSubmit(async (data) => {
    try {
      await WebUIManager.changePassword(data.oldToken, data.newToken)
      toast.success('修改成功')
      setToken('')
      localStorage.removeItem(key.token)
      navigate('/web_login')
    } catch (error) {
      const msg = (error as Error).message
      toast.error(`修改失败: ${msg}`)
    }
  })

  return (
    <>
      <title>修改密码 - NapCat WebUI</title>
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
      <Controller
        control={control}
        name="newToken"
        render={({ field }) => (
          <Input
            {...field}
            label="新密码"
            placeholder="请输入新密码"
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
