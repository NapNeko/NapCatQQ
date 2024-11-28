import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'
import { Select, SelectItem } from '@nextui-org/select'
import { ModalBody, ModalFooter } from '@nextui-org/modal'
import { useEffect } from 'react'

import SwitchCard from '../switch_card'

export interface HTTPClientFormProps {
  data?: OneBotConfig['network']['httpClients'][0]
  onClose: () => void
  onSubmit: (data: OneBotConfig['network']['httpClients'][0]) => Promise<void>
}
const HTTPClientForm: React.FC<HTTPClientFormProps> = ({
  data,
  onClose,
  onSubmit
}) => {
  const { control, handleSubmit, formState, setValue, reset } = useForm<
    OneBotConfig['network']['httpClients'][0]
  >({
    defaultValues: {
      enable: false,
      name: '',
      url: 'http://localhost:8080',
      reportSelfMessage: false,
      messagePostFormat: 'array',
      token: '',
      debug: false
    }
  })
  const submitAction: SubmitHandler<
    OneBotConfig['network']['httpClients'][0]
  > = async (data) => {
    await onSubmit(data)
    onClose()
  }
  const isEdit = !!data

  useEffect(() => {
    if (data) {
      setValue('enable', data.enable)
      setValue('name', data.name)
      setValue('url', data.url)
      setValue('reportSelfMessage', data.reportSelfMessage)
      setValue('messagePostFormat', data.messagePostFormat)
      setValue('token', data.token)
      setValue('debug', data.debug)
    } else {
      reset()
    }
  }, [data, reset])

  return (
    <>
      <ModalBody>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Controller
              control={control}
              name="enable"
              render={({ field }) => (
                <SwitchCard
                  {...field}
                  description="保存后启用此配置"
                  label="启用"
                />
              )}
            />
            <Controller
              control={control}
              name="debug"
              render={({ field }) => (
                <SwitchCard
                  {...field}
                  description="是否开启调试模式"
                  label="开启Debug"
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                isDisabled={isEdit}
                label="名称"
                placeholder="请输入名称"
              />
            )}
            rules={{ required: '请填写用于唯一标识和方便记住的名称' }}
          />
          <Controller
            control={control}
            name="url"
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                label="URL"
                placeholder="请输入URL"
              />
            )}
            rules={{ required: '请输入URL' }}
          />
          <Controller
            control={control}
            name="reportSelfMessage"
            render={({ field }) => (
              <SwitchCard
                {...field}
                description="是否上报自身消息"
                label="上报自身消息"
              />
            )}
          />
          <Controller
            control={control}
            name="messagePostFormat"
            render={({ field }) => (
              <Select
                {...field}
                isRequired
                label="消息格式"
                placeholder="请选择消息格式"
                selectedKeys={[field.value]}
              >
                <SelectItem key="array" value="array">
                  Array
                </SelectItem>
                <SelectItem key="string" value="string">
                  String
                </SelectItem>
              </Select>
            )}
            rules={{ required: '请选择消息格式' }}
          />
          <Controller
            control={control}
            name="token"
            render={({ field }) => (
              <Input {...field} label="Token" placeholder="请输入Token" />
            )}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          isDisabled={formState.isSubmitting}
          variant="light"
          onPress={onClose}
        >
          关闭
        </Button>
        <Button
          color="primary"
          isLoading={formState.isSubmitting}
          onClick={handleSubmit(submitAction)}
        >
          保存
        </Button>
      </ModalFooter>
    </>
  )
}

export default HTTPClientForm
