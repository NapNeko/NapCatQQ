interface BypassOptions {
  hook: boolean;
  window: boolean;
  module: boolean;
  process: boolean;
  container: boolean;
  js: boolean;
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
