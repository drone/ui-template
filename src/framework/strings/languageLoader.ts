export type LangLocale = 'es' | 'en' | 'en-IN' | 'en-US' | 'en-UK'

export type LanguageRecord = Record<string, Record<string, any>>

export function languageLoader(langId: LangLocale = 'en'): Promise<LanguageRecord> {
  switch (langId) {
    case 'es':
      return import('../../strings.es.yaml')
    case 'en':
    case 'en-US':
    case 'en-IN':
    case 'en-UK':
    default:
      return import('../../strings.en.yaml')
  }
}
