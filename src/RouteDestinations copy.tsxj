import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'
import Policies from './pages/Policies/Policies'
import PolicyControlPage from './pages/PolicyControl/PolicyControlPage'
import PolicySets from './pages/PolicySets/PolicySets'
import PolicyEvaluations from './pages/PolicyEvaluations/PolicyEvaluations'
import { EditPolicy } from './pages/EditPolicy/EditPolicy'
import { PolicySetDetail } from './pages/PolicySetDetail/PolicySetDetail'
import { EvaluationDetail } from './pages/EvaluationDetail/EvaluationDetail'
import PolicyDashboard from './pages/PolicyDashboard/PolicyDashboard'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

const RedirectToDefaultGovernanceRoute: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<GovernancePathProps>()
  const history = useHistory()

  useEffect(() => {
    history.replace(routes.toGovernancePolicyDashboard({ accountId, orgIdentifier, projectIdentifier, module }))
  }, [history, accountId, orgIdentifier, projectIdentifier, module])

  return null
}

//
// This function constructs Governance Routes based on context. Governance can be mounted in three
// places: Account Settings, Project Detail, and Org Detail. Depends on pathProps of where this module
// is mounted, this function will generate proper Governance routes.
//
export const GovernanceRouteDestinations: React.FC<{
  sidebarProps: SidebarContext
  pathProps: GovernancePathProps
}> = ({ sidebarProps, pathProps }) => {
  return (
    <Route path={routes.toGovernance(pathProps)}>
      <Route path={routes.toGovernance(pathProps)} exact>
        <RedirectToDefaultGovernanceRoute />
      </Route>

      <RouteWithLayout path={routes.toGovernancePolicyDashboard(pathProps)} exact sidebarProps={sidebarProps}>
        <PolicyControlPage titleKey="overview">
          <PolicyDashboard />
        </PolicyControlPage>
      </RouteWithLayout>

      <RouteWithLayout path={routes.toGovernancePolicyListing(pathProps)} exact sidebarProps={sidebarProps}>
        <PolicyControlPage titleKey="common.policies">
          <Policies />
        </PolicyControlPage>
      </RouteWithLayout>

      <RouteWithLayout path={routes.toGovernanceNewPolicy(pathProps)} exact sidebarProps={sidebarProps}>
        <PolicyControlPage titleKey="common.policy.newPolicy">
          <EditPolicy />
        </PolicyControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toGovernanceEditPolicy({ ...pathProps, policyIdentifier: ':policyIdentifier' })}
        exact
        sidebarProps={sidebarProps}
      >
        <PolicyControlPage titleKey="governance.editPolicy">
          <EditPolicy />
        </PolicyControlPage>
      </RouteWithLayout>

      <RouteWithLayout path={routes.toGovernancePolicySetsListing(pathProps)} exact sidebarProps={sidebarProps}>
        <PolicyControlPage titleKey="common.policy.policysets">
          <PolicySets />
        </PolicyControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toGovernancePolicySetDetail({
          ...pathProps,
          policySetIdentifier: ':policySetIdentifier'
        })}
        exact
        sidebarProps={sidebarProps}
      >
        <PolicyControlPage titleKey="common.policy.policysets">
          <PolicySetDetail />
        </PolicyControlPage>
      </RouteWithLayout>

      <RouteWithLayout path={routes.toGovernanceEvaluationsListing(pathProps)} exact sidebarProps={sidebarProps}>
        <PolicyControlPage titleKey="governance.evaluations">
          <PolicyEvaluations />
        </PolicyControlPage>
      </RouteWithLayout>

      <RouteWithLayout
        path={routes.toGovernanceEvaluationDetail({ ...pathProps, evaluationId: ':evaluationId' })}
        exact
        sidebarProps={sidebarProps}
      >
        <PolicyControlPage titleKey="governance.evaluations">
          <EvaluationDetail />
        </PolicyControlPage>
      </RouteWithLayout>
    </Route>
  )
}

export default <>{GovernanceRouteDestinations({ sidebarProps: AccountSideNavProps, pathProps: accountPathProps })}</>
