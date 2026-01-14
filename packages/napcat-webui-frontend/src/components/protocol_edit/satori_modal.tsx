import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  data?: SatoriWebSocketServerConfig | SatoriHttpServerConfig | SatoriWebHookClientConfig;
  field: SatoriNetworkConfigKey;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (field: SatoriNetworkConfigKey, data: any) => Promise<any>;
  onUpdate: (field: SatoriNetworkConfigKey, data: any) => Promise<any>;
}

const defaultWSServer: SatoriWebSocketServerConfig = {
  name: '',
  enable: true,
  host: '127.0.0.1',
  port: 5500,
  path: '/v1/events',
  token: '',
  debug: false,
  heartInterval: 10000,
};

const defaultHttpServer: SatoriHttpServerConfig = {
  name: '',
  enable: true,
  host: '127.0.0.1',
  port: 5501,
  path: '/v1',
  token: '',
  debug: false,
};

const defaultWebhookClient: SatoriWebHookClientConfig = {
  name: '',
  enable: true,
  url: 'http://localhost:8080/webhook',
  token: '',
  debug: false,
};

export default function SatoriNetworkFormModal ({
  data,
  field,
  isOpen,
  onOpenChange,
  onCreate,
  onUpdate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const isEdit = !!data;
  const title = isEdit ? '编辑配置' : '新建配置';

  useEffect(() => {
    if (isOpen) {
      if (data) {
        setFormData({ ...data });
      } else {
        switch (field) {
          case 'websocketServers':
            setFormData({ ...defaultWSServer });
            break;
          case 'httpServers':
            setFormData({ ...defaultHttpServer });
            break;
          case 'webhookClients':
            setFormData({ ...defaultWebhookClient });
            break;
        }
      }
    }
  }, [isOpen, data, field]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('请输入配置名称');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await onUpdate(field, formData);
      } else {
        await onCreate(field, formData);
      }
      toast.success(isEdit ? '更新成功' : '创建成功');
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  if (!formData) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="配置名称"
            placeholder="请输入配置名称"
            value={formData.name}
            onValueChange={(v) => updateField('name', v)}
            isDisabled={isEdit}
          />

          {(field === 'websocketServers' || field === 'httpServers') && (
            <>
              <Input
                label="主机地址"
                placeholder="127.0.0.1"
                value={formData.host}
                onValueChange={(v) => updateField('host', v)}
              />
              <Input
                label="端口"
                type="number"
                placeholder="5500"
                value={String(formData.port)}
                onValueChange={(v) => updateField('port', parseInt(v) || 0)}
              />
              <Input
                label="路径"
                placeholder="/v1/events"
                value={formData.path}
                onValueChange={(v) => updateField('path', v)}
              />
            </>
          )}

          {field === 'webhookClients' && (
            <Input
              label="WebHook URL"
              placeholder="http://localhost:8080/webhook"
              value={formData.url}
              onValueChange={(v) => updateField('url', v)}
            />
          )}

          <Input
            label="Token"
            placeholder="可选，用于鉴权"
            value={formData.token}
            onValueChange={(v) => updateField('token', v)}
          />

          {field === 'websocketServers' && (
            <Input
              label="心跳间隔 (ms)"
              type="number"
              placeholder="10000"
              value={String(formData.heartInterval)}
              onValueChange={(v) => updateField('heartInterval', parseInt(v) || 10000)}
            />
          )}

          <div className="flex gap-4">
            <Switch
              isSelected={formData.enable}
              onValueChange={(v) => updateField('enable', v)}
            >
              启用
            </Switch>
            <Switch
              isSelected={formData.debug}
              onValueChange={(v) => updateField('debug', v)}
            >
              调试模式
            </Switch>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            取消
          </Button>
          <Button color="primary" isLoading={loading} onPress={handleSubmit}>
            {isEdit ? '保存' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
