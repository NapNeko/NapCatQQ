import { NapCatCore, MessageElement, ElementType, NTMsgAtType } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';
import SatoriElement from '@satorijs/element';

/**
 * Satori 消息处理 API
 * 使用 @satorijs/element 处理消息格式转换
 */
export class SatoriMsgApi {
  private core: NapCatCore;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _adapter: NapCatSatoriAdapter;

  constructor (satoriAdapter: NapCatSatoriAdapter, core: NapCatCore) {
    this._adapter = satoriAdapter;
    this.core = core;
  }

  /**
   * 解析 Satori 消息内容为 NapCat 消息元素
   * 使用 @satorijs/element 解析
   */
  async parseContent (content: string): Promise<MessageElement[]> {
    const elements: MessageElement[] = [];
    const parsed = SatoriElement.parse(content);

    for (const elem of parsed) {
      const parsedElements = await this.parseSatoriElement(elem);
      elements.push(...parsedElements);
    }

    // 如果没有解析到任何元素，将整个内容作为文本
    if (elements.length === 0 && content.trim()) {
      elements.push(this.createTextElement(content));
    }

    return elements;
  }

  /**
   * 解析 satorijs 元素为消息元素
   */
  private async parseSatoriElement (elem: SatoriElement): Promise<MessageElement[]> {
    const elements: MessageElement[] = [];

    switch (elem.type) {
      case 'text':
        if (elem.attrs['content']) {
          elements.push(this.createTextElement(elem.attrs['content']));
        }
        break;

      case 'at': {
        const attrs = elem.attrs;
        elements.push(await this.createAtElement({
          id: attrs['id'] || '',
          type: attrs['type'] || '',
          name: attrs['name'] || '',
        }));
        break;
      }

      case 'img':
      case 'image': {
        const attrs = elem.attrs;
        elements.push(await this.createImageElement({
          src: attrs['src'] || '',
          width: attrs['width'] || '',
          height: attrs['height'] || '',
        }));
        break;
      }

      case 'audio': {
        const attrs = elem.attrs;
        elements.push(await this.createAudioElement({
          src: attrs['src'] || '',
          duration: attrs['duration'] || '',
        }));
        break;
      }

      case 'video': {
        const attrs = elem.attrs;
        elements.push(await this.createVideoElement({
          src: attrs['src'] || '',
        }));
        break;
      }

      case 'file': {
        const attrs = elem.attrs;
        elements.push(await this.createFileElement({
          src: attrs['src'] || '',
          title: attrs['title'] || '',
        }));
        break;
      }

      case 'face': {
        const attrs = elem.attrs;
        elements.push(this.createFaceElement({
          id: attrs['id'] || '0',
        }));
        break;
      }

      case 'quote': {
        const attrs = elem.attrs;
        elements.push(await this.createQuoteElement({
          id: attrs['id'] || '',
        }));
        break;
      }

      case 'a': {
        const href = elem.attrs['href'];
        if (href) {
          const linkText = elem.children.map((c) => c.toString()).join('');
          elements.push(this.createTextElement(`${linkText} (${href})`));
        }
        break;
      }

      case 'button': {
        const text = elem.attrs['text'];
        if (text) {
          elements.push(this.createTextElement(`[${text}]`));
        }
        break;
      }

      case 'br':
        elements.push(this.createTextElement('\n'));
        break;

      case 'p':
        for (const child of elem.children) {
          elements.push(...await this.parseSatoriElement(child));
        }
        elements.push(this.createTextElement('\n'));
        break;

      default:
        // 递归处理子元素
        if (elem.children) {
          for (const child of elem.children) {
            elements.push(...await this.parseSatoriElement(child));
          }
        }
    }

    return elements;
  }

  /**
   * 解析 NapCat 消息元素为 Satori XML 消息内容
   */
  async parseElements (elements: MessageElement[]): Promise<string> {
    const satoriElements: SatoriElement[] = [];

    for (const element of elements) {
      const node = await this.elementToSatoriElement(element);
      if (node) {
        satoriElements.push(node);
      }
    }

    return satoriElements.map((e) => e.toString()).join('');
  }

  /**
   * 将单个消息元素转换为 SatoriElement
   */
  private async elementToSatoriElement (element: MessageElement): Promise<SatoriElement | null> {
    switch (element.elementType) {
      case ElementType.TEXT:
        if (element.textElement) {
          if (element.textElement.atType === NTMsgAtType.ATTYPEALL) {
            return SatoriElement('at', { type: 'all' });
          } else if (element.textElement.atType === NTMsgAtType.ATTYPEONE && element.textElement.atUid) {
            const uin = await this.core.apis.UserApi.getUinByUidV2(element.textElement.atUid);
            return SatoriElement('at', { id: uin, name: element.textElement.content?.replace('@', '') });
          }
          return SatoriElement.text(element.textElement.content);
        }
        break;

      case ElementType.PIC:
        if (element.picElement) {
          const src = await this.getMediaUrl(element.picElement.sourcePath || '', 'image');
          return SatoriElement('img', {
            src,
            width: element.picElement.picWidth,
            height: element.picElement.picHeight,
          });
        }
        break;

      case ElementType.PTT:
        if (element.pttElement) {
          const src = await this.getMediaUrl(element.pttElement.filePath || '', 'audio');
          return SatoriElement('audio', {
            src,
            duration: element.pttElement.duration,
          });
        }
        break;

      case ElementType.VIDEO:
        if (element.videoElement) {
          const src = await this.getMediaUrl(element.videoElement.filePath || '', 'video');
          return SatoriElement('video', { src });
        }
        break;

      case ElementType.FILE:
        if (element.fileElement) {
          const src = element.fileElement.filePath || '';
          return SatoriElement('file', {
            src,
            title: element.fileElement.fileName,
          });
        }
        break;

      case ElementType.FACE:
        if (element.faceElement) {
          return SatoriElement('face', { id: element.faceElement.faceIndex });
        }
        break;

      case ElementType.REPLY:
        if (element.replyElement) {
          const msgId = element.replyElement.sourceMsgIdInRecords || element.replyElement.replayMsgId || '';
          return SatoriElement('quote', { id: msgId });
        }
        break;

      case ElementType.MFACE:
        if (element.marketFaceElement) {
          return SatoriElement('face', { id: element.marketFaceElement.emojiId || '0' });
        }
        break;

      default:
        break;
    }

    return null;
  }

  /**
   * 获取媒体资源 URL
   */
  private async getMediaUrl (path: string, _type: 'image' | 'audio' | 'video'): Promise<string> {
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }

    if (path.startsWith('/') || /^[a-zA-Z]:/.test(path)) {
      return `file://${path.replace(/\\/g, '/')}`;
    }

    return path;
  }

  private createTextElement (content: string): MessageElement {
    return {
      elementType: ElementType.TEXT,
      elementId: '',
      textElement: {
        content,
        atType: NTMsgAtType.ATTYPEUNKNOWN,
        atUid: '',
        atTinyId: '',
        atNtUid: '',
      },
    };
  }

  private async createAtElement (attrs: { id: string; type?: string; name?: string; }): Promise<MessageElement> {
    const { id, type } = attrs;

    if (type === 'all') {
      return {
        elementType: ElementType.TEXT,
        elementId: '',
        textElement: {
          content: '@全体成员',
          atType: NTMsgAtType.ATTYPEALL,
          atUid: '',
          atTinyId: '',
          atNtUid: '',
        },
      };
    }

    const uid = await this.core.apis.UserApi.getUidByUinV2(id);
    const userInfo = await this.core.apis.UserApi.getUserDetailInfo(uid, false);

    return {
      elementType: ElementType.TEXT,
      elementId: '',
      textElement: {
        content: `@${userInfo.nick || id}`,
        atType: NTMsgAtType.ATTYPEONE,
        atUid: uid,
        atTinyId: '',
        atNtUid: uid,
      },
    };
  }

  private async createImageElement (attrs: { src: string; width?: string; height?: string; }): Promise<MessageElement> {
    const src = attrs.src;
    return {
      elementType: ElementType.PIC,
      elementId: '',
      picElement: {
        sourcePath: src,
        picWidth: parseInt(attrs.width || '0', 10),
        picHeight: parseInt(attrs.height || '0', 10),
      },
    } as MessageElement;
  }

  private async createAudioElement (attrs: { src: string; duration?: string; }): Promise<MessageElement> {
    const src = attrs.src;
    return {
      elementType: ElementType.PTT,
      elementId: '',
      pttElement: {
        filePath: src,
        duration: parseInt(attrs.duration || '0', 10),
      },
    } as MessageElement;
  }

  private async createVideoElement (attrs: { src: string; }): Promise<MessageElement> {
    const src = attrs.src;
    return {
      elementType: ElementType.VIDEO,
      elementId: '',
      videoElement: {
        filePath: src,
        videoMd5: '',
        thumbMd5: '',
        fileSize: '',
      },
    } as MessageElement;
  }

  private async createFileElement (attrs: { src: string; title?: string; }): Promise<MessageElement> {
    const src = attrs.src;
    return {
      elementType: ElementType.FILE,
      elementId: '',
      fileElement: {
        filePath: src,
        fileName: attrs.title || '',
        fileSize: '',
      },
    } as MessageElement;
  }

  private createFaceElement (attrs: { id: string; }): MessageElement {
    return {
      elementType: ElementType.FACE,
      elementId: '',
      faceElement: {
        faceIndex: parseInt(attrs.id || '0', 10),
        faceType: 1,
      },
    } as MessageElement;
  }

  private async createQuoteElement (attrs: { id: string; }): Promise<MessageElement> {
    const id = attrs.id;
    return {
      elementType: ElementType.REPLY,
      elementId: '',
      replyElement: {
        sourceMsgIdInRecords: id,
        replayMsgSeq: '',
        replayMsgId: id,
        senderUin: '',
        senderUinStr: '',
      },
    } as MessageElement;
  }
}
