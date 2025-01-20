// 代码来源 https://github.com/alex8088/electron-vite/blob/5ffd49eddc0d438e701672150e3881c8c9f47714/src/plugins/swc.ts
import { createRequire } from 'node:module'
import type { SourceMap } from 'rollup'
import type { TransformConfig, Output as TransformResult, JscConfig } from '@swc/core'
import type { Plugin, UserConfig, FilterPattern } from 'vite'
import { createFilter } from 'vite'

type SwcTransformResult = Omit<TransformResult, 'map'> & {
    map: SourceMap
}

type SwcTransformOptions = {
    sourcemap?: boolean | 'inline' | undefined
    minify?: boolean
} & TransformConfig

async function transformWithSWC(code: string, id: string, options: SwcTransformOptions): Promise<SwcTransformResult> {
    const { sourcemap = false, minify = false } = options

    delete options.sourcemap
    delete options.minify

    const isTs = /\.tsx?$/.test(id)

    const require = createRequire(import.meta.url)

    let swc: typeof import('@swc/core')

    try {
        swc = require('@swc/core')
    } catch {
        throw new Error('swc plugin require @swc/core, you need to install it.')
    }

    const jsc: JscConfig = {
        parser: {
            syntax: isTs ? 'typescript' : 'ecmascript',
            decorators: true
        },
        transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
            ...options
        },
        keepClassNames: true,
        target: 'es2022',
        minify: {
            format: {
                comments: false
            }
        }
    }

    const result = await swc.transform(code, {
        jsc,
        sourceMaps: sourcemap,
        minify,
        configFile: false,
        swcrc: false
    })

    const map: SourceMap = sourcemap && result.map ? JSON.parse(result.map) : { mappings: '' }

    return {
        code: result.code,
        map
    }
}

export type SwcOptions = {
    include?: FilterPattern
    exclude?: FilterPattern
    transformOptions?: TransformConfig
}

/**
 * Use SWC to support for emitting type metadata for decorators.
 * When using `swcPlugin`, you need to install `@swc/core`.
 */
export function swcPlugin(options: SwcOptions = {}): Plugin {
    const filter = createFilter(options.include || /\.(m?ts|[jt]sx)$/, options.exclude || /\.js$/)
    let sourcemap: boolean | 'inline' = false
    let minify: boolean | 'esbuild' | 'terser' = false
    return {
        name: 'vite:swc',
        config(): UserConfig {
            return {
                esbuild: false
            }
        },
        async configResolved(resolvedConfig): Promise<void> {
            sourcemap = resolvedConfig.build?.sourcemap === 'inline' ? 'inline' : !!resolvedConfig.build?.sourcemap
            minify = resolvedConfig.build?.minify
        },
        async transform(code, id): Promise<void | { code: string; map: SourceMap }> {
            if (filter(id)) {
                const result = await transformWithSWC(code, id, { sourcemap, ...(options.transformOptions || {}) })
                return {
                    code: result.code,
                    map: result.map
                }
            }
        },
        async renderChunk(code, chunk): Promise<null | { code: string; map: SourceMap }> {
            if (!minify || minify === 'terser') {
                return null
            }
            const result = await transformWithSWC(code, chunk.fileName, {
                sourcemap,
                minify: true,
                ...(options.transformOptions || {})
            })
            return {
                code: result.code,
                map: result.map
            }
        }
    }
}