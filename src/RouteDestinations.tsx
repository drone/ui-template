import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import type { AppProps } from 'AppProps'
import { SignInPage } from 'pages/signin/SignInPage'
import { NotFoundPage } from 'pages/404/NotFoundPage'
import { setRouteBase, routePath } from './RouteUtils'
import { RoutePath } from './RouteDefinitions'
import PolicyControlPage from './pages/PolicyControl/PolicyControlPage'
import Policies from './pages/Policies/Policies'
import PolicyDashboard from './pages/PolicyDashboard/PolicyDashboard'
import PolicySets from './pages/PolicySets/PolicySets'
import PolicyEvaluations from './pages/PolicyEvaluations/PolicyEvaluations'
import { EditPolicy } from './pages/EditPolicy/EditPolicy'
import { PolicySetDetail } from './pages/PolicySetDetail/PolicySetDetail'
import { EvaluationDetail } from './pages/EvaluationDetail/EvaluationDetail'

export const RouteDestinations: React.FC<Pick<AppProps, 'standalone' | 'basePath' | 'baseURL'>> = ({
  standalone,
  basePath = '',
  baseURL = ''
}) => {
  setRouteBase(basePath, baseURL)

  // TODO: Add Auth wrapper

  const Destinations: React.FC = () => (
    <Switch>
      {standalone && (
        <Route path={routePath(RoutePath.SIGNIN)}>
          <SignInPage />
        </Route>
      )}

      <Route path={routePath(RoutePath.POLICY_DASHBOARD)}>
        <PolicyControlPage titleKey="overview">
          <PolicyDashboard />
        </PolicyControlPage>
      </Route>

      <Route path={routePath(RoutePath.POLICY_NEW)}>
        <PolicyControlPage titleKey="common.policy.newPolicy">
          <EditPolicy />
        </PolicyControlPage>
      </Route>

      <Route path={routePath(RoutePath.POLICY_EDIT)}>
        <PolicyControlPage titleKey="governance.editPolicy">
          <EditPolicy />
        </PolicyControlPage>
      </Route>

      <Route path={routePath(RoutePath.POLICY_LISTING)}>
        <PolicyControlPage titleKey="common.policies">
          <Policies />
        </PolicyControlPage>
      </Route>

      <Route path={routePath(RoutePath.POLICY_SETS_LISTING)}>
        <PolicyControlPage titleKey="common.policy.policysets">
          <PolicySets />
        </PolicyControlPage>
      </Route>

      <Route path={routePath(RoutePath.POLICY_SETS_DETAIL)}>
        <PolicyControlPage titleKey="common.policy.policysets">
          <PolicySetDetail />
        </PolicyControlPage>
      </Route>

      <Route path={routePath(RoutePath.POLICY_EVALUATIONS_LISTING)}>
        <PolicyControlPage titleKey="governance.evaluations">
          <PolicyEvaluations />
        </PolicyControlPage>
      </Route>

      <Route path={routePath(RoutePath.POLICY_EVALUATION_DETAIL)}>
        <PolicyControlPage titleKey="governance.evaluations">
          <EvaluationDetail />
        </PolicyControlPage>
      </Route>

      <Route path="/">
        <NotFoundPage />
      </Route>
    </Switch>
  )

  return standalone ? (
    <HashRouter>
      <Destinations />
    </HashRouter>
  ) : (
    <Destinations />
  )
}
