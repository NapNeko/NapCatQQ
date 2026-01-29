import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { EventSourcePolyfill } from 'event-source-polyfill';
import PluginManager, { PluginConfigSchemaItem } from '@/controllers/plugin_manager';
import key from '@/const/key';

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  /** 插件包名 (id) */
  pluginId: string;
}

/** Schema 更新事件类型 */
interface SchemaUpdateEvent {
  type: 'full' | 'updateField' | 'removeField' | 'addField' | 'showField' | 'hideField';
  schema?: PluginConfigSchemaItem[];
  key?: string;
  field?: Partial<PluginConfigSchemaItem>;
  afterKey?: string;
}

export default function PluginConfigModal ({ isOpen, onOpenChange, pluginId }: Props) {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<PluginConfigSchemaItem[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [supportReactive, setSupportReactive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // SSE 连接引用
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  // 当前配置引用（用于 SSE 回调）
  const configRef = useRef<Record<string, unknown>>({});

  // 同步 config 到 ref
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /** 处理 schema 更新事件 */
  const handleSchemaUpdate = useCallback((event: SchemaUpdateEvent) => {
    switch (event.type) {
      case 'full':
        if (event.schema) {
          setSchema(event.schema);
        }
        break;
      case 'updateField':
        if (event.key && event.field) {
          setSchema(prev => prev.map(item =>
            item.key === event.key ? { ...item, ...event.field } : item
          ));
        }
        break;
      case 'removeField':
        if (event.key) {
          setSchema(prev => prev.filter(item => item.key !== event.key));
        }
        break;
      case 'addField':
        if (event.field) {
          setSchema(prev => {
            const newField = event.field as PluginConfigSchemaItem;
            // 检查字段是否已存在，如果存在则更新
            const existingIndex = prev.findIndex(item => item.key === newField.key);
            if (existingIndex !== -1) {
              // 字段已存在，更新它
              const newSchema = [...prev];
              newSchema[existingIndex] = { ...newSchema[existingIndex], ...newField };
              return newSchema;
            }
            // 字段不存在，添加新字段
            if (event.afterKey) {
              const index = prev.findIndex(item => item.key === event.afterKey);
              if (index !== -1) {
                const newSchema = [...prev];
                newSchema.splice(index + 1, 0, newField);
                return newSchema;
              }
            }
            return [...prev, newField];
          });
        }
        break;
      case 'showField':
        if (event.key) {
          setSchema(prev => prev.map(item =>
            item.key === event.key ? { ...item, hidden: false } : item
          ));
        }
        break;
      case 'hideField':
        if (event.key) {
          setSchema(prev => prev.map(item =>
            item.key === event.key ? { ...item, hidden: true } : item
          ));
        }
        break;
    }
  }, []);

  /** 建立 SSE 连接 */
  const connectSSE = useCallback((initialConfig: Record<string, unknown>) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = localStorage.getItem(key.token);
    if (!token) {
      console.warn('未登录，无法建立 SSE 连接');
      return;
    }
    const _token = JSON.parse(token);

    const url = PluginManager.getConfigSSEUrl(pluginId, initialConfig);
    const es = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${_token}`,
        Accept: 'text/event-stream',
      },
      withCredentials: true,
    });
    eventSourceRef.current = es;

    es.addEventListener('connected', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setSessionId(data.sessionId);
      setConnected(true);
    });

    es.addEventListener('schema', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      handleSchemaUpdate(data);
    });

    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        toast.error('插件错误: ' + data.message);
      } catch {
        // SSE 连接错误
        setConnected(false);
      }
    });

    es.onerror = () => {
      setConnected(false);
    };
  }, [pluginId, handleSchemaUpdate]);

  /** 关闭 SSE 连接 */
  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSessionId(null);
    setConnected(false);
  }, []);

  useEffect(() => {
    if (isOpen && pluginId) {
      loadConfig();
    }
    return () => {
      disconnectSSE();
    };
  }, [isOpen, pluginId, disconnectSSE]);

  /** 初始加载配置 */
  const loadConfig = async () => {
    setLoading(true);
    setSchema([]);
    setConfig({});
    setSupportReactive(false);
    disconnectSSE();

    try {
      const data = await PluginManager.getPluginConfig(pluginId);
      setSchema(data.schema || []);
      setConfig(data.config || {});
      setSupportReactive(!!data.supportReactive);

      // 如果支持响应式，建立 SSE 连接
      if (data.supportReactive) {
        connectSSE(data.config || {});
      }
    } catch (e: any) {
      toast.error('加载配置失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await PluginManager.setPluginConfig(pluginId, config);
      toast.success('Configuration saved');
      onOpenChange();
    } catch (e: any) {
      toast.error('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  /** 更新配置 */
  const updateConfig = useCallback((key: string, value: any) => {
    setConfig((prev) => {
      const newConfig = { ...prev, [key]: value };

      // 如果是响应式字段且已连接 SSE，通知后端
      const field = schema.find(item => item.key === key);
      if (field?.reactive && sessionId && connected) {
        PluginManager.notifyConfigChange(pluginId, sessionId, key, value, newConfig)
          .catch(e => console.error('通知配置变化失败:', e));
      }

      return newConfig;
    });
  }, [schema, sessionId, connected, pluginId]);

  const renderField = (item: PluginConfigSchemaItem) => {
    const value = config[item.key] ?? item.default;

    switch (item.type) {
      case 'string':
        return (
          <Input
            key={item.key}
            label={item.label}
            placeholder={item.placeholder || item.description}
            value={value || ''}
            onValueChange={(val) => updateConfig(item.key, val)}
            description={item.description}
            className="mb-4"
          />
        );
      case 'number':
        return (
          <Input
            key={item.key}
            type="number"
            label={item.label}
            placeholder={item.placeholder || item.description}
            value={String(value ?? 0)}
            onValueChange={(val) => updateConfig(item.key, Number(val))}
            description={item.description}
            className="mb-4"
          />
        );
      case 'boolean':
        return (
          <div key={item.key} className="flex justify-between items-center mb-4 p-2 bg-default-100 rounded-lg">
            <div className="flex flex-col">
              <span className="text-small">{item.label}</span>
              {item.description && <span className="text-tiny text-default-500">{item.description}</span>}
            </div>
            <Switch
              isSelected={!!value}
              onValueChange={(val) => updateConfig(item.key, val)}
            />
          </div>
        );
      case 'select': {
        const selectedValue = value !== undefined ? String(value) : undefined;
        const options = item.options || [];
        return (
          <Select
            key={item.key}
            label={item.label}
            placeholder={item.placeholder || 'Select an option'}
            selectedKeys={selectedValue ? [selectedValue] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0];
              const opt = options.find(o => String(o.value) === val);
              updateConfig(item.key, opt ? opt.value : val);
            }}
            description={item.description}
            className="mb-4"
          >
            {options.map((opt) => (
              <SelectItem key={String(opt.value)} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
      }
      case 'multi-select': {
        const selectedKeys = Array.isArray(value) ? value.map(String) : [];
        const options = item.options || [];
        return (
          <Select
            key={item.key}
            label={item.label}
            placeholder={item.placeholder || 'Select options'}
            selectionMode="multiple"
            selectedKeys={new Set(selectedKeys)}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys).map(k => {
                const opt = options.find(o => String(o.value) === k);
                return opt ? opt.value : k;
              });
              updateConfig(item.key, selected);
            }}
            description={item.description}
            className="mb-4"
          >
            {options.map((opt) => (
              <SelectItem key={String(opt.value)} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
      }
      case 'html':
        return (
          <div key={item.key} className="mb-4">
            {item.label && <h4 className="text-small font-bold mb-1">{item.label}</h4>}
            <div dangerouslySetInnerHTML={{ __html: item.default || '' }} className="prose dark:prose-invert max-w-none" />
            {item.description && <p className="text-tiny text-default-500 mt-1">{item.description}</p>}
          </div>
        );
      case 'text':
        return (
          <div key={item.key} className="mb-4">
            {item.label && <h4 className="text-small font-bold mb-1">{item.label}</h4>}
            <div className="whitespace-pre-wrap text-default-700">{item.default || ''}</div>
            {item.description && <p className="text-tiny text-default-500 mt-1">{item.description}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                插件配置: {pluginId}
                {supportReactive && (
                  <span className={`text-tiny px-2 py-0.5 rounded ${connected ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}`}>
                    {connected ? '已连接' : '未连接'}
                  </span>
                )}
              </div>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center p-8">Loading configuration...</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {schema.length === 0 ? (
                    <div className="text-center text-default-500">No configuration schema available.</div>
                  ) : (
                    schema.filter(item => !item.hidden).map(renderField)
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSave} isLoading={saving}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

