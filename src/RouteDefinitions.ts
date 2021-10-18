import { withRouteBaseURL } from 'RouteUtils'

export const RoutePath = {
  SIGNIN: '/signin',
  POLICY_DASHBOARD: '/dashboard',
  POLICY_LISTING: '/policies',
  POLICY_NEW: '/policies/new',
  POLICY_EDIT: '/policies/edit/:policyIdentifier',
  POLICY_SETS: '/policy-sets',
  POLICY_EVALUATIONS: '/policy-evaluations'
} as const

export default {
  toSignIn: (): string => withRouteBaseURL(RoutePath.SIGNIN),
  toPolicyDashboard: (): string => withRouteBaseURL(RoutePath.POLICY_DASHBOARD),
  toPolicyListing: (): string => withRouteBaseURL(RoutePath.POLICY_LISTING),
  toPolicyNew: (): string => withRouteBaseURL(RoutePath.POLICY_NEW),
  toPolicyEdit: ({ policyIdentifier }: { policyIdentifier: string }): string =>
    withRouteBaseURL(RoutePath.POLICY_EDIT, { policyIdentifier }),
  toPolicySets: (): string => withRouteBaseURL(RoutePath.POLICY_SETS),
  toPolicyEvaluations: (): string => withRouteBaseURL(RoutePath.POLICY_EVALUATIONS)
}
