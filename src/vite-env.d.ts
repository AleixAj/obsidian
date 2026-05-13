/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Laravel backend (obsidian-api). */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
