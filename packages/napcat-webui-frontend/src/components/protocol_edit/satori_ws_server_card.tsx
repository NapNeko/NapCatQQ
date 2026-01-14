import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import { LuPencil, LuTrash2, LuServer } from 'react-icons/lu';

interface Props {
  data: SatoriWebSocketServerConfig;
  onDelete: () => Promise<void>;
  onEdit: () => void;
  onEnable: () => Promise<void>;
  onEnableDebug: () => Promise<void>;
}

export default function SatoriWSServerCard ({
  data,
  onDelete,
  onEdit,
  onEnable,
  onEnableDebug,
}: Props) {
  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LuServer className="w-4 h-4" />
          <span className="font-semibold truncate">{data.name}</span>
        </div>
        <Chip
          color={data.enable ? 'success' : 'default'}
          size="sm"
          variant="flat"
        >
          {data.enable ? '已启用' : '未启用'}
        </Chip>
      </CardHeader>
      <CardBody className="gap-2">
        <div className="text-sm">
          <span className="text-default-500">地址: </span>
          <span>{data.host}:{data.port}{data.path}</span>
        </div>
        <div className="text-sm">
          <span className="text-default-500">心跳间隔: </span>
          <span>{data.heartInterval}ms</span>
        </div>
        <div className="text-sm">
          <span className="text-default-500">Token: </span>
          <span>{data.token ? '******' : '未设置'}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Switch
            size="sm"
            isSelected={data.enable}
            onValueChange={onEnable}
          >
            启用
          </Switch>
          <Switch
            size="sm"
            isSelected={data.debug}
            onValueChange={onEnableDebug}
          >
            调试
          </Switch>
        </div>
      </CardBody>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          variant="flat"
          startContent={<LuPencil className="w-4 h-4" />}
          onPress={onEdit}
        >
          编辑
        </Button>
        <Button
          size="sm"
          variant="flat"
          color="danger"
          startContent={<LuTrash2 className="w-4 h-4" />}
          onPress={onDelete}
        >
          删除
        </Button>
      </CardFooter>
    </Card>
  );
}
