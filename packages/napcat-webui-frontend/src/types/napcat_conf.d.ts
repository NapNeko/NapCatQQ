interface BypassOptions {
  hook: boolean;
  module: boolean;
  window: boolean;
  js: boolean;
  container: boolean;
  maps: boolean;
}

interface NapCatConfig {
  fileLog: boolean;
  consoleLog: boolean;
  fileLogLevel: string;
  consoleLogLevel: string;
  packetBackend: string;
  packetServer: string;
  o3HookMode: number;
  bypass?: BypassOptions;
}
