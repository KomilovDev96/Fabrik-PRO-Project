/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_PROXY_TARGET: string
  readonly VITE_DEFAULT_LOCALE: 'ru' | 'uz' | 'en'
  readonly VITE_APP_NAME: string
  readonly VITE_YANDEX_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
