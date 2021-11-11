import { GovernancePathProps, toRoute } from 'RouteUtils'

export enum RoutePath {
  SIGNIN = '/signin',
  POLICY_DASHBOARD = '/dashboard',
  POLICY_LISTING = '/policies',
  POLICY_NEW = '/policies/new',
  POLICY_EDIT = '/policies/edit/:policyIdentifier',
  POLICY_SETS_LISTING = '/policy-sets',
  POLICY_SETS_DETAIL = '/policy-sets/:policySetIdentifier',
  POLICY_EVALUATIONS_LISTING = '/policy-evaluations',
  POLICY_EVALUATION_DETAIL = '/policy-evaluations/:evaluationId'
}

export default {
  toSignIn: (): string => toRoute(RoutePath.SIGNIN),
  toPolicyDashboard: (): string => toRoute(RoutePath.POLICY_DASHBOARD),
  toPolicyListing: (): string => toRoute(RoutePath.POLICY_LISTING),
  toPolicyNew: (): string => toRoute(RoutePath.POLICY_NEW),
  toPolicyEdit: ({ policyIdentifier }: Required<Pick<GovernancePathProps, 'policyIdentifier'>>): string =>
    toRoute(RoutePath.POLICY_EDIT, { policyIdentifier }),
  toPolicySets: (): string => toRoute(RoutePath.POLICY_SETS_LISTING),
  toPolicyEvaluations: (): string => toRoute(RoutePath.POLICY_EVALUATIONS_LISTING),

  toGovernancePolicyDashboard: ({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    toRoute(RoutePath.POLICY_DASHBOARD, {
      orgIdentifier,
      projectIdentifier,
      module
    }),

  toGovernancePolicyListing: ({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    toRoute(RoutePath.POLICY_LISTING, {
      orgIdentifier,
      projectIdentifier,
      module
    }),

  toGovernanceNewPolicy: ({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    toRoute(RoutePath.POLICY_NEW, {
      orgIdentifier,
      projectIdentifier,
      module
    }),

  toGovernanceEditPolicy: ({
    orgIdentifier,
    projectIdentifier,
    policyIdentifier,
    module
  }: RequireField<GovernancePathProps, 'policyIdentifier'>) =>
    toRoute(RoutePath.POLICY_EDIT, {
      orgIdentifier,
      projectIdentifier,
      policyIdentifier,
      module
    }),

  toGovernancePolicySetsListing: ({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    toRoute(RoutePath.POLICY_SETS_LISTING, {
      orgIdentifier,
      projectIdentifier,
      module
    }),

  toGovernancePolicySetDetail: ({
    orgIdentifier,
    projectIdentifier,
    policySetIdentifier,
    module
  }: GovernancePathProps) =>
    toRoute(RoutePath.POLICY_SETS_DETAIL, {
      orgIdentifier,
      projectIdentifier,
      module,
      policySetIdentifier
    }),

  toGovernanceEvaluationsListing: ({ orgIdentifier, projectIdentifier, module }: GovernancePathProps) =>
    toRoute(RoutePath.POLICY_EVALUATIONS_LISTING, {
      orgIdentifier,
      projectIdentifier,
      module
    }),

  toGovernanceEvaluationDetail: ({ orgIdentifier, projectIdentifier, evaluationId, module }: GovernancePathProps) =>
    toRoute(RoutePath.POLICY_EVALUATION_DETAIL, {
      orgIdentifier,
      projectIdentifier,
      module,
      evaluationId
    })
}
