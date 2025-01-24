import Quill from 'quill'

// eslint-disable-next-line
const BlockEmbed = Quill.import('blots/block/embed') as any
export interface ReplyBlockValue {
  messageId: string
}
class ReplyBlock extends BlockEmbed {
  static blotName = 'reply'
  static tagName = 'div'
  static classNames = [
    'p-2',
    'select-none',
    'bg-default-100',
    'rounded-md',
    'pointer-events-none'
  ]

  static create(value: ReplyBlockValue) {
    const node = super.create()
    node.setAttribute('data-message-id', value.messageId)
    node.setAttribute('contenteditable', 'false')
    node.classList.add(...ReplyBlock.classNames)
    const innerDom = document.createElement('div')
    innerDom.classList.add('text-sm', 'text-default-500', 'relative')
    const svgContainer = document.createElement('div')
    svgContainer.classList.add('w-3', 'h-3', 'absolute', 'top-0', 'right-0')
    const svg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.9082 12.3714H20.5982C20.5182 17.0414 19.5982 17.8114 16.7282 19.5114C16.3982 19.7114 16.2882 20.1314 16.4882 20.4714C16.6882 20.8014 17.1082 20.9114 17.4482 20.7114C20.8282 18.7114 22.0082 17.4914 22.0082 11.6714V6.28141C22.0082 4.57141 20.6182 3.19141 18.9182 3.19141H15.9182C14.1582 3.19141 12.8282 4.52141 12.8282 6.28141V9.28141C12.8182 11.0414 14.1482 12.3714 15.9082 12.3714Z" fill="#292D32"></path> <path d="M5.09 12.3714H9.78C9.7 17.0414 8.78 17.8114 5.91 19.5114C5.58 19.7114 5.47 20.1314 5.67 20.4714C5.87 20.8014 6.29 20.9114 6.63 20.7114C10.01 18.7114 11.19 17.4914 11.19 11.6714V6.28141C11.19 4.57141 9.8 3.19141 8.1 3.19141H5.1C3.33 3.19141 2 4.52141 2 6.28141V9.28141C2 11.0414 3.33 12.3714 5.09 12.3714Z" fill="#292D32"></path> </g></svg>`
    svgContainer.innerHTML = svg
    innerDom.innerHTML = `消息ID：${value.messageId}`
    innerDom.appendChild(svgContainer)
    node.appendChild(innerDom)
    return node
  }

  static value(node: HTMLElement): ReplyBlockValue {
    return {
      messageId: node.getAttribute('data-message-id') || ''
    }
  }
}

export default ReplyBlock
