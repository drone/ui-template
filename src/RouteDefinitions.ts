import { AppPathProps, toRoute } from 'RouteUtils'

export enum RoutePath {
  SIGNIN = '/signin',
  POLICY_DASHBOARD = '/dashboard',
  POLICY_LISTING = '/policies',
  POLICY_NEW = '/policies/new',
  POLICY_EDIT = '/policies/edit/:policyIdentifier',
  POLICY_SETS = '/policy-sets',
  POLICY_EVALUATIONS = '/policy-evaluations'
}

export default {
  toSignIn: (): string => toRoute(RoutePath.SIGNIN),
  toPolicyDashboard: (): string => toRoute(RoutePath.POLICY_DASHBOARD),
  toPolicyListing: (): string => toRoute(RoutePath.POLICY_LISTING),
  toPolicyNew: (): string => toRoute(RoutePath.POLICY_NEW),
  toPolicyEdit: ({ policyIdentifier }: Required<Pick<AppPathProps, 'policyIdentifier'>>): string =>
    toRoute(RoutePath.POLICY_EDIT, { policyIdentifier }),
  toPolicySets: (): string => toRoute(RoutePath.POLICY_SETS),
  toPolicyEvaluations: (): string => toRoute(RoutePath.POLICY_EVALUATIONS)
}
