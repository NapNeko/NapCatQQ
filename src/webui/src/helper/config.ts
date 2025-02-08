import { webUiPathWrapper } from '@/webui';
import { Type, Static } from '@sinclair/typebox';
import Ajv from 'ajv';
import fs, { constants } from 'node:fs/promises';

import { resolve } from 'node:path';

// 限制尝试端口的次数，避免死循环

// 定义配置的类型
const WebUiConfigSchema = Type.Object({
    host: Type.String({ default: '0.0.0.0' }),
    port: Type.Number({ default: 6099 }),
    token: Type.String({ default: 'napcat' }),
    loginRate: Type.Number({ default: 10 }),
    autoLoginAccount: Type.String({ default: '' }),
    theme: Type.Object({
        dark: Type.Object({
            '--heroui-background': Type.String({ default: '0 0% 0%' }),
            '--heroui-foreground-50': Type.String({ default: '240 5.88% 10%' }),
            '--heroui-foreground-100': Type.String({ default: '240 3.7% 15.88%' }),
            '--heroui-foreground-200': Type.String({ default: '240 5.26% 26.08%' }),
            '--heroui-foreground-300': Type.String({ default: '240 5.2% 33.92%' }),
            '--heroui-foreground-400': Type.String({ default: '240 3.83% 46.08%' }),
            '--heroui-foreground-500': Type.String({ default: '240 5.03% 64.9%' }),
            '--heroui-foreground-600': Type.String({ default: '240 4.88% 83.92%' }),
            '--heroui-foreground-700': Type.String({ default: '240 5.88% 90%' }),
            '--heroui-foreground-800': Type.String({ default: '240 4.76% 95.88%' }),
            '--heroui-foreground-900': Type.String({ default: '0 0% 98.04%' }),
            '--heroui-foreground': Type.String({ default: '210 5.56% 92.94%' }),
            '--heroui-focus': Type.String({ default: '212.01999999999998 100% 46.67%' }),
            '--heroui-overlay': Type.String({ default: '0 0% 0%' }),
            '--heroui-divider': Type.String({ default: '0 0% 100%' }),
            '--heroui-divider-opacity': Type.String({ default: '0.15' }),
            '--heroui-content1': Type.String({ default: '240 5.88% 10%' }),
            '--heroui-content1-foreground': Type.String({ default: '0 0% 98.04%' }),
            '--heroui-content2': Type.String({ default: '240 3.7% 15.88%' }),
            '--heroui-content2-foreground': Type.String({ default: '240 4.76% 95.88%' }),
            '--heroui-content3': Type.String({ default: '240 5.26% 26.08%' }),
            '--heroui-content3-foreground': Type.String({ default: '240 5.88% 90%' }),
            '--heroui-content4': Type.String({ default: '240 5.2% 33.92%' }),
            '--heroui-content4-foreground': Type.String({ default: '240 4.88% 83.92%' }),
            '--heroui-default-50': Type.String({ default: '240 5.88% 10%' }),
            '--heroui-default-100': Type.String({ default: '240 3.7% 15.88%' }),
            '--heroui-default-200': Type.String({ default: '240 5.26% 26.08%' }),
            '--heroui-default-300': Type.String({ default: '240 5.2% 33.92%' }),
            '--heroui-default-400': Type.String({ default: '240 3.83% 46.08%' }),
            '--heroui-default-500': Type.String({ default: '240 5.03% 64.9%' }),
            '--heroui-default-600': Type.String({ default: '240 4.88% 83.92%' }),
            '--heroui-default-700': Type.String({ default: '240 5.88% 90%' }),
            '--heroui-default-800': Type.String({ default: '240 4.76% 95.88%' }),
            '--heroui-default-900': Type.String({ default: '0 0% 98.04%' }),
            '--heroui-default-foreground': Type.String({ default: '0 0% 100%' }),
            '--heroui-default': Type.String({ default: '240 5.26% 26.08%' }),
            '--heroui-danger-50': Type.String({ default: '301.89 82.61% 22.55%' }),
            '--heroui-danger-100': Type.String({ default: '308.18 76.39% 28.24%' }),
            '--heroui-danger-200': Type.String({ default: '313.85 70.65% 36.08%' }),
            '--heroui-danger-300': Type.String({ default: '319.73 65.64% 44.51%' }),
            '--heroui-danger-400': Type.String({ default: '325.82 69.62% 53.53%' }),
            '--heroui-danger-500': Type.String({ default: '331.82 75% 65.49%' }),
            '--heroui-danger-600': Type.String({ default: '337.84 83.46% 73.92%' }),
            '--heroui-danger-700': Type.String({ default: '343.42 90.48% 83.53%' }),
            '--heroui-danger-800': Type.String({ default: '350.53 90.48% 91.76%' }),
            '--heroui-danger-900': Type.String({ default: '324 90.91% 95.69%' }),
            '--heroui-danger-foreground': Type.String({ default: '0 0% 100%' }),
            '--heroui-danger': Type.String({ default: '325.82 69.62% 53.53%' }),
            '--heroui-primary-50': Type.String({ default: '340 84.91% 10.39%' }),
            '--heroui-primary-100': Type.String({ default: '339.33 86.54% 20.39%' }),
            '--heroui-primary-200': Type.String({ default: '339.11 85.99% 30.78%' }),
            '--heroui-primary-300': Type.String({ default: '339 86.54% 40.78%' }),
            '--heroui-primary-400': Type.String({ default: '339.2 90.36% 51.18%' }),
            '--heroui-primary-500': Type.String({ default: '339 90% 60.78%' }),
            '--heroui-primary-600': Type.String({ default: '339.11 90.6% 70.78%' }),
            '--heroui-primary-700': Type.String({ default: '339.33 90% 80.39%' }),
            '--heroui-primary-800': Type.String({ default: '340 91.84% 90.39%' }),
            '--heroui-primary-900': Type.String({ default: '339.13 92% 95.1%' }),
            '--heroui-primary-foreground': Type.String({ default: '0 0% 100%' }),
            '--heroui-primary': Type.String({ default: '339.2 90.36% 51.18%' }),
            // 新增 secondary
            '--heroui-secondary-50': Type.String({ default: '270 66.67% 9.41%' }),
            '--heroui-secondary-100': Type.String({ default: '270 66.67% 18.82%' }),
            '--heroui-secondary-200': Type.String({ default: '270 66.67% 28.24%' }),
            '--heroui-secondary-300': Type.String({ default: '270 66.67% 37.65%' }),
            '--heroui-secondary-400': Type.String({ default: '270 66.67% 47.06%' }),
            '--heroui-secondary-500': Type.String({ default: '270 59.26% 57.65%' }),
            '--heroui-secondary-600': Type.String({ default: '270 59.26% 68.24%' }),
            '--heroui-secondary-700': Type.String({ default: '270 59.26% 78.82%' }),
            '--heroui-secondary-800': Type.String({ default: '270 59.26% 89.41%' }),
            '--heroui-secondary-900': Type.String({ default: '270 61.54% 94.9%' }),
            '--heroui-secondary-foreground': Type.String({ default: '0 0% 100%' }),
            '--heroui-secondary': Type.String({ default: '270 59.26% 57.65%' }),
            // 新增 success
            '--heroui-success-50': Type.String({ default: '145.71 77.78% 8.82%' }),
            '--heroui-success-100': Type.String({ default: '146.2 79.78% 17.45%' }),
            '--heroui-success-200': Type.String({ default: '145.79 79.26% 26.47%' }),
            '--heroui-success-300': Type.String({ default: '146.01 79.89% 35.1%' }),
            '--heroui-success-400': Type.String({ default: '145.96 79.46% 43.92%' }),
            '--heroui-success-500': Type.String({ default: '146.01 62.45% 55.1%' }),
            '--heroui-success-600': Type.String({ default: '145.79 62.57% 66.47%' }),
            '--heroui-success-700': Type.String({ default: '146.2 61.74% 77.45%' }),
            '--heroui-success-800': Type.String({ default: '145.71 61.4% 88.82%' }),
            '--heroui-success-900': Type.String({ default: '146.67 64.29% 94.51%' }),
            '--heroui-success-foreground': Type.String({ default: '0 0% 0%' }),
            '--heroui-success': Type.String({ default: '145.96 79.46% 43.92%' }),
            // 新增 warning
            '--heroui-warning-50': Type.String({ default: '37.14 75% 10.98%' }),
            '--heroui-warning-100': Type.String({ default: '37.14 75% 21.96%' }),
            '--heroui-warning-200': Type.String({ default: '36.96 73.96% 33.14%' }),
            '--heroui-warning-300': Type.String({ default: '37.01 74.22% 44.12%' }),
            '--heroui-warning-400': Type.String({ default: '37.03 91.27% 55.1%' }),
            '--heroui-warning-500': Type.String({ default: '37.01 91.26% 64.12%' }),
            '--heroui-warning-600': Type.String({ default: '36.96 91.24% 73.14%' }),
            '--heroui-warning-700': Type.String({ default: '37.14 91.3% 81.96%' }),
            '--heroui-warning-800': Type.String({ default: '37.14 91.3% 90.98%' }),
            '--heroui-warning-900': Type.String({ default: '54.55 91.67% 95.29%' }),
            '--heroui-warning-foreground': Type.String({ default: '0 0% 0%' }),
            '--heroui-warning': Type.String({ default: '37.03 91.27% 55.1%' }),
            // 其它配置
            '--heroui-code-background': Type.String({ default: '240 5.56% 7.06%' }),
            '--heroui-strong': Type.String({ default: '190.14 94.67% 44.12%' }),
            '--heroui-code-mdx': Type.String({ default: '190.14 94.67% 44.12%' }),
            '--heroui-divider-weight': Type.String({ default: '1px' }),
            '--heroui-disabled-opacity': Type.String({ default: '.5' }),
            '--heroui-font-size-tiny': Type.String({ default: '0.75rem' }),
            '--heroui-font-size-small': Type.String({ default: '0.875rem' }),
            '--heroui-font-size-medium': Type.String({ default: '1rem' }),
            '--heroui-font-size-large': Type.String({ default: '1.125rem' }),
            '--heroui-line-height-tiny': Type.String({ default: '1rem' }),
            '--heroui-line-height-small': Type.String({ default: '1.25rem' }),
            '--heroui-line-height-medium': Type.String({ default: '1.5rem' }),
            '--heroui-line-height-large': Type.String({ default: '1.75rem' }),
            '--heroui-radius-small': Type.String({ default: '8px' }),
            '--heroui-radius-medium': Type.String({ default: '12px' }),
            '--heroui-radius-large': Type.String({ default: '14px' }),
            '--heroui-border-width-small': Type.String({ default: '1px' }),
            '--heroui-border-width-medium': Type.String({ default: '2px' }),
            '--heroui-border-width-large': Type.String({ default: '3px' }),
            '--heroui-box-shadow-small': Type.String({
                default:
                    '0px 0px 5px 0px rgba(0, 0, 0, .05), 0px 2px 10px 0px rgba(0, 0, 0, .2), inset 0px 0px 1px 0px hsla(0, 0%, 100%, .15)',
            }),
            '--heroui-box-shadow-medium': Type.String({
                default:
                    '0px 0px 15px 0px rgba(0, 0, 0, .06), 0px 2px 30px 0px rgba(0, 0, 0, .22), inset 0px 0px 1px 0px hsla(0, 0%, 100%, .15)',
            }),
            '--heroui-box-shadow-large': Type.String({
                default:
                    '0px 0px 30px 0px rgba(0, 0, 0, .07), 0px 30px 60px 0px rgba(0, 0, 0, .26), inset 0px 0px 1px 0px hsla(0, 0%, 100%, .15)',
            }),
            '--heroui-hover-opacity': Type.String({ default: '.9' }),
        }, { default: {} }),
        light: Type.Object({
            '--heroui-background': Type.String({ default: '0 0% 100%' }),
            '--heroui-foreground-50': Type.String({ default: '240 5.88% 95%' }),
            '--heroui-foreground-100': Type.String({ default: '240 3.7% 90%' }),
            '--heroui-foreground-200': Type.String({ default: '240 5.26% 80%' }),
            '--heroui-foreground-300': Type.String({ default: '240 5.2% 70%' }),
            '--heroui-foreground-400': Type.String({ default: '240 3.83% 60%' }),
            '--heroui-foreground-500': Type.String({ default: '240 5.03% 50%' }),
            '--heroui-foreground-600': Type.String({ default: '240 4.88% 40%' }),
            '--heroui-foreground-700': Type.String({ default: '240 5.88% 30%' }),
            '--heroui-foreground-800': Type.String({ default: '240 4.76% 20%' }),
            '--heroui-foreground-900': Type.String({ default: '0 0% 10%' }),
            '--heroui-foreground': Type.String({ default: '210 5.56% 7.06%' }),
            '--heroui-focus': Type.String({ default: '212.01999999999998 100% 53.33%' }),
            '--heroui-overlay': Type.String({ default: '0 0% 100%' }),
            '--heroui-divider': Type.String({ default: '0 0% 0%' }),
            '--heroui-divider-opacity': Type.String({ default: '0.85' }),
            '--heroui-content1': Type.String({ default: '240 5.88% 95%' }),
            '--heroui-content1-foreground': Type.String({ default: '0 0% 10%' }),
            '--heroui-content2': Type.String({ default: '240 3.7% 90%' }),
            '--heroui-content2-foreground': Type.String({ default: '240 4.76% 20%' }),
            '--heroui-content3': Type.String({ default: '240 5.26% 80%' }),
            '--heroui-content3-foreground': Type.String({ default: '240 5.88% 30%' }),
            '--heroui-content4': Type.String({ default: '240 5.2% 70%' }),
            '--heroui-content4-foreground': Type.String({ default: '240 4.88% 40%' }),
            '--heroui-default-50': Type.String({ default: '240 5.88% 95%' }),
            '--heroui-default-100': Type.String({ default: '240 3.7% 90%' }),
            '--heroui-default-200': Type.String({ default: '240 5.26% 80%' }),
            '--heroui-default-300': Type.String({ default: '240 5.2% 70%' }),
            '--heroui-default-400': Type.String({ default: '240 3.83% 60%' }),
            '--heroui-default-500': Type.String({ default: '240 5.03% 50%' }),
            '--heroui-default-600': Type.String({ default: '240 4.88% 40%' }),
            '--heroui-default-700': Type.String({ default: '240 5.88% 30%' }),
            '--heroui-default-800': Type.String({ default: '240 4.76% 20%' }),
            '--heroui-default-900': Type.String({ default: '0 0% 10%' }),
            '--heroui-default-foreground': Type.String({ default: '0 0% 0%' }),
            '--heroui-default': Type.String({ default: '240 5.26% 80%' }),
            '--heroui-danger-50': Type.String({ default: '324 90.91% 95.69%' }),
            '--heroui-danger-100': Type.String({ default: '350.53 90.48% 91.76%' }),
            '--heroui-danger-200': Type.String({ default: '343.42 90.48% 83.53%' }),
            '--heroui-danger-300': Type.String({ default: '337.84 83.46% 73.92%' }),
            '--heroui-danger-400': Type.String({ default: '331.82 75% 65.49%' }),
            '--heroui-danger-500': Type.String({ default: '325.82 69.62% 53.53%' }),
            '--heroui-danger-600': Type.String({ default: '319.73 65.64% 44.51%' }),
            '--heroui-danger-700': Type.String({ default: '313.85 70.65% 36.08%' }),
            '--heroui-danger-800': Type.String({ default: '308.18 76.39% 28.24%' }),
            '--heroui-danger-900': Type.String({ default: '301.89 82.61% 22.55%' }),
            '--heroui-danger-foreground': Type.String({ default: '0 0% 100%' }),
            '--heroui-danger': Type.String({ default: '325.82 69.62% 53.53%' }),
            '--heroui-primary-50': Type.String({ default: '339.13 92% 95.1%' }),
            '--heroui-primary-100': Type.String({ default: '340 91.84% 90.39%' }),
            '--heroui-primary-200': Type.String({ default: '339.33 90% 80.39%' }),
            '--heroui-primary-300': Type.String({ default: '339.11 90.6% 70.78%' }),
            '--heroui-primary-400': Type.String({ default: '339 90% 60.78%' }),
            '--heroui-primary-500': Type.String({ default: '339.2 90.36% 51.18%' }),
            '--heroui-primary-600': Type.String({ default: '339 86.54% 40.78%' }),
            '--heroui-primary-700': Type.String({ default: '339.11 85.99% 30.78%' }),
            '--heroui-primary-800': Type.String({ default: '339.33 86.54% 20.39%' }),
            '--heroui-primary-900': Type.String({ default: '340 84.91% 10.39%' }),
            '--heroui-primary-foreground': Type.String({ default: '0 0% 100%' }),
            '--heroui-primary': Type.String({ default: '339.2 90.36% 51.18%' }),
            // 新增 secondary
            '--heroui-secondary-50': Type.String({ default: '270 61.54% 94.9%' }),
            '--heroui-secondary-100': Type.String({ default: '270 59.26% 89.41%' }),
            '--heroui-secondary-200': Type.String({ default: '270 59.26% 78.82%' }),
            '--heroui-secondary-300': Type.String({ default: '270 59.26% 68.24%' }),
            '--heroui-secondary-400': Type.String({ default: '270 59.26% 57.65%' }),
            '--heroui-secondary-500': Type.String({ default: '270 66.67% 47.06%' }),
            '--heroui-secondary-600': Type.String({ default: '270 66.67% 37.65%' }),
            '--heroui-secondary-700': Type.String({ default: '270 66.67% 28.24%' }),
            '--heroui-secondary-800': Type.String({ default: '270 66.67% 18.82%' }),
            '--heroui-secondary-900': Type.String({ default: '270 66.67% 9.41%' }),
            '--heroui-secondary-foreground': Type.String({ default: '0 0% 100%' }),
            '--heroui-secondary': Type.String({ default: '270 66.67% 47.06%' }),
            // 新增 success
            '--heroui-success-50': Type.String({ default: '146.67 64.29% 94.51%' }),
            '--heroui-success-100': Type.String({ default: '145.71 61.4% 88.82%' }),
            '--heroui-success-200': Type.String({ default: '146.2 61.74% 77.45%' }),
            '--heroui-success-300': Type.String({ default: '145.79 62.57% 66.47%' }),
            '--heroui-success-400': Type.String({ default: '146.01 62.45% 55.1%' }),
            '--heroui-success-500': Type.String({ default: '145.96 79.46% 43.92%' }),
            '--heroui-success-600': Type.String({ default: '146.01 79.89% 35.1%' }),
            '--heroui-success-700': Type.String({ default: '145.79 79.26% 26.47%' }),
            '--heroui-success-800': Type.String({ default: '146.2 79.78% 17.45%' }),
            '--heroui-success-900': Type.String({ default: '145.71 77.78% 8.82%' }),
            '--heroui-success-foreground': Type.String({ default: '0 0% 0%' }),
            '--heroui-success': Type.String({ default: '145.96 79.46% 43.92%' }),
            // 新增 warning
            '--heroui-warning-50': Type.String({ default: '54.55 91.67% 95.29%' }),
            '--heroui-warning-100': Type.String({ default: '37.14 91.3% 90.98%' }),
            '--heroui-warning-200': Type.String({ default: '37.14 91.3% 81.96%' }),
            '--heroui-warning-300': Type.String({ default: '36.96 91.24% 73.14%' }),
            '--heroui-warning-400': Type.String({ default: '37.01 91.26% 64.12%' }),
            '--heroui-warning-500': Type.String({ default: '37.03 91.27% 55.1%' }),
            '--heroui-warning-600': Type.String({ default: '37.01 74.22% 44.12%' }),
            '--heroui-warning-700': Type.String({ default: '36.96 73.96% 33.14%' }),
            '--heroui-warning-800': Type.String({ default: '37.14 75% 21.96%' }),
            '--heroui-warning-900': Type.String({ default: '37.14 75% 10.98%' }),
            '--heroui-warning-foreground': Type.String({ default: '0 0% 0%' }),
            '--heroui-warning': Type.String({ default: '37.03 91.27% 55.1%' }),
            // 其它配置
            '--heroui-code-background': Type.String({ default: '221.25 17.39% 18.04%' }),
            '--heroui-strong': Type.String({ default: '316.95 100% 65.29%' }),
            '--heroui-code-mdx': Type.String({ default: '316.95 100% 65.29%' }),
            '--heroui-divider-weight': Type.String({ default: '1px' }),
            '--heroui-disabled-opacity': Type.String({ default: '.5' }),
            '--heroui-font-size-tiny': Type.String({ default: '0.75rem' }),
            '--heroui-font-size-small': Type.String({ default: '0.875rem' }),
            '--heroui-font-size-medium': Type.String({ default: '1rem' }),
            '--heroui-font-size-large': Type.String({ default: '1.125rem' }),
            '--heroui-line-height-tiny': Type.String({ default: '1rem' }),
            '--heroui-line-height-small': Type.String({ default: '1.25rem' }),
            '--heroui-line-height-medium': Type.String({ default: '1.5rem' }),
            '--heroui-line-height-large': Type.String({ default: '1.75rem' }),
            '--heroui-radius-small': Type.String({ default: '8px' }),
            '--heroui-radius-medium': Type.String({ default: '12px' }),
            '--heroui-radius-large': Type.String({ default: '14px' }),
            '--heroui-border-width-small': Type.String({ default: '1px' }),
            '--heroui-border-width-medium': Type.String({ default: '2px' }),
            '--heroui-border-width-large': Type.String({ default: '3px' }),
            '--heroui-box-shadow-small': Type.String({
                default:
                    '0px 0px 5px 0px rgba(0, 0, 0, .02), 0px 2px 10px 0px rgba(0, 0, 0, .06), 0px 0px 1px 0px rgba(0, 0, 0, .3)',
            }),
            '--heroui-box-shadow-medium': Type.String({
                default:
                    '0px 0px 15px 0px rgba(0, 0, 0, .03), 0px 2px 30px 0px rgba(0, 0, 0, .08), 0px 0px 1px 0px rgba(0, 0, 0, .3)',
            }),
            '--heroui-box-shadow-large': Type.String({
                default:
                    '0px 0px 30px 0px rgba(0, 0, 0, .04), 0px 30px 60px 0px rgba(0, 0, 0, .12), 0px 0px 1px 0px rgba(0, 0, 0, .3)',
            }),
            '--heroui-hover-opacity': Type.String({ default: '.8' }),
        }, { default: {} }),
    }, { default: {} }),
});

export type WebUiConfigType = Static<typeof WebUiConfigSchema>;

// 读取当前目录下名为 webui.json 的配置文件，如果不存在则创建初始化配置文件
export class WebUiConfigWrapper {
    WebUiConfigData: WebUiConfigType | undefined = undefined;

    private validateAndApplyDefaults(config: Partial<WebUiConfigType>): WebUiConfigType {
        new Ajv({ coerceTypes: true, useDefaults: true }).compile(WebUiConfigSchema)(config);
        return config as WebUiConfigType;
    }

    private async ensureConfigFileExists(configPath: string): Promise<void> {
        const configExists = await fs
            .access(configPath, constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (!configExists) {
            await fs.writeFile(configPath, JSON.stringify(this.validateAndApplyDefaults({}), null, 4));
        }
    }

    private async readAndValidateConfig(configPath: string): Promise<WebUiConfigType> {
        const fileContent = await fs.readFile(configPath, 'utf-8');
        return this.validateAndApplyDefaults(JSON.parse(fileContent));
    }

    private async writeConfig(configPath: string, config: WebUiConfigType): Promise<void> {
        const hasWritePermission = await fs
            .access(configPath, constants.W_OK)
            .then(() => true)
            .catch(() => false);
        if (hasWritePermission) {
            await fs.writeFile(configPath, JSON.stringify(config, null, 4));
        } else {
            console.warn(`文件: ${configPath} 没有写入权限, 配置的更改部分可能会在重启后还原.`);
        }
    }

    async GetWebUIConfig(): Promise<WebUiConfigType> {
        if (this.WebUiConfigData) {
            return this.WebUiConfigData;
        }
        try {
            const configPath = resolve(webUiPathWrapper.configPath, './webui.json');
            await this.ensureConfigFileExists(configPath);
            const parsedConfig = await this.readAndValidateConfig(configPath);
            this.WebUiConfigData = parsedConfig;
            return this.WebUiConfigData;
        } catch (e) {
            console.log('读取配置文件失败', e);
            return this.validateAndApplyDefaults({});
        }
    }

    async UpdateWebUIConfig(newConfig: Partial<WebUiConfigType>): Promise<void> {
        const configPath = resolve(webUiPathWrapper.configPath, './webui.json');
        const currentConfig = await this.GetWebUIConfig();
        const updatedConfig = this.validateAndApplyDefaults({ ...currentConfig, ...newConfig });
        await this.writeConfig(configPath, updatedConfig);
        this.WebUiConfigData = updatedConfig;
    }

    async UpdateToken(oldToken: string, newToken: string): Promise<void> {
        const currentConfig = await this.GetWebUIConfig();
        if (currentConfig.token !== oldToken) {
            throw new Error('旧 token 不匹配');
        }
        await this.UpdateWebUIConfig({ token: newToken });
    }

    // 获取日志文件夹路径
    async GetLogsPath(): Promise<string> {
        return resolve(webUiPathWrapper.logsPath);
    }

    // 获取日志列表
    async GetLogsList(): Promise<string[]> {
        const logsPath = resolve(webUiPathWrapper.logsPath);
        const logsExist = await fs
            .access(logsPath, constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (logsExist) {
            return (await fs.readdir(logsPath))
                .filter((file) => file.endsWith('.log'))
                .map((file) => file.replace('.log', ''));
        }
        return [];
    }

    // 获取指定日志文件内容
    async GetLogContent(filename: string): Promise<string> {
        const logPath = resolve(webUiPathWrapper.logsPath, `${filename}.log`);
        const logExists = await fs
            .access(logPath, constants.R_OK)
            .then(() => true)
            .catch(() => false);
        if (logExists) {
            return await fs.readFile(logPath, 'utf-8');
        }
        return '';
    }

    // 获取字体文件夹内的字体列表
    async GetFontList(): Promise<string[]> {
        const fontsPath = resolve(webUiPathWrapper.configPath, './fonts');
        const fontsExist = await fs
            .access(fontsPath, constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (fontsExist) {
            return (await fs.readdir(fontsPath)).filter((file) => file.endsWith('.ttf'));
        }
        return [];
    }

    // 判断字体是否存在（webui.woff）
    async CheckWebUIFontExist(): Promise<boolean> {
        const fontsPath = resolve(webUiPathWrapper.configPath, './fonts');
        return await fs
            .access(resolve(fontsPath, './webui.woff'), constants.F_OK)
            .then(() => true)
            .catch(() => false);
    }

    // 获取webui字体文件路径
    GetWebUIFontPath(): string {
        return resolve(webUiPathWrapper.configPath, './fonts/webui.woff');
    }

    getAutoLoginAccount(): string | undefined {
        return this.WebUiConfigData?.autoLoginAccount;
    }

    // 获取自动登录账号
    async GetAutoLoginAccount(): Promise<string> {
        return (await this.GetWebUIConfig()).autoLoginAccount;
    }

    // 更新自动登录账号
    async UpdateAutoLoginAccount(uin: string): Promise<void> {
        await this.UpdateWebUIConfig({ autoLoginAccount: uin });
    }

    // 获取主题内容
    async GetTheme(): Promise<WebUiConfigType['theme']> {
        return (await this.GetWebUIConfig()).theme;
    }

    // 更新主题内容
    async UpdateTheme(theme: WebUiConfigType['theme']): Promise<void> {
        await this.UpdateWebUIConfig({ theme: theme });
    }
}
