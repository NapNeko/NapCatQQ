/**
 * @file URL工具
 */
import fs from 'node:fs'
import { isIP } from 'node:net'
import { randomBytes } from 'node:crypto'

type Protocol = 'http' | 'https'

let isDockerCached: boolean

function hasDockerEnv () {
    try {
        fs.statSync('/.dockerenv')
        return true
    } catch {
        return false
    }
}

function hasDockerCGroup () {
    try {
        return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker')
    } catch {
        return false
    }
}

const hasContainerEnv = () => {
    try {
        fs.statSync('/run/.containerenv')
        return true
    } catch {
        return false
    }
}

const isDocker = () => {
    if (isDockerCached === undefined) {
        isDockerCached = hasContainerEnv() || hasDockerEnv() || hasDockerCGroup()
    }

    return isDockerCached
}

/**
 * 获取默认host地址
 * @returns 根据环境返回合适的host地址
 * @example getDefaultHost() => '127.0.0.1' // 非Docker环境
 * @example getDefaultHost() => '0.0.0.0'   // Docker环境
 */
export const getDefaultHost = (): string => {
    return isDocker() ? '0.0.0.0' : '127.0.0.1'
}

/**
 * 将 host（主机地址） 转换为标准格式
 * @param host 主机地址
 * @returns 标准格式的IP地址
 * @example normalizeHost('10.0.3.2') => '10.0.3.2'
 * @example normalizeHost('0.0.0.0') => '127.0.0.1'
 * @example normalizeHost('2001:4860:4801:51::27') => '[2001:4860:4801:51::27]'
 */
export const normalizeHost = (host: string) => {
    if (isIP(host) === 6) return `[${host}]`
    return host
}

/**
 * 创建URL
 * @param host 主机地址
 * @param port 端口
 * @param path URL路径
 * @param search URL参数
 * @returns 完整URL
 * @example createUrl('127.0.0.1', '8080', '/api', { token: '123456' }) => 'http://127.0.0.1:8080/api?token=123456'
 * @example createUrl('baidu.com', '80', void 0, void 0, 'https') => 'https://baidu.com:80/'
 */
export const createUrl = (
    host: string,
    port: string,
    path = '/',
    search?: Record<string, any>,
    protocol: Protocol = 'http'
) => {
    const url = new URL(`${protocol}://${normalizeHost(host)}`)
    url.port = port
    url.pathname = path
    if (search) {
        for (const key in search) {
            url.searchParams.set(key, search[key])
        }
    }
    return url.toString()
}

/**
 * 生成随机Token
 * @param length Token长度 默认8
 * @returns 随机Token字符串
 * @example getRandomToken
 */
export const getRandomToken = (length = 8) => {
    return randomBytes(36).toString('hex').slice(0, length)
}
