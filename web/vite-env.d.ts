/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOCAT_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
