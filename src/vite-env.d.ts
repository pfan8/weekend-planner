/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKERS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

