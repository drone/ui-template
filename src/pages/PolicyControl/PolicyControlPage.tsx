import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation, Page } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import routes from 'RouteDefinitions'
import { useQueryParams } from 'hooks/useQueryParams'
import type { StringsMap } from 'framework/strings/stringTypes'
import type { GovernancePathProps } from 'RouteUtils'

export interface PolicyControlPageProps {
  titleKey?: keyof StringsMap
}

const PolicyControlPage: React.FC<PolicyControlPageProps> = ({ titleKey, children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<GovernancePathProps>()
  const { getString } = useStrings()
  const { pageTitle } = useQueryParams<{ pageTitle: string }>()

  return (
    <>
      <Page.Header
        // TODO: Need to pass this NGBreadcrumbs from NGUI
        // breadcrumbs={<NGBreadcrumbs />}
        title={pageTitle || (titleKey && getString(titleKey)) || ''}
        toolbar={
          <TabNavigation
            size={'small'}
            links={[
              {
                label: getString('overview'),
                to: routes.toGovernancePolicyDashboard({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policies'),
                to: routes.toGovernancePolicyListing({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policy.policysets'),
                to: routes.toGovernancePolicySetsListing({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policy.evaluations'),
                to: routes.toGovernanceEvaluationsListing({ accountId, orgIdentifier, projectIdentifier, module })
              }
            ]}
          />
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default PolicyControlPage
