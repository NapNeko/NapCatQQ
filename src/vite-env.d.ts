/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_BUILD_TYPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}