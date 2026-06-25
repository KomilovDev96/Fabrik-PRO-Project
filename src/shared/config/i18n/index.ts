import i18n from 'i18next'
import type { TFunction } from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { env } from '@/shared/config/env'
import { STORAGE_KEYS } from '@/shared/config/constants'
import { ru } from './locales/ru'
import { en } from './locales/en'
import { uz } from './locales/uz'

export const SUPPORTED_LOCALES = ['ru', 'uz', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<AppLocale, string> = {
  ru: 'Русский',
  uz: "O'zbekcha",
  en: 'English',
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      uz: { translation: uz },
      en: { translation: en },
    },
    fallbackLng: env.defaultLocale,
    supportedLngs: [...SUPPORTED_LOCALES],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.locale,
      caches: ['localStorage'],
    },
  })

export { i18n }

/**
 * Translate a key that is built at runtime (e.g. from menu config), which the
 * strictly-typed `t` cannot narrow to a known key. Use sparingly.
 */
export function tx(t: TFunction, key: string): string {
  return (t as unknown as (k: string) => string)(key)
}
