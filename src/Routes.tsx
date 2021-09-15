import { TestPage } from 'pages/test-page/TestPage'
import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'

export const Routes: React.FC = () => {
  return (
    <HashRouter>
      <Switch>
        <Route
          path={[
            // this path is needed for AppStoreProvider to populate accountId, orgId and projectId
            '/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/settings/organizations/:orgIdentifier/',
            '/account/:accountId',
          ]}
        >
          <TestPage />
        </Route>
        <Route path="/">
          <h1>No auth</h1>
        </Route>
      </Switch>
    </HashRouter>
  )
}
