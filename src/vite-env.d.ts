/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly BLOB_READ_WRITE_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
