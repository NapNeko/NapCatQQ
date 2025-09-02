import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import { NapCatOneBot11Adapter, OB11Message } from '@/onebot';
import { NapCatCore } from '@/core';
import { PluginConfig } from '../config/config';
import { ActionMap } from '../action';
import { IOB11NetworkAdapter } from '@/onebot/network/adapter';
import fs from 'fs';
import path from 'path';

export interface PluginPackageJson {
    name?: string;
    version?: string;
    main?: string;
}

export interface PluginModule<T extends OB11EmitEventContent = OB11EmitEventContent> {
    plugin_init: (core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap, instance: OB11PluginMangerAdapter) => void | Promise<void>;
    plugin_onmessage?: (adapter: string, core: NapCatCore, obCtx: NapCatOneBot11Adapter, event: OB11Message, actions: ActionMap, instance: OB11PluginMangerAdapter) => void | Promise<void>;
    plugin_onevent?: (adapter: string, core: NapCatCore, obCtx: NapCatOneBot11Adapter, event: T, actions: ActionMap, instance: OB11PluginMangerAdapter) => void | Promise<void>;
    plugin_cleanup?: (core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap, instance: OB11PluginMangerAdapter) => void | Promise<void>;
}

export interface LoadedPlugin {
    name: string;
    version?: string;
    pluginPath: string;
    entryPath: string;
    packageJson?: PluginPackageJson;
    module: PluginModule;
}

export class OB11PluginMangerAdapter extends IOB11NetworkAdapter<PluginConfig> {
    private readonly pluginPath: string;
    private loadedPlugins: Map<string, LoadedPlugin> = new Map();
    declare config: PluginConfig;
    constructor(
        name: string, core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap
    ) {
        const config = {
            name: name,
            messagePostFormat: 'array',
            reportSelfMessage: true,
            enable: true,
            debug: true,
        };
        super(name, config, core, obContext, actions);
        this.pluginPath = this.core.context.pathWrapper.pluginPath;
    }

    /**
     * 扫描并加载插件
     */
    private async loadPlugins(): Promise<void> {
        try {
            // 确保插件目录存在
            if (!fs.existsSync(this.pluginPath)) {
                this.logger.logWarn(`[Plugin Adapter] Plugin directory does not exist: ${this.pluginPath}`);
                fs.mkdirSync(this.pluginPath, { recursive: true });
                return;
            }

            const items = fs.readdirSync(this.pluginPath, { withFileTypes: true });

            // 扫描文件和目录
            for (const item of items) {
                if (item.isFile()) {
                    // 处理单文件插件
                    await this.loadFilePlugin(item.name);
                } else if (item.isDirectory()) {
                    // 处理目录插件
                    await this.loadDirectoryPlugin(item.name);
                }
            }

            this.logger.log(`[Plugin Adapter] Loaded ${this.loadedPlugins.size} plugins`);
        } catch (error) {
            this.logger.logError(`[Plugin Adapter] Error loading plugins:`, error);
        }
    }

    /**
     * 加载单文件插件 (.mjs, .js)
     */
    private async loadFilePlugin(filename: string): Promise<void> {
        // 只处理支持的文件类型
        if (!this.isSupportedFile(filename)) {
            return;
        }

        const filePath = path.join(this.pluginPath, filename);
        const pluginName = path.parse(filename).name;

        try {
            const module = await this.importModule(filePath);
            if (!this.isValidPluginModule(module)) {
                this.logger.logWarn(`[Plugin Adapter] File ${filename} is not a valid plugin (missing plugin methods)`);
                return;
            }

            const plugin: LoadedPlugin = {
                name: pluginName,
                pluginPath: this.pluginPath,
                entryPath: filePath,
                module: module
            };

            await this.registerPlugin(plugin);
        } catch (error) {
            this.logger.logError(`[Plugin Adapter] Error loading file plugin ${filename}:`, error);
        }
    }

    /**
     * 加载目录插件
     */
    private async loadDirectoryPlugin(dirname: string): Promise<void> {
        const pluginDir = path.join(this.pluginPath, dirname);

        try {
            // 尝试读取 package.json
            let packageJson: PluginPackageJson | undefined;
            const packageJsonPath = path.join(pluginDir, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                try {
                    const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');
                    packageJson = JSON.parse(packageContent);
                } catch (error) {
                    this.logger.logWarn(`[Plugin Adapter] Invalid package.json in ${dirname}:`, error);
                }
            }

            // 确定入口文件
            const entryFile = this.findEntryFile(pluginDir, packageJson);
            if (!entryFile) {
                this.logger.logWarn(`[Plugin Adapter] No valid entry file found for plugin directory: ${dirname}`);
                return;
            }

            const entryPath = path.join(pluginDir, entryFile);
            const module = await this.importModule(entryPath);

            if (!this.isValidPluginModule(module)) {
                this.logger.logWarn(`[Plugin Adapter] Directory ${dirname} does not contain a valid plugin`);
                return;
            }

            const plugin: LoadedPlugin = {
                name: packageJson?.name || dirname,
                version: packageJson?.version,
                pluginPath: pluginDir,
                entryPath: entryPath,
                packageJson: packageJson,
                module: module
            };

            await this.registerPlugin(plugin);
        } catch (error) {
            this.logger.logError(`[Plugin Adapter] Error loading directory plugin ${dirname}:`, error);
        }
    }

    /**
     * 查找插件目录的入口文件
     */
    private findEntryFile(pluginDir: string, packageJson?: PluginPackageJson): string | null {
        // 优先级：package.json main > 默认文件名
        const possibleEntries = [
            packageJson?.main,
            'index.mjs',
            'index.js',
            'main.mjs',
            'main.js'
        ].filter(Boolean) as string[];

        for (const entry of possibleEntries) {
            const entryPath = path.join(pluginDir, entry);
            if (fs.existsSync(entryPath) && fs.statSync(entryPath).isFile()) {
                return entry;
            }
        }

        return null;
    }

    /**
     * 检查是否为支持的文件类型
     */
    private isSupportedFile(filename: string): boolean {
        const ext = path.extname(filename).toLowerCase();
        return ['.mjs', '.js'].includes(ext);
    }

    /**
     * 动态导入模块
     */
    private async importModule(filePath: string): Promise<any> {
        const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
        return await import(fileUrl);
    }

    /**
     * 检查模块是否为有效的插件模块
     */
    private isValidPluginModule(module: any): module is PluginModule {
        return module && typeof module.plugin_init === 'function';
    }

    /**
     * 注册插件
     */
    private async registerPlugin(plugin: LoadedPlugin): Promise<void> {
        // 检查名称冲突
        if (this.loadedPlugins.has(plugin.name)) {
            this.logger.logWarn(`[Plugin Adapter] Plugin name conflict: ${plugin.name}, skipping...`);
            return;
        }

        this.loadedPlugins.set(plugin.name, plugin);
        this.logger.log(`[Plugin Adapter] Registered plugin: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ''}`);

        // 调用插件初始化方法（必须存在）
        try {
            await plugin.module.plugin_init(this.core, this.obContext, this.actions, this);
            this.logger.log(`[Plugin Adapter] Initialized plugin: ${plugin.name}`);
        } catch (error) {
            this.logger.logError(`[Plugin Adapter] Error initializing plugin ${plugin.name}:`, error);
        }
    }

    /**
     * 卸载插件
     */
    private async unloadPlugin(pluginName: string): Promise<void> {
        const plugin = this.loadedPlugins.get(pluginName);
        if (!plugin) {
            return;
        }

        // 调用插件清理方法
        if (typeof plugin.module.plugin_cleanup === 'function') {
            try {
                await plugin.module.plugin_cleanup(this.core, this.obContext, this.actions, this);
                this.logger.log(`[Plugin Adapter] Cleaned up plugin: ${pluginName}`);
            } catch (error) {
                this.logger.logError(`[Plugin Adapter] Error cleaning up plugin ${pluginName}:`, error);
            }
        }

        this.loadedPlugins.delete(pluginName);
        this.logger.log(`[Plugin Adapter] Unloaded plugin: ${pluginName}`);
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        if (!this.isEnable) {
            return;
        }

        // 遍历所有已加载的插件，调用它们的事件处理方法
        for (const [, plugin] of this.loadedPlugins) {
            this.callPluginEventHandler(plugin, event);
        }
    }

    /**
     * 调用插件的事件处理方法
     */
    private async callPluginEventHandler(plugin: LoadedPlugin, event: OB11EmitEventContent): Promise<void> {
        try {
            // 优先使用 plugin_onevent 方法
            if (typeof plugin.module.plugin_onevent === 'function') {
                await plugin.module.plugin_onevent(this.name, this.core, this.obContext, event, this.actions, this);
            }

            // 如果是消息事件并且插件有 plugin_onmessage 方法，也调用
            if ((event as any).message_type && typeof plugin.module.plugin_onmessage === 'function') {
                await plugin.module.plugin_onmessage(this.name, this.core, this.obContext, event as OB11Message, this.actions, this);
            }
        } catch (error) {
            this.logger.logError(`[Plugin Adapter] Error calling plugin ${plugin.name} event handler:`, error);
        }
    }

    async open() {
        if (this.isEnable) {
            return;
        }

        this.logger.log('[Plugin Adapter] Opening plugin adapter...');
        this.isEnable = true;

        // 加载所有插件
        await this.loadPlugins();

        this.logger.log(`[Plugin Adapter] Plugin adapter opened with ${this.loadedPlugins.size} plugins loaded`);
    }

    async close() {
        if (!this.isEnable) {
            return;
        }

        this.logger.log('[Plugin Adapter] Closing plugin adapter...');
        this.isEnable = false;

        // 卸载所有插件
        const pluginNames = Array.from(this.loadedPlugins.keys());
        for (const pluginName of pluginNames) {
            await this.unloadPlugin(pluginName);
        }

        this.logger.log('[Plugin Adapter] Plugin adapter closed');
    }

    async reload() {
        this.logger.log('[Plugin Adapter] Reloading plugin adapter...');

        // 先关闭然后重新打开
        await this.close();
        await this.open();

        this.logger.log('[Plugin Adapter] Plugin adapter reloaded');
        return OB11NetworkReloadType.Normal;
    }

    /**
     * 获取已加载的插件列表
     */
    public getLoadedPlugins(): LoadedPlugin[] {
        return Array.from(this.loadedPlugins.values());
    }

    /**
     * 获取插件信息
     */
    public getPluginInfo(pluginName: string): LoadedPlugin | undefined {
        return this.loadedPlugins.get(pluginName);
    }

    /**
     * 重载指定插件
     */
    public async reloadPlugin(pluginName: string): Promise<boolean> {
        const plugin = this.loadedPlugins.get(pluginName);
        if (!plugin) {
            this.logger.logWarn(`[Plugin Adapter] Plugin ${pluginName} not found`);
            return false;
        }

        try {
            // 卸载插件
            await this.unloadPlugin(pluginName);

            // 重新加载插件
            const isDirectory = fs.statSync(plugin.pluginPath).isDirectory() &&
                plugin.pluginPath !== this.pluginPath;

            if (isDirectory) {
                const dirname = path.basename(plugin.pluginPath);
                await this.loadDirectoryPlugin(dirname);
            } else {
                const filename = path.basename(plugin.entryPath);
                await this.loadFilePlugin(filename);
            }

            this.logger.log(`[Plugin Adapter] Plugin ${pluginName} reloaded successfully`);
            return true;
        } catch (error) {
            this.logger.logError(`[Plugin Adapter] Error reloading plugin ${pluginName}:`, error);
            return false;
        }
    }
}
