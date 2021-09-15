import React, { useEffect, useState, useCallback } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RestfulProvider } from 'restful-react'
import { FocusStyleManager } from '@blueprintjs/core'
import { languageLoader } from './framework/strings/languageLoader'
import type { LangLocale, LanguageRecord } from './framework/strings/languageLoader'
import { StringsContextProvider } from './framework/strings/StringsContextProvider'
import { useStrings } from './framework/strings/String'

FocusStyleManager.onlyShowFocusOnTabs()

interface AppProps {
  strings: Record<string, any>
}

function TestComponent() {
  const { getString } = useStrings()
  return <h1>Hello World 1 {getString('harness')}</h1>
}

function AppWithAuthentication(props: AppProps): React.ReactElement {
  const token = 'foobar' // TODO: Put token here
  const getRequestOptions = useCallback((): Partial<RequestInit> => {
    const headers: RequestInit['headers'] = {}

    if (token && token.length > 0) {
      headers.Authorization = `Bearer ${token}`
    }

    return { headers }
  }, [token])

  return (
    <RestfulProvider
      base="/"
      requestOptions={getRequestOptions}
      queryParams={{}} // TODO fill in queryParams if needed
      queryParamStringifyOptions={{ skipNulls: true }}
      onResponse={response => {
        if (!response.ok && response.status === 401) {
          // AppStorage.clear()
          // history.push({ pathname: routes.toRedirect(), search: returnUrlParams(getLoginPageURL()) })
          // TODO Possibly pass to parent?
          return
        }
      }}
    >
      <StringsContextProvider initialStrings={props.strings}>
        <TestComponent />
      </StringsContextProvider>
    </RestfulProvider>
  )
}

export function App() {
  const lang: LangLocale = 'en'
  const [strings, setStrings] = useState<LanguageRecord>()

  useEffect(() => {
    languageLoader(lang).then(_languages => {
      console.log(_languages)
      setStrings(_languages)
    })
  }, [setStrings])

  return strings ? (
    <HashRouter>
      <Switch>
        <Route
          path={[
            // this path is needed for AppStoreProvider to populate accountId, orgId and projectId
            '/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/settings/organizations/:orgIdentifier/',
            '/account/:accountId'
          ]}
        >
          <AppWithAuthentication strings={strings} />
        </Route>
        <Route path="/">
          <h1>No auth</h1>
        </Route>
      </Switch>
    </HashRouter>
  ) : null
}
