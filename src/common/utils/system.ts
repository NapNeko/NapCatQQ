import os from 'node:os';
import path from 'node:path';
import { networkInterfaces } from 'os';
import { randomUUID } from 'crypto';

// 缓解Win7设备兼容性问题
let osName: string;
// 设备ID
let machineId: Promise<string>;

try {
    osName = os.hostname();
} catch (e) {
    osName = 'NapCat'; // + crypto.randomUUID().substring(0, 4);
}

const invalidMacAddresses = new Set([
    '00:00:00:00:00:00',
    'ff:ff:ff:ff:ff:ff',
    'ac:de:48:00:11:22',
]);

function validateMacAddress(candidate: string): boolean {
    // eslint-disable-next-line no-useless-escape
    const tempCandidate = candidate.replace(/\-/g, ':').toLowerCase();
    return !invalidMacAddresses.has(tempCandidate);
}

export async function getMachineId(): Promise<string> {
    if (!machineId) {
        machineId = (async () => {
            const id = await getMacMachineId();
            return id ?? randomUUID(); // fallback, generate a UUID
        })();
    }

    return machineId;
}

export function getMac(): string {
    const ifaces = networkInterfaces();
    for (const name in ifaces) {
        const networkInterface = ifaces[name];
        if (networkInterface) {
            for (const { mac } of networkInterface) {
                if (validateMacAddress(mac)) {
                    return mac;
                }
            }
        }
    }

    throw new Error('Unable to retrieve mac address (unexpected format)');
}

async function getMacMachineId(): Promise<string | undefined> {
    try {
        const crypto = await import('crypto');
        const macAddress = getMac();
        return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
    } catch (err) {
        return undefined;
    }
}

const homeDir = os.homedir();

export const systemPlatform = os.platform();
export const cpuArch = os.arch();
export const systemVersion = os.release();
export const hostname = osName;
export const downloadsPath = path.join(homeDir, 'Downloads');
export const systemName = os.type();
