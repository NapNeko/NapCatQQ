import GenericForm from './generic_form'
import type { Field } from './generic_form'

export interface HTTPClientFormProps {
  data?: OneBotConfig['network']['httpClients'][0]
  onClose: () => void
  onSubmit: (data: OneBotConfig['network']['httpClients'][0]) => Promise<void>
}

type HTTPClientFormType = OneBotConfig['network']['httpClients']

const HTTPClientForm: React.FC<HTTPClientFormProps> = ({
  data,
  onClose,
  onSubmit
}) => {
  const defaultValues: HTTPClientFormType[0] = {
    enable: false,
    name: '',
    url: 'http://localhost:8080',
    reportSelfMessage: false,
    messagePostFormat: 'array',
    token: '',
    debug: false
  }

  const fields: Field<'httpClients'>[] = [
    {
      name: 'enable',
      label: '启用',
      type: 'switch',
      description: '保存后启用此配置',
      colSpan: 1
    },
    {
      name: 'debug',
      label: '开启Debug',
      type: 'switch',
      description: '是否开启调试模式',
      colSpan: 1
    },
    {
      name: 'name',
      label: '名称',
      type: 'input',
      placeholder: '请输入名称',
      isRequired: true,
      isDisabled: !!data
    },
    {
      name: 'url',
      label: 'URL',
      type: 'input',
      placeholder: '请输入URL',
      isRequired: true
    },
    {
      name: 'reportSelfMessage',
      label: '上报自身消息',
      type: 'switch',
      description: '是否上报自身消息',
      colSpan: 1
    },
    {
      name: 'messagePostFormat',
      label: '消息格式',
      type: 'select',
      placeholder: '请选择消息格式',
      isRequired: true,
      options: [
        { key: 'array', value: 'Array' },
        { key: 'string', value: 'String' }
      ],
      colSpan: 1
    },
    {
      name: 'token',
      label: 'Token',
      type: 'input',
      placeholder: '请输入Token'
    }
  ]

  return (
    <GenericForm
      data={data}
      defaultValues={defaultValues}
      onClose={onClose}
      onSubmit={onSubmit}
      fields={fields}
    />
  )
}

export default HTTPClientForm
