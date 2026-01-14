import { NapCatCore, MessageElement, ElementType, NTMsgAtType } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';

export class SatoriMsgApi {
  private core: NapCatCore;

  constructor (_satoriAdapter: NapCatSatoriAdapter, core: NapCatCore) {
    this.core = core;
  }

  /**
   * 解析 Satori 消息内容为 NapCat 消息元素
   */
  async parseContent (content: string): Promise<MessageElement[]> {
    const elements: MessageElement[] = [];

    // 简单的 XML 解析
    const tagRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(content)) !== null) {
      // 处理标签前的文本
      if (match.index > lastIndex) {
        const text = content.slice(lastIndex, match.index);
        if (text.trim()) {
          elements.push(this.createTextElement(text));
        }
      }

      const [, tagName, attrs = '', innerContent] = match;
      const parsedAttrs = this.parseAttributes(attrs);

      switch (tagName) {
        case 'at':
          elements.push(await this.createAtElement(parsedAttrs));
          break;
        case 'img':
        case 'image':
          elements.push(await this.createImageElement(parsedAttrs));
          break;
        case 'audio':
          elements.push(await this.createAudioElement(parsedAttrs));
          break;
        case 'video':
          elements.push(await this.createVideoElement(parsedAttrs));
          break;
        case 'file':
          elements.push(await this.createFileElement(parsedAttrs));
          break;
        case 'face':
          elements.push(this.createFaceElement(parsedAttrs));
          break;
        case 'quote':
          elements.push(await this.createQuoteElement(parsedAttrs));
          break;
        default:
          // 未知标签，作为文本处理
          if (innerContent) {
            elements.push(this.createTextElement(innerContent));
          }
      }

      lastIndex = match.index + match[0].length;
    }

    // 处理剩余文本
    if (lastIndex < content.length) {
      const text = content.slice(lastIndex);
      if (text.trim()) {
        elements.push(this.createTextElement(text));
      }
    }

    // 如果没有解析到任何元素，将整个内容作为文本
    if (elements.length === 0 && content.trim()) {
      elements.push(this.createTextElement(content));
    }

    return elements;
  }

  /**
   * 解析 NapCat 消息元素为 Satori 消息内容
   */
  async parseElements (elements: MessageElement[]): Promise<string> {
    const parts: string[] = [];

    for (const element of elements) {
      switch (element.elementType) {
        case ElementType.TEXT:
          if (element.textElement) {
            parts.push(this.escapeXml(element.textElement.content));
          }
          break;
        case ElementType.PIC:
          if (element.picElement) {
            const src = element.picElement.sourcePath || '';
            parts.push(`<img src="${this.escapeXml(src)}"/>`);
          }
          break;
        case ElementType.PTT:
          if (element.pttElement) {
            const src = element.pttElement.filePath || '';
            parts.push(`<audio src="${this.escapeXml(src)}"/>`);
          }
          break;
        case ElementType.VIDEO:
          if (element.videoElement) {
            const src = element.videoElement.filePath || '';
            parts.push(`<video src="${this.escapeXml(src)}"/>`);
          }
          break;
        case ElementType.FILE:
          if (element.fileElement) {
            const src = element.fileElement.filePath || '';
            parts.push(`<file src="${this.escapeXml(src)}"/>`);
          }
          break;
        case ElementType.FACE:
          if (element.faceElement) {
            parts.push(`<face id="${element.faceElement.faceIndex}"/>`);
          }
          break;
        case ElementType.REPLY:
          if (element.replyElement) {
            parts.push(`<quote id="${element.replyElement.sourceMsgIdInRecords}"/>`);
          }
          break;
        default:
          // 其他类型暂不处理
          break;
      }
    }

    return parts.join('');
  }

  private parseAttributes (attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let match: RegExpExecArray | null;
    while ((match = attrRegex.exec(attrString)) !== null) {
      const key = match[1];
      const value = match[2];
      if (key !== undefined && value !== undefined) {
        attrs[key] = value;
      }
    }
    return attrs;
  }

  private createTextElement (content: string): MessageElement {
    return {
      elementType: ElementType.TEXT,
      elementId: '',
      textElement: {
        content: this.unescapeXml(content),
        atType: NTMsgAtType.ATTYPEUNKNOWN,
        atUid: '',
        atTinyId: '',
        atNtUid: '',
      },
    };
  }

  private async createAtElement (attrs: Record<string, string>): Promise<MessageElement> {
    const id = attrs['id'] || '';
    const type = attrs['type'];

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

  private async createImageElement (attrs: Record<string, string>): Promise<MessageElement> {
    const src = attrs['src'] || '';
    // 这里需要根据 src 类型处理（URL、base64、本地路径等）
    return {
      elementType: ElementType.PIC,
      elementId: '',
      picElement: {
        sourcePath: src,
        picWidth: parseInt(attrs['width'] || '0', 10),
        picHeight: parseInt(attrs['height'] || '0', 10),
      },
    } as MessageElement;
  }

  private async createAudioElement (attrs: Record<string, string>): Promise<MessageElement> {
    const src = attrs['src'] || '';
    return {
      elementType: ElementType.PTT,
      elementId: '',
      pttElement: {
        filePath: src,
        duration: parseInt(attrs['duration'] || '0', 10),
      },
    } as MessageElement;
  }

  private async createVideoElement (attrs: Record<string, string>): Promise<MessageElement> {
    const src = attrs['src'] || '';
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

  private async createFileElement (attrs: Record<string, string>): Promise<MessageElement> {
    const src = attrs['src'] || '';
    return {
      elementType: ElementType.FILE,
      elementId: '',
      fileElement: {
        filePath: src,
        fileName: attrs['title'] || '',
        fileSize: '',
      },
    } as MessageElement;
  }

  private createFaceElement (attrs: Record<string, string>): MessageElement {
    return {
      elementType: ElementType.FACE,
      elementId: '',
      faceElement: {
        faceIndex: parseInt(attrs['id'] || '0', 10),
        faceType: 1,
      },
    } as MessageElement;
  }

  private async createQuoteElement (attrs: Record<string, string>): Promise<MessageElement> {
    const id = attrs['id'] || '';
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

  private escapeXml (str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private unescapeXml (str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
}
