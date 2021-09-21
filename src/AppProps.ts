import type { LangLocale } from './framework/strings/languageLoader'

/**
 * AppProps defines an interface for host (parent) and
 * child (micro-frontend) apps to talk to each other. It allows behaviors
 * of the child app to be customized from the parent app.
 *
 * Areas of customization:
 *
 *  - API token
 *  - Active user
 *  - Active locale (i18n)
 *  - Global error handling (like 401)
 *  - etc...
 *
 * Under standalone mode, the micro-frontend app uses default
 * implementation of the interface in AppUtils.ts.
 *
 * This interface is published to allow parent to do type checking.
 */
export interface AppProps {
  /** Flag to tell if App is mounted as a standalone app */
  standalone: boolean

  /** Base path from parent app when being embedded */
  basePath?: string

  /** Language to use in the app, default is 'en' */
  lang?: LangLocale

  /** API token to be used in Restful React */
  apiToken?: string

  /** 401 handler. Used in parent app to override 401 handling from child app */
  on401?: () => void
}
