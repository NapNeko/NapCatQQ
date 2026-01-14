/**
 * Satori XML 元素节点
 */
export interface SatoriXmlNode {
  type: string;
  attrs: Record<string, string>;
  children: (SatoriXmlNode | string)[];
}

/**
 * Satori XML 工具类
 * 用于解析和构建 Satori 协议的 XML 格式消息
 * 使用简单的正则解析方式，避免外部依赖
 */
export class SatoriXmlUtils {
  /**
   * 解析 Satori XML 字符串为元素节点数组
   */
  static parse (xmlString: string): SatoriXmlNode[] {
    const nodes: SatoriXmlNode[] = [];
    const tagRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(xmlString)) !== null) {
      // 处理标签前的文本
      if (match.index > lastIndex) {
        const text = xmlString.slice(lastIndex, match.index);
        if (text.trim()) {
          nodes.push({
            type: 'text',
            attrs: { content: this.unescapeXml(text) },
            children: [],
          });
        }
      }

      const [, tagName, rawAttrs = '', innerContent] = match;
      if (!tagName) continue;

      const attrs = this.parseAttributes(rawAttrs);
      const children: (SatoriXmlNode | string)[] = [];

      // 如果有内部内容，递归解析
      if (innerContent) {
        const innerNodes = this.parse(innerContent);
        // 如果解析出来只有一个空文本，直接用内容
        if (innerNodes.length === 1 && innerNodes[0]?.type === 'text') {
          children.push(innerNodes[0]);
        } else if (innerNodes.length > 0) {
          children.push(...innerNodes);
        } else if (innerContent.trim()) {
          children.push({
            type: 'text',
            attrs: { content: this.unescapeXml(innerContent) },
            children: [],
          });
        }
      }

      nodes.push({
        type: tagName.toLowerCase(),
        attrs,
        children,
      });

      lastIndex = match.index + match[0].length;
    }

    // 处理剩余文本
    if (lastIndex < xmlString.length) {
      const text = xmlString.slice(lastIndex);
      if (text.trim()) {
        nodes.push({
          type: 'text',
          attrs: { content: this.unescapeXml(text) },
          children: [],
        });
      }
    }

    return nodes;
  }

  /**
   * 解析属性字符串
   */
  private static parseAttributes (attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let match: RegExpExecArray | null;
    while ((match = attrRegex.exec(attrString)) !== null) {
      const key = match[1];
      const value = match[2];
      if (key !== undefined && value !== undefined) {
        attrs[key] = this.unescapeXml(value);
      }
    }
    return attrs;
  }

  /**
   * 将元素节点数组序列化为 XML 字符串
   */
  static serialize (nodes: SatoriXmlNode[]): string {
    return nodes.map((node) => this.serializeNode(node)).join('');
  }

  /**
   * 序列化单个节点
   */
  private static serializeNode (node: SatoriXmlNode): string {
    if (node.type === 'text') {
      return this.escapeXml(node.attrs['content'] || '');
    }

    const attrs = Object.entries(node.attrs)
      .map(([key, value]) => `${key}="${this.escapeXml(value)}"`)
      .join(' ');

    const hasChildren = node.children.length > 0;

    if (!hasChildren) {
      return attrs ? `<${node.type} ${attrs}/>` : `<${node.type}/>`;
    }

    const openTag = attrs ? `<${node.type} ${attrs}>` : `<${node.type}>`;
    const childrenStr = node.children
      .map((child) => (typeof child === 'string' ? this.escapeXml(child) : this.serializeNode(child)))
      .join('');

    return `${openTag}${childrenStr}</${node.type}>`;
  }

  /**
   * 创建文本节点
   */
  static createText (content: string): SatoriXmlNode {
    return { type: 'text', attrs: { content }, children: [] };
  }

  /**
   * 创建 at 节点
   */
  static createAt (id?: string, name?: string, type?: string): SatoriXmlNode {
    const attrs: Record<string, string> = {};
    if (id) attrs['id'] = id;
    if (name) attrs['name'] = name;
    if (type) attrs['type'] = type;
    return { type: 'at', attrs, children: [] };
  }

  /**
   * 创建图片节点
   */
  static createImg (src: string, attrs?: { width?: number; height?: number; title?: string; }): SatoriXmlNode {
    const nodeAttrs: Record<string, string> = { src };
    if (attrs?.width) nodeAttrs['width'] = String(attrs.width);
    if (attrs?.height) nodeAttrs['height'] = String(attrs.height);
    if (attrs?.title) nodeAttrs['title'] = attrs.title;
    return { type: 'img', attrs: nodeAttrs, children: [] };
  }

  /**
   * 创建音频节点
   */
  static createAudio (src: string, attrs?: { duration?: number; title?: string; }): SatoriXmlNode {
    const nodeAttrs: Record<string, string> = { src };
    if (attrs?.duration) nodeAttrs['duration'] = String(attrs.duration);
    if (attrs?.title) nodeAttrs['title'] = attrs.title;
    return { type: 'audio', attrs: nodeAttrs, children: [] };
  }

  /**
   * 创建视频节点
   */
  static createVideo (src: string, attrs?: { width?: number; height?: number; duration?: number; title?: string; }): SatoriXmlNode {
    const nodeAttrs: Record<string, string> = { src };
    if (attrs?.width) nodeAttrs['width'] = String(attrs.width);
    if (attrs?.height) nodeAttrs['height'] = String(attrs.height);
    if (attrs?.duration) nodeAttrs['duration'] = String(attrs.duration);
    if (attrs?.title) nodeAttrs['title'] = attrs.title;
    return { type: 'video', attrs: nodeAttrs, children: [] };
  }

  /**
   * 创建文件节点
   */
  static createFile (src: string, attrs?: { title?: string; }): SatoriXmlNode {
    const nodeAttrs: Record<string, string> = { src };
    if (attrs?.title) nodeAttrs['title'] = attrs.title;
    return { type: 'file', attrs: nodeAttrs, children: [] };
  }

  /**
   * 创建表情节点
   */
  static createFace (id: string | number): SatoriXmlNode {
    return { type: 'face', attrs: { id: String(id) }, children: [] };
  }

  /**
   * 创建引用节点
   */
  static createQuote (id: string): SatoriXmlNode {
    return { type: 'quote', attrs: { id }, children: [] };
  }

  /**
   * 创建消息节点（用于转发消息）
   */
  static createMessage (attrs?: { id?: string; forward?: boolean; }, children?: SatoriXmlNode[]): SatoriXmlNode {
    const nodeAttrs: Record<string, string> = {};
    if (attrs?.id) nodeAttrs['id'] = attrs.id;
    if (attrs?.forward !== undefined) nodeAttrs['forward'] = String(attrs.forward);
    return { type: 'message', attrs: nodeAttrs, children: children || [] };
  }

  /**
   * 创建作者节点
   */
  static createAuthor (attrs: { id?: string; name?: string; avatar?: string; }): SatoriXmlNode {
    const nodeAttrs: Record<string, string> = {};
    if (attrs.id) nodeAttrs['id'] = attrs.id;
    if (attrs.name) nodeAttrs['name'] = attrs.name;
    if (attrs.avatar) nodeAttrs['avatar'] = attrs.avatar;
    return { type: 'author', attrs: nodeAttrs, children: [] };
  }

  /**
   * 创建换行节点
   */
  static createBr (): SatoriXmlNode {
    return { type: 'br', attrs: {}, children: [] };
  }

  /**
   * 创建按钮节点
   */
  static createButton (attrs: { id?: string; type?: string; href?: string; text?: string; }): SatoriXmlNode {
    const nodeAttrs: Record<string, string> = {};
    if (attrs.id) nodeAttrs['id'] = attrs.id;
    if (attrs.type) nodeAttrs['type'] = attrs.type;
    if (attrs.href) nodeAttrs['href'] = attrs.href;
    if (attrs.text) nodeAttrs['text'] = attrs.text;
    return { type: 'button', attrs: nodeAttrs, children: [] };
  }

  /**
   * 创建样式标签节点
   */
  static createStyled (type: 'b' | 'i' | 'u' | 's' | 'code' | 'sup' | 'sub' | 'spl', children: SatoriXmlNode[]): SatoriXmlNode {
    return { type, attrs: {}, children };
  }

  /**
   * XML 转义
   */
  static escapeXml (str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * XML 反转义
   */
  static unescapeXml (str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  /**
   * 遍历所有节点
   */
  static walk (nodes: SatoriXmlNode[], callback: (node: SatoriXmlNode) => void): void {
    for (const node of nodes) {
      callback(node);
      if (node.children) {
        const childNodes = node.children.filter((c): c is SatoriXmlNode => typeof c !== 'string');
        this.walk(childNodes, callback);
      }
    }
  }

  /**
   * 查找指定类型的节点
   */
  static find (nodes: SatoriXmlNode[], type: string): SatoriXmlNode[] {
    const result: SatoriXmlNode[] = [];
    this.walk(nodes, (node) => {
      if (node.type === type) {
        result.push(node);
      }
    });
    return result;
  }

  /**
   * 提取纯文本内容
   */
  static extractText (nodes: SatoriXmlNode[]): string {
    const texts: string[] = [];
    this.walk(nodes, (node) => {
      if (node.type === 'text' && node.attrs['content']) {
        texts.push(node.attrs['content']);
      }
    });
    return texts.join('');
  }
}

export { SatoriXmlUtils as XmlUtils };
