import type { LangLocale } from './framework/strings/languageLoader'

export interface AppProps {
  /** Language to use in the app, default is 'en' */
  lang?: LangLocale

  /** API token to be used in Restful React */
  apiToken?: string

  /** 401 handler. Used in parent app to override 401 handling from child app */
  on401?: () => void
}
