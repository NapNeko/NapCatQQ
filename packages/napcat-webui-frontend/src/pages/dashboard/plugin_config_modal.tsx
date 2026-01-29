import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PluginManager, { PluginConfigSchemaItem } from '@/controllers/plugin_manager';

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  /** 插件包名 (id) */
  pluginId: string;
}

export default function PluginConfigModal ({ isOpen, onOpenChange, pluginId }: Props) {
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<PluginConfigSchemaItem[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && pluginId) {
      loadConfig();
    }
  }, [isOpen, pluginId]);

  const loadConfig = async () => {
    setLoading(true);
    setSchema([]);
    setConfig({});
    try {
      const data = await PluginManager.getPluginConfig(pluginId);
      setSchema(data.schema || []);
      setConfig(data.config || {});
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

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

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
      case 'select':
        // Handle value matching for default selected keys
        const selectedValue = value !== undefined ? String(value) : undefined;
        return (
          <Select
            key={item.key}
            label={item.label}
            placeholder={item.placeholder || 'Select an option'}
            selectedKeys={selectedValue ? [selectedValue] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0];
              // Map back to value
              const opt = item.options?.find(o => String(o.value) === val);
              updateConfig(item.key, opt ? opt.value : val);
            }}
            description={item.description}
            className="mb-4"
          >
            {(item.options || []).map((opt) => (
              <SelectItem key={String(opt.value)} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
      case 'multi-select':
        const selectedKeys = Array.isArray(value) ? value.map(String) : [];
        return (
          <Select
            key={item.key}
            label={item.label}
            placeholder={item.placeholder || 'Select options'}
            selectionMode="multiple"
            selectedKeys={new Set(selectedKeys)}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys).map(k => {
                const opt = item.options?.find(o => String(o.value) === k);
                return opt ? opt.value : k;
              });
              updateConfig(item.key, selected);
            }}
            description={item.description}
            className="mb-4"
          >
            {(item.options || []).map((opt) => (
              <SelectItem key={String(opt.value)} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
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
              插件配置: {pluginId}
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center p-8">Loading configuration...</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {schema.length === 0 ? (
                    <div className="text-center text-default-500">No configuration schema available.</div>
                  ) : (
                    schema.map(renderField)
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
