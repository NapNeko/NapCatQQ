import { createElement } from 'react'

import ShowStructedMessage from '@/components/chat_input/components/show_structed_message'

import { OB11Segment } from '@/types/onebot'

import useDialog from './use-dialog'

const useShowStructuredMessage = () => {
  const dialog = useDialog()

  const showStructuredMessage = (messages: OB11Segment[]) => {
    dialog.alert({
      title: '消息内容',
      size: '3xl',
      content: createElement(ShowStructedMessage, {
        messages: messages
      })
    })
  }

  return showStructuredMessage
}

export default useShowStructuredMessage
