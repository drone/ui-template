import React, { useState } from 'react'
import { Container, FontVariation, Heading, Icon, Layout, Tabs } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { EvaluationsTab } from './EvaluationsTab'
import { PolicySetsTab } from './PolicySetsTab'
import css from './PipelineGovernanceView.module.scss'

export interface PipelinePolicySetsProps {
  pipelineName?: string
}

export const PipelineGovernanceView: React.FC<PipelinePolicySetsProps> = ({ pipelineName }) => {
  const { getString } = useStrings()
  const [policySetCount, setPolicySetCount] = useState(0)

  return (
    <Container className={css.main}>
      <Layout.Horizontal spacing="small" padding="xlarge" className={css.header}>
        <Icon name="governance" size={16} />
        <Heading level={4} font={{ variation: FontVariation.H4 }}>
          {getString('governance.policySetsApplied', { pipelineName })}
        </Heading>
      </Layout.Horizontal>

      <Container className={css.tabs}>
        <Tabs
          id={'pipelinePolicySets'}
          defaultSelectedTabId={'policySets'}
          tabList={[
            {
              id: 'policySets',
              title: getString(policySetCount ? 'governance.policySets' : 'common.policy.policysets', {
                count: policySetCount
              }),
              panel: <PolicySetsTab setPolicySetCount={setPolicySetCount} />
            },
            {
              id: 'evaluations',
              title: getString('governance.evaluations'),
              panel: <EvaluationsTab />
            }
          ]}
        />
      </Container>
    </Container>
  )
}
