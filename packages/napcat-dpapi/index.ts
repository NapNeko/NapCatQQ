/**
 * napcat-dpapi - Windows DPAPI wrapper
 *
 * Loads the native @primno+dpapi.node addon from the runtime
 * native/dpapi/ directory using process.dlopen, consistent
 * with how other native modules (ffmpeg, packet, pty) are loaded.
 */

import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

export type DataProtectionScope = 'CurrentUser' | 'LocalMachine';

export interface DpapiBindings {
  protectData (dataToEncrypt: Uint8Array, optionalEntropy: Uint8Array | null, scope: DataProtectionScope): Uint8Array;
  unprotectData (encryptData: Uint8Array, optionalEntropy: Uint8Array | null, scope: DataProtectionScope): Uint8Array;
}

let dpapiBindings: DpapiBindings | null = null;
let loadError: Error | null = null;

function getAddonPath (): string {
  // At runtime, import.meta.url resolves to dist/ directory.
  // Native files are at dist/native/dpapi/{platform}-{arch}/@primno+dpapi.node
  const importDir = dirname(fileURLToPath(import.meta.url));
  const platform = process.platform; // 'win32'
  const arch = process.arch; // 'x64' or 'arm64'
  return path.join(importDir, 'native', 'dpapi', `${platform}-${arch}`, '@primno+dpapi.node');
}

function loadDpapi (): DpapiBindings {
  if (dpapiBindings) {
    return dpapiBindings;
  }
  if (loadError) {
    throw loadError;
  }
  try {
    const addonPath = getAddonPath();
    const nativeModule: { exports: DpapiBindings } = { exports: {} as DpapiBindings };
    process.dlopen(nativeModule, addonPath);
    dpapiBindings = nativeModule.exports;
    return dpapiBindings;
  } catch (e) {
    loadError = e as Error;
    throw new Error(`Failed to load DPAPI native addon: ${(e as Error).message}`);
  }
}

export const isPlatformSupported = process.platform === 'win32';

export function protectData (data: Uint8Array, optionalEntropy: Uint8Array | null, scope: DataProtectionScope): Uint8Array {
  return loadDpapi().protectData(data, optionalEntropy, scope);
}

export function unprotectData (data: Uint8Array, optionalEntropy: Uint8Array | null, scope: DataProtectionScope): Uint8Array {
  return loadDpapi().unprotectData(data, optionalEntropy, scope);
}

export const Dpapi = {
  protectData,
  unprotectData,
};

export default Dpapi;
