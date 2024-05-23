/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BUILD_TYPE: string
    readonly VITE_BUILD_TARGE: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }