/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_NAPCAT_VERSION: string;
  }
}

export {};
