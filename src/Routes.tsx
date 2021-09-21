import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import type { AppProps } from 'AppProps'
import { SignInPage } from 'pages/signin/SignInPage'
import { NotFoundPage } from 'pages/404/NotFoundPage'

const RoutePaths = {
  signIn: '/signin'
} as const

const Routes: React.FC = () => (
  <Switch>
    <Route path={RoutePaths.signIn}>
      <SignInPage />
    </Route>
    <Route path="/">
      <NotFoundPage />
    </Route>
  </Switch>
)

export const RouteURLs = {
  toSignIn: () => RoutePaths.signIn
} as const

export const RouteDefinitions: React.FC<Pick<AppProps, 'standalone'>> = ({ standalone }) =>
  standalone ? (
    <HashRouter>
      <Routes />
    </HashRouter>
  ) : (
    <Routes />
  )
