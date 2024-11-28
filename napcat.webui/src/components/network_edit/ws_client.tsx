import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'
import { Select, SelectItem } from '@nextui-org/select'
import { ModalBody, ModalFooter } from '@nextui-org/modal'
import { useEffect } from 'react'

import SwitchCard from '../switch_card'

export interface WebsocketClientFormProps {
  data?: OneBotConfig['network']['websocketClients'][0]
  onClose: () => void
  onSubmit: (
    data: OneBotConfig['network']['websocketClients'][0]
  ) => Promise<void>
}
const WebsocketClientForm: React.FC<WebsocketClientFormProps> = ({
  data,
  onClose,
  onSubmit
}) => {
  const { control, handleSubmit, formState, setValue, reset } = useForm<
    OneBotConfig['network']['websocketClients'][0]
  >({
    defaultValues: {
      enable: false,
      name: '',
      url: 'ws://localhost:8082',
      reportSelfMessage: false,
      messagePostFormat: 'array',
      token: '',
      debug: false,
      heartInterval: 30000,
      reconnectInterval: 30000
    }
  })
  const submitAction: SubmitHandler<
    OneBotConfig['network']['websocketClients'][0]
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
      setValue('heartInterval', data.heartInterval)
      setValue('reconnectInterval', data.reconnectInterval)
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

          <Controller
            control={control}
            name="heartInterval"
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                label="心跳间隔"
                placeholder="请输入心跳间隔"
                value={field.value ? field.value.toString() : '0'}
                onChange={(e) => {
                  const port = parseInt(e.target.value)

                  field.onChange(port)
                }}
              />
            )}
            rules={{ required: '请填写心跳间隔' }}
          />

          <Controller
            control={control}
            name="reconnectInterval"
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                label="重连间隔"
                placeholder="请输入重连间隔"
                value={field.value ? field.value.toString() : '0'}
                onChange={(e) => {
                  const port = parseInt(e.target.value)

                  field.onChange(port)
                }}
              />
            )}
            rules={{ required: '请填写重连间隔' }}
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

export default WebsocketClientForm
