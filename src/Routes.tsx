import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import type { AppProps } from 'types'
import { TestPage } from 'pages/test-page/TestPage'

export const Routes: React.FC<Pick<AppProps, 'standalone'>> = ({ standalone }) => {
  return (
    <HashRouter>
      <Switch>
        <Route
          path={[
            '/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/settings/organizations/:orgIdentifier/',
            '/account/:accountId'
          ]}
        >
          <>
            <TestPage />
            Standalone: {String(standalone)}
          </>
        </Route>
        <Route path="/">
          <>
            <h1>No auth</h1>
            Standalone: {String(standalone)}
          </>
        </Route>
      </Switch>
    </HashRouter>
  )
}
