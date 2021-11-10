import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import type { AppProps } from 'AppProps'
import { SignInPage } from 'pages/signin/SignInPage'
import { NotFoundPage } from 'pages/404/NotFoundPage'
import { TestPage } from 'pages/test/TestPage'
import { setRouteBase, getRoutePath } from './RouteUtils'
import { RoutePath } from './RouteDefinitions'

export const RouteDestinations: React.FC<Pick<AppProps, 'standalone' | 'basePath' | 'baseURL'>> = ({
  standalone,
  basePath = '',
  baseURL = ''
}) => {
  setRouteBase(basePath, baseURL)

  const Routes: React.FC = () => (
    <Switch>
      {standalone && (
        <Route path={RoutePath.SIGNIN}>
          <SignInPage />
        </Route>
      )}
      <Route path={getRoutePath(RoutePath.POLICY_DASHBOARD)}>
        <h1>POLICY_DASHBOARD</h1>
      </Route>
      <Route path={getRoutePath(RoutePath.POLICY_LISTING)}>
        <TestPage />
      </Route>
      <Route path="/">
        <NotFoundPage />
      </Route>
    </Switch>
  )

  return standalone ? (
    <HashRouter>
      <Routes />
    </HashRouter>
  ) : (
    <Routes />
  )
}
