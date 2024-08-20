import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export const napcat_version = '2.0.35';

export class NapCatPathWrapper {
    binaryPath: string;
    logsPath: string;
    configPath: string;
    cachePath: string;
    staticPath: string;

    constructor(mainPath: string = dirname(fileURLToPath(import.meta.url))) {
        this.binaryPath = mainPath;
        this.logsPath = path.join(this.binaryPath, 'logs');
        this.configPath = path.join(this.binaryPath, 'config');
        this.cachePath = path.join(this.binaryPath, 'cache');
        this.staticPath = path.join(this.binaryPath, 'static');
        if (fs.existsSync(this.logsPath)) {
            fs.mkdirSync(this.logsPath, { recursive: true });
        }
        if (fs.existsSync(this.configPath)) {
            fs.mkdirSync(this.configPath, { recursive: true });
        }
        if (fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
    }
}
