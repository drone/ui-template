import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import type { AppProps } from 'AppProps'
import { SignInPage } from 'pages/signin/SignInPage'
import { NotFoundPage } from 'pages/404/NotFoundPage'
import { TestPage } from 'pages/test/TestPage'
import { setBasePath } from './RouteUtils'
import routes from './RouteDefinitions'

export const RouteDestinations: React.FC<Pick<AppProps, 'standalone' | 'basePath'>> = ({
  standalone,
  basePath = ''
}) => {
  setBasePath(basePath)

  const Routes: React.FC = () => (
    <Switch>
      {standalone && (
        <Route path={routes.toSignIn()}>
          <SignInPage />
        </Route>
      )}
      <Route path={routes.toPolicies()}>
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
