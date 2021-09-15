import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { useStrings } from './framework/strings/String'

function TestComponent() {
  const { getString } = useStrings()
  return <h1>Hello World 1 {getString('harness')}</h1>
}

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
          <TestComponent />
        </Route>
        <Route path="/">
          <h1>No auth</h1>
        </Route>
      </Switch>
    </HashRouter>
  )
}
