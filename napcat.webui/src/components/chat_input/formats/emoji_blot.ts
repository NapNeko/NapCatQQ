import Quill from 'quill'

// eslint-disable-next-line
const Embed = Quill.import('blots/embed') as any
export interface EmojiValue {
  alt: string
  src: string
  id: string
}
class EmojiBlot extends Embed {
  static blotName: string = 'emoji'
  static tagName: string = 'img'
  static classNames: string[] = ['w-6', 'h-6']

  static create(value: HTMLImageElement) {
    const node = super.create(value)
    node.setAttribute('alt', value.alt)
    node.setAttribute('src', value.src)
    node.setAttribute('data-id', value.id)
    node.classList.add(...EmojiBlot.classNames)
    return node
  }

  static formats(node: HTMLImageElement): EmojiValue {
    return {
      alt: node.getAttribute('alt') ?? '',
      src: node.getAttribute('src') ?? '',
      id: node.getAttribute('data-id') ?? ''
    }
  }

  static value(node: HTMLImageElement): EmojiValue {
    return {
      alt: node.getAttribute('alt') ?? '',
      src: node.getAttribute('src') ?? '',
      id: node.getAttribute('data-id') ?? ''
    }
  }
}

export default EmojiBlot
