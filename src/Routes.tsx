import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import type { AppProps } from 'AppProps'
import { SignInPage } from 'pages/signin/SignInPage'
import { NotFoundPage } from 'pages/404/NotFoundPage'
import { TestPage } from 'pages/test/TestPage'

const RoutePaths = {
  signIn: '/signin'
} as const

/*
 * NOTE: basePath is passed from parent app. In standalone mode,
 * basePath is defaulted ''.
 */
const Routes: React.FC<{ basePath?: string }> = ({ basePath = '' }) => (
  <Switch>
    <Route path={RoutePaths.signIn}>
      <SignInPage />
    </Route>
    <Route path={`${basePath}/test-page`}>
      <TestPage />
    </Route>
    <Route path={`${basePath}/`}>
      <>
        <NotFoundPage />
        {`${basePath}/test-page`}
      </>
    </Route>
  </Switch>
)

export const RouteURLs = {
  toSignIn: () => RoutePaths.signIn
} as const

export const RouteDefinitions: React.FC<Pick<AppProps, 'standalone' | 'basePath'>> = ({ standalone, basePath }) =>
  standalone ? (
    <HashRouter>
      <Routes />
    </HashRouter>
  ) : (
    <Routes basePath={basePath} />
  )
