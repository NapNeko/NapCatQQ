import { useState, useCallback } from 'react';
import ProtocolManager from '@/controllers/protocol_manager';
import { deepClone } from '@/utils/object';

const useProtocolConfig = () => {
  const [protocols, setProtocols] = useState<ProtocolInfo[]>([]);
  const [protocolStatus, setProtocolStatus] = useState<Record<string, boolean>>({});
  const [satoriConfig, setSatoriConfig] = useState<SatoriConfig | null>(null);

  const refreshProtocols = useCallback(async () => {
    const [protocolList, status] = await Promise.all([
      ProtocolManager.getSupportedProtocols(),
      ProtocolManager.getProtocolStatus(),
    ]);
    setProtocols(protocolList);
    setProtocolStatus(status);
  }, []);

  const refreshSatoriConfig = useCallback(async () => {
    const config = await ProtocolManager.getSatoriConfig();
    setSatoriConfig(config);
  }, []);

  const createSatoriNetworkConfig = async <T extends SatoriNetworkConfigKey> (
    key: T,
    value: SatoriNetworkConfig[T][0]
  ) => {
    if (!satoriConfig) throw new Error('配置未加载');

    const allNames = Object.keys(satoriConfig.network).reduce((acc, k) => {
      const _key = k as SatoriNetworkConfigKey;
      return acc.concat(satoriConfig.network[_key].map((item) => item.name));
    }, [] as string[]);

    if (value.name && allNames.includes(value.name)) {
      throw new Error('已存在相同名称的配置项');
    }

    const newConfig = deepClone(satoriConfig);
    (newConfig.network[key] as (typeof value)[]).push(value);

    await ProtocolManager.setSatoriConfig(newConfig);
    setSatoriConfig(newConfig);
    return newConfig;
  };

  const updateSatoriNetworkConfig = async <T extends SatoriNetworkConfigKey> (
    key: T,
    value: SatoriNetworkConfig[T][0]
  ) => {
    if (!satoriConfig) throw new Error('配置未加载');

    const newConfig = deepClone(satoriConfig);
    const index = newConfig.network[key].findIndex((item) => item.name === value.name);

    if (index === -1) {
      throw new Error('找不到对应的配置项');
    }

    newConfig.network[key][index] = value;

    await ProtocolManager.setSatoriConfig(newConfig);
    setSatoriConfig(newConfig);
    return newConfig;
  };

  const deleteSatoriNetworkConfig = async <T extends SatoriNetworkConfigKey> (
    key: T,
    name: string
  ) => {
    if (!satoriConfig) throw new Error('配置未加载');

    const newConfig = deepClone(satoriConfig);
    const index = newConfig.network[key].findIndex((item) => item.name === name);

    if (index === -1) {
      throw new Error('找不到对应的配置项');
    }

    newConfig.network[key].splice(index, 1);

    await ProtocolManager.setSatoriConfig(newConfig);
    setSatoriConfig(newConfig);
    return newConfig;
  };

  const enableSatoriNetworkConfig = async <T extends SatoriNetworkConfigKey> (
    key: T,
    name: string
  ) => {
    if (!satoriConfig) throw new Error('配置未加载');

    const newConfig = deepClone(satoriConfig);
    const index = newConfig.network[key].findIndex((item) => item.name === name);

    if (index === -1) {
      throw new Error('找不到对应的配置项');
    }

    newConfig.network[key][index].enable = !newConfig.network[key][index].enable;

    await ProtocolManager.setSatoriConfig(newConfig);
    setSatoriConfig(newConfig);
    return newConfig;
  };

  const enableSatoriDebugConfig = async <T extends SatoriNetworkConfigKey> (
    key: T,
    name: string
  ) => {
    if (!satoriConfig) throw new Error('配置未加载');

    const newConfig = deepClone(satoriConfig);
    const index = newConfig.network[key].findIndex((item) => item.name === name);

    if (index === -1) {
      throw new Error('找不到对应的配置项');
    }

    newConfig.network[key][index].debug = !newConfig.network[key][index].debug;

    await ProtocolManager.setSatoriConfig(newConfig);
    setSatoriConfig(newConfig);
    return newConfig;
  };

  return {
    protocols,
    protocolStatus,
    satoriConfig,
    refreshProtocols,
    refreshSatoriConfig,
    createSatoriNetworkConfig,
    updateSatoriNetworkConfig,
    deleteSatoriNetworkConfig,
    enableSatoriNetworkConfig,
    enableSatoriDebugConfig,
  };
};

export default useProtocolConfig;
