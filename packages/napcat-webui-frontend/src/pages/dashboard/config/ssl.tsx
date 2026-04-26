import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';
import { Input } from '@heroui/input';

import PageLoading from '@/components/page_loading';

import WebUIManager from '@/controllers/webui_manager';

const SSLConfigCard = () => {
  const {
    data: sslData,
    loading: sslLoading,
    refreshAsync: refreshSSL,
  } = useRequest(WebUIManager.getSSLStatus);

  const [sslCert, setSslCert] = useState('');
  const [sslKey, setSslKey] = useState('');
  const [sslSaving, setSslSaving] = useState(false);

  // SSL 文件路径模式
  const [sslCertPath, setSslCertPath] = useState('');
  const [sslKeyPath, setSslKeyPath] = useState('');
  const [sslPathSaving, setSslPathSaving] = useState(false);

  useEffect(() => {
    if (sslData) {
      setSslCert(sslData.certContent || '');
      setSslKey(sslData.keyContent || '');
      setSslCertPath(sslData.sslCertPath || '');
      setSslKeyPath(sslData.sslKeyPath || '');
    }
  }, [sslData]);

  const handleSaveSSL = async () => {
    if (!sslCert.trim() || !sslKey.trim()) {
      toast.error('证书和私钥内容不能为空');
      return;
    }
    setSslSaving(true);
    try {
      const result = await WebUIManager.saveSSLCert(sslCert, sslKey);
      toast.success(result.message || 'SSL证书保存成功');
      await refreshSSL();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存SSL证书失败: ${msg}`);
    } finally {
      setSslSaving(false);
    }
  };

  const handleDeleteSSL = async () => {
    setSslSaving(true);
    try {
      const result = await WebUIManager.deleteSSLCert();
      toast.success(result.message || 'SSL证书已删除');
      setSslCert('');
      setSslKey('');
      await refreshSSL();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`删除SSL证书失败: ${msg}`);
    } finally {
      setSslSaving(false);
    }
  };

  const handleSaveSSLPath = async () => {
    setSslPathSaving(true);
    try {
      const result = await WebUIManager.saveSSLCertPath(sslCertPath.trim(), sslKeyPath.trim());
      toast.success(result.message || 'SSL证书路径已保存');
      await refreshSSL();
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`保存SSL证书路径失败: ${msg}`);
    } finally {
      setSslPathSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshSSL();
      toast.success('刷新成功');
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`刷新失败: ${msg}`);
    }
  };

  if (sslLoading) return <PageLoading loading />;

  return (
    <>
      <title>SSL配置 - NapCat WebUI</title>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <div className='flex-shrink-0 w-full font-bold text-default-600 dark:text-default-400 px-1'>SSL/HTTPS 配置</div>
            {sslData?.enabled && (
              <span className='px-2 py-0.5 text-xs bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 rounded-full whitespace-nowrap'>
                已启用
              </span>
            )}
          </div>
          <p className='text-sm text-default-500 px-1'>
            配置SSL证书后重启即可启用HTTPS。支持两种方式：粘贴证书内容，或填写证书文件的绝对路径。
          </p>
          <div className='p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800'>
            <p className='text-sm text-warning-700 dark:text-warning-400'>
              <strong>注意：</strong>保存证书后需要重启服务才能生效。文件路径方式优先于粘贴内容方式。
            </p>
          </div>
        </div>

        {/* SSL 文件路径配置 */}
        <div className='flex flex-col gap-3'>
          <div className='flex-shrink-0 w-full font-medium text-default-600 dark:text-default-400 px-1'>方式一：证书文件路径（推荐，支持 acme.sh 等自动续签）</div>
          <Input
            label='证书文件路径 (cert.pem 绝对路径)'
            placeholder='例如：/etc/ssl/certs/cert.pem'
            value={sslCertPath}
            onValueChange={setSslCertPath}
            description='填写证书文件的绝对路径，NapCat 每次启动时将自动读取该路径下的最新证书'
            classNames={{
              inputWrapper:
                'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
              input: 'bg-transparent text-default-700 placeholder:text-default-400 font-mono text-sm',
            }}
          />
          <Input
            label='私钥文件路径 (key.pem 绝对路径)'
            placeholder='例如：/etc/ssl/private/key.pem'
            value={sslKeyPath}
            onValueChange={setSslKeyPath}
            description='填写私钥文件的绝对路径'
            classNames={{
              inputWrapper:
                'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
              input: 'bg-transparent text-default-700 placeholder:text-default-400 font-mono text-sm',
            }}
          />
          <div className='flex gap-2 justify-end'>
            <Button
              variant='flat'
              isLoading={sslPathSaving || sslLoading}
              onPress={handleRefresh}
              size='sm'
            >
              刷新
            </Button>
            <Button
              color='primary'
              isLoading={sslPathSaving || sslLoading}
              onPress={handleSaveSSLPath}
              size='sm'
            >
              保存文件路径
            </Button>
          </div>
        </div>

        {/* SSL 证书内容粘贴 */}
        <div className='flex flex-col gap-3'>
          <div className='flex-shrink-0 w-full font-medium text-default-600 dark:text-default-400 px-1'>方式二：粘贴证书内容</div>
          <p className='text-sm text-default-500 px-1'>
            将证书(cert.pem)和私钥(key.pem)的内容粘贴到下方文本框中。
          </p>
          <div className='flex flex-col gap-4'>
            <Textarea
              label='证书内容 (cert.pem)'
              placeholder={'-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
              value={sslCert}
              onValueChange={setSslCert}
              minRows={6}
              maxRows={12}
              classNames={{
                inputWrapper:
                  'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
                input: 'bg-transparent text-default-700 placeholder:text-default-400 font-mono text-sm',
              }}
            />
            <Textarea
              label='私钥内容 (key.pem)'
              placeholder={'-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'}
              value={sslKey}
              onValueChange={setSslKey}
              minRows={6}
              maxRows={12}
              classNames={{
                inputWrapper:
                  'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
                input: 'bg-transparent text-default-700 placeholder:text-default-400 font-mono text-sm',
              }}
            />
          </div>

          <div className='flex gap-2 justify-end'>
            <Button
              variant='flat'
              isLoading={sslSaving || sslLoading}
              onPress={handleRefresh}
              size='sm'
            >
              刷新
            </Button>
            {sslData?.enabled && (
              <Button
                color='danger'
                variant='flat'
                isLoading={sslSaving || sslLoading}
                onPress={handleDeleteSSL}
                size='sm'
              >
                删除SSL证书
              </Button>
            )}
            <Button
              color='primary'
              isLoading={sslSaving || sslLoading}
              onPress={handleSaveSSL}
              size='sm'
            >
              保存SSL证书
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SSLConfigCard;
