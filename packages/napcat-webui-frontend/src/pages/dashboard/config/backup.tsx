import { Button } from '@heroui/button';
import toast from 'react-hot-toast';
import { LuDownload, LuUpload } from 'react-icons/lu';

import key from '@/const/key';

// 导入配置
const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 检查文件类型
  if (!file.name.endsWith('.zip')) {
    toast.error('请选择zip格式的配置文件');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('configFile', file);

    const token = localStorage.getItem(key.token);
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
    }

    const response = await fetch('/api/OB11Config/ImportConfig', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '导入配置失败');
    }

    const result = await response.json();
    toast.success(result.data?.message || '配置导入成功。');

  } catch (error) {
    const msg = (error as Error).message;
    toast.error(`导入配置失败: ${msg}`);
  } finally {
    // 重置文件输入
    event.target.value = '';
  }
};

// 导出配置
const handleExportConfig = async () => {
  try {
    const token = localStorage.getItem(key.token);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
    }
    const response = await fetch('/api/OB11Config/ExportConfig', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('导出配置失败');
    }

    // 创建下载链接
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = response.headers.get('Content-Disposition')?.split('=')[1]?.replace(/"/g, '') || 'config_backup.zip';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('配置导出成功');
  } catch (error) {
    const msg = (error as Error).message;

    toast.error(`导出配置失败: ${msg}`);
  }
};

const BackupConfigCard: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium mb-4'>备份与恢复</h3>
        <p className='text-sm text-default-500 mb-4'>
          您可以通过导入/导出配置文件来备份和恢复NapCat的所有设置
        </p>

        <div className='flex flex-wrap gap-3'>
          <Button
            isIconOnly
            className="bg-primary hover:bg-primary/90 text-white"
            radius='full'
            onPress={handleExportConfig}
            title="导出配置"
          >
            <LuDownload size={20} />
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".zip"
              onChange={handleImportConfig}
              className="hidden"
            />
            <Button
              isIconOnly
              className="bg-primary hover:bg-primary/90 text-white"
              radius='full'
              as="span"
              title="导入配置"
            >
              <LuUpload size={20} />
            </Button>
          </label>
        </div>

        <div className='mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg'>
          <div className='flex items-start gap-2'>
            <p className='text-sm text-warning'>
              导入配置会覆盖当前所有设置，请谨慎操作。导入前建议先导出当前配置作为备份。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupConfigCard;