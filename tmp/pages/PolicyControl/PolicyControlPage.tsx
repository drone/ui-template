import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

export interface PolicyControlPageProps {
  title?: string
}

const PolicyControlPage: React.FC<PolicyControlPageProps> = ({ title = '', children }) => {
  const { accountId } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={title}
        toolbar={
          <TabNavigation
            size={'small'}
            links={[
              {
                label: getString('overview'),
                to: routes.toPolicyDashboardPage({ accountId })
              },
              {
                label: getString('common.policies'),
                to: routes.toPolicyListPage({ accountId })
              },
              {
                label: getString('common.policy.policysets'),
                to: routes.toPolicySetsPage({ accountId })
              },
              {
                label: getString('common.policy.evaluations'),
                to: routes.toPolicyEvaluationsPage({ accountId })
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
