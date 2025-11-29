/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_URL: string
  readonly API_BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
