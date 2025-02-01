import { updateConfig as storeUpdateConfig } from '@/store/modules/config'

import { deepClone } from '@/utils/object'

import QQManager from '@/controllers/qq_manager'

import { useAppDispatch, useAppSelector } from './use-store'

const useConfig = () => {
  const config = useAppSelector((state) => state.config.value)
  const dispatch = useAppDispatch()

  const createNetworkConfig = async <T extends keyof OneBotConfig['network']>(
    key: T,
    value: OneBotConfig['network'][T][0]
  ) => {
    const allNetworkNames = Object.keys(config.network).reduce((acc, key) => {
      const _key = key as keyof OneBotConfig['network']
      return acc.concat(config.network[_key].map((item) => item.name))
    }, [] as string[])

    if (value.name && allNetworkNames.includes(value.name)) {
      throw new Error('已经存在相同的配置项名')
    }

    const newConfig = deepClone(config)

    ;(newConfig.network[key] as (typeof value)[]).push(value)

    await QQManager.setOB11Config(newConfig)

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const updateNetworkConfig = async <T extends keyof OneBotConfig['network']>(
    key: T,
    value: OneBotConfig['network'][T][0]
  ) => {
    const newConfig = deepClone(config)
    const name = value.name
    const index = newConfig.network[key].findIndex((item) => item.name === name)

    if (index === -1) {
      throw new Error('找不到对应的配置项')
    }

    newConfig.network[key][index] = value

    await QQManager.setOB11Config(newConfig)

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const deleteNetworkConfig = async <T extends keyof OneBotConfig['network']>(
    key: T,
    name: string
  ) => {
    const newConfig = deepClone(config)
    const index = newConfig.network[key].findIndex((item) => item.name === name)

    if (index === -1) {
      throw new Error('找不到对应的配置项')
    }

    newConfig.network[key].splice(index, 1)

    await QQManager.setOB11Config(newConfig)

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const enableNetworkConfig = async <T extends keyof OneBotConfig['network']>(
    key: T,
    name: string
  ) => {
    const newConfig = deepClone(config)
    const index = newConfig.network[key].findIndex((item) => item.name === name)

    if (index === -1) {
      throw new Error('找不到对应的配置项')
    }

    newConfig.network[key][index].enable = !newConfig.network[key][index].enable

    await QQManager.setOB11Config(newConfig)

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const enableDebugNetworkConfig = async <
    T extends keyof OneBotConfig['network']
  >(
    key: T,
    name: string
  ) => {
    const newConfig = deepClone(config)
    const index = newConfig.network[key].findIndex((item) => item.name === name)

    if (index === -1) {
      throw new Error('找不到对应的配置项')
    }

    newConfig.network[key][index].debug = !newConfig.network[key][index].debug

    await QQManager.setOB11Config(newConfig)

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const updateSingleConfig = async <T extends keyof OneBotConfig>(
    key: T,
    value: OneBotConfig[T]
  ) => {
    const newConfig = deepClone(config)

    newConfig[key] = value

    await QQManager.setOB11Config(newConfig)

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const updateConfig = async (newConfig: OneBotConfig) => {
    await QQManager.setOB11Config(newConfig)

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const refreshConfig = async () => {
    const newConfig = await QQManager.getOB11Config()

    if (JSON.stringify(newConfig) === JSON.stringify(config)) {
      return config
    }

    dispatch(storeUpdateConfig(newConfig))

    return newConfig
  }

  const mergeConfig = async (newConfig: OneBotConfig) => {
    const mergedConfig = deepClone(config)

    Object.assign(mergedConfig, newConfig)

    await QQManager.setOB11Config(mergedConfig)

    dispatch(storeUpdateConfig(mergedConfig))

    return mergedConfig
  }

  const saveConfigWithoutNetwork = async (newConfig: OneBotConfig) => {
    newConfig.network = config.network
    await QQManager.setOB11Config(newConfig)
    dispatch(storeUpdateConfig(newConfig))
    return newConfig
  }

  return {
    config,
    createNetworkConfig,
    refreshConfig,
    updateConfig,
    updateSingleConfig,
    updateNetworkConfig,
    deleteNetworkConfig,
    enableNetworkConfig,
    enableDebugNetworkConfig,
    mergeConfig,
    saveConfigWithoutNetwork
  }
}

export default useConfig
