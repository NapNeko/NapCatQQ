import { PluginConfigItem, PluginConfigSchema } from './types';

/**
 * NapCat 插件配置构建器
 * 提供便捷的配置项创建方法
 */
export class NapCatConfig {
  static text (key: string, label: string, defaultValue?: string, description?: string, reactive?: boolean): PluginConfigItem {
    return { key, type: 'string', label, default: defaultValue, description, reactive };
  }

  static number (key: string, label: string, defaultValue?: number, description?: string, reactive?: boolean): PluginConfigItem {
    return { key, type: 'number', label, default: defaultValue, description, reactive };
  }

  static boolean (key: string, label: string, defaultValue?: boolean, description?: string, reactive?: boolean): PluginConfigItem {
    return { key, type: 'boolean', label, default: defaultValue, description, reactive };
  }

  static select (key: string, label: string, options: { label: string; value: string | number; }[], defaultValue?: string | number, description?: string, reactive?: boolean): PluginConfigItem {
    return { key, type: 'select', label, options, default: defaultValue, description, reactive };
  }

  static multiSelect (key: string, label: string, options: { label: string; value: string | number; }[], defaultValue?: (string | number)[], description?: string, reactive?: boolean): PluginConfigItem {
    return { key, type: 'multi-select', label, options, default: defaultValue, description, reactive };
  }

  static html (content: string): PluginConfigItem {
    return { key: `_html_${Math.random().toString(36).slice(2)}`, type: 'html', label: '', default: content };
  }

  static plainText (content: string): PluginConfigItem {
    return { key: `_text_${Math.random().toString(36).slice(2)}`, type: 'text', label: '', default: content };
  }

  static combine (...items: PluginConfigItem[]): PluginConfigSchema {
    return items;
  }
}
