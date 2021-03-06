import React, { useEffect, useState, useCallback } from 'react'
import { RestfulProvider } from 'restful-react'
import { TooltipContextProvider } from '@wings-software/uicore'
import { FocusStyleManager } from '@blueprintjs/core'
import AppErrorBoundary from 'framework/AppErrorBoundary/AppErrorBoundary'
import { languageLoader } from './framework/strings/languageLoader'
import type { LanguageRecord } from './framework/strings/languageLoader'
import { StringsContextProvider } from './framework/strings/StringsContextProvider'
import type { AppProps } from './AppProps'
import { RouteDestinations } from './RouteDestinations'
import { buildResfulReactRequestOptions, getAPIToken, handle401 } from './AppUtils'
import './App.scss'

FocusStyleManager.onlyShowFocusOnTabs()

const App: React.FC<AppProps> = props => {
  const { standalone, basePath, baseURL, lang = 'en', apiToken, on401 = handle401 } = props
  const [strings, setStrings] = useState<LanguageRecord>()
  const [token, setToken] = useState(apiToken)
  const getRequestOptions = useCallback((): Partial<RequestInit> => {
    return buildResfulReactRequestOptions(token)
  }, [token])

  useEffect(() => {
    languageLoader(lang).then(setStrings)
  }, [lang, setStrings])

  useEffect(() => {
    if (!apiToken) {
      setToken(getAPIToken())
    }
  }, [apiToken])

  return strings ? (
    <AppErrorBoundary>
      <RestfulProvider
        base="/"
        requestOptions={getRequestOptions}
        queryParams={{}} // TODO: fill in queryParams if needed
        queryParamStringifyOptions={{ skipNulls: true }}
        onResponse={response => {
          if (!response.ok && response.status === 401) {
            on401()
          }
        }}>
        <StringsContextProvider initialStrings={strings}>
          <TooltipContextProvider initialTooltipDictionary={{}}>
            <RouteDestinations standalone={standalone} basePath={basePath} baseURL={baseURL} />
          </TooltipContextProvider>
        </StringsContextProvider>
      </RestfulProvider>
    </AppErrorBoundary>
  ) : null
}

export default App
