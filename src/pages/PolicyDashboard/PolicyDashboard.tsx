import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Color, Container, Page } from '@wings-software/uicore'
import { useGetdashboard } from 'services/pm'
import policyIcon from '../Policies/Policy.svg'
import policySetIcon from '../PolicySets/PolicySetIcon.svg'
import PoliciesBarChart from './PoliciesBarChart'
import css from './PolicyDashboard.module.scss'

const PolicyDashboard: React.FC = () => {
  const { accountId, orgIdentifier = '*', projectIdentifier = '*' } = useParams<Record<string, string>>()
  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )
  const {
    data: dashboardStats,
    loading: fetchingDashboardStats,
    error
  } = useGetdashboard({ queryParams } as Record<string, unknown>)

  return (
    <>
      <Page.Body error={(error?.data as Error)?.message || error?.message}>
        <Layout.Vertical padding="xlarge">
          <Layout.Horizontal>
            <Layout.Vertical className={css.oContainer}>
              <Text color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }}>
                At a Glance
              </Text>
              <Layout.Horizontal spacing="medium">
                <Container width={115} height={115} className={css.nContainer}>
                  <img src={policySetIcon}></img>
                  <Text className={css.nText}>{dashboardStats?.total_policy_set_count || 0}</Text>
                  <Text font={{ size: 'small' }}>Policy Sets</Text>
                </Container>
                <Container width={115} height={115} className={css.nContainer}>
                  {/* <img src={policySetIcon}></img> */}
                  <Text className={css.nText}>{dashboardStats?.enabled_policy_set_count || 0}</Text>
                  <Text font={{ size: 'small' }}>In Effect</Text>
                </Container>
                <Container width={115} height={115} className={css.nContainer}>
                  <img src={policyIcon}></img>
                  <Text className={css.nText}>{dashboardStats?.total_policy_count || 0}</Text>
                  <Text font={{ size: 'small' }}>Policies</Text>
                </Container>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical style={{ marginLeft: 'var(--spacing-7)' }}>
              <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
                <Text color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }}>
                  Evaluations
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <Container className={css.mContainer} padding="large">
                  <Layout.Horizontal>
                    <Layout.Vertical spacing="medium" style={{ justifyContent: 'center' }}>
                      <Container className={css.smContainer}>
                        <Text color={Color.GREY_700}>Policy Evaluations</Text>{' '}
                        <Text className={css.smText}>{dashboardStats?.total_evaluation_count || 0}</Text>
                      </Container>
                      <Container className={css.smContainer}>
                        <Text color={Color.RED_800}>Failures Recorded</Text>
                        <Text className={css.smTextRed}>{dashboardStats?.failed_evaluation_count || 0}</Text>
                      </Container>
                    </Layout.Vertical>
                    <Container width={620}>
                      <PoliciesBarChart series={dashboardStats?.aggregates} loadingChart={fetchingDashboardStats} />
                    </Container>
                  </Layout.Horizontal>
                </Container>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default PolicyDashboard
