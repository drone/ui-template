/* eslint-disable react/display-name */
import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { get } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import {
  Container,
  FontVariation,
  NoDataCard,
  PageError,
  Pagination,
  Text,
  TableV2 as Table
} from '@wings-software/uicore'
import { GetPolicySetListQueryParams, PolicySet, useGetPolicySetList } from 'services/pm'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from 'components/ContainerSpinner/ContainerSpinner'
import routes from 'RouteDefinitions'
import { LIST_FETCHING_PAGE_SIZE, PolicySetType } from 'utils/GovernanceUtils'
import type { GovernancePathProps } from 'RouteUtils'
import css from './PipelineGovernanceView.module.scss'

export const PolicySetsTab: React.FC<{ setPolicySetCount: React.Dispatch<React.SetStateAction<number>> }> = ({
  setPolicySetCount
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<GovernancePathProps>()
  const queryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      per_page: String(LIST_FETCHING_PAGE_SIZE),
      page: String(pageIndex),
      type: PolicySetType.PIPELINE,
      include_hierarchy: true
    } as GetPolicySetListQueryParams
  }, [accountId, orgIdentifier, projectIdentifier, pageIndex])
  const { data, loading, error, refetch, response } = useGetPolicySetList({
    queryParams
  })
  const { getString } = useStrings()
  const columns: Column<PolicySet>[] = useMemo(
    () => [
      {
        Header: getString('common.policiesSets.table.name'),
        accessor: row => row.name,
        width: '60%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text icon="governance" iconProps={{ padding: { right: 'small' } }} font={{ variation: FontVariation.BODY2 }}>
            {row.original.name}
          </Text>
        )
      },
      {
        Header: getString('common.policiesSets.table.enforced'),
        accessor: row => row.enabled,
        width: '10%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text
            font={{
              variation: row.original.enabled ? FontVariation.FORM_MESSAGE_SUCCESS : FontVariation.FORM_MESSAGE_DANGER
            }}>
            {row.original.enabled ? getString('yes') : getString('no')}
          </Text>
        )
      },
      {
        Header: getString('governance.policySetGroup'),
        accessor: row => row.identifier,
        width: '18%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text
            font={{
              variation: FontVariation.BODY
            }}>
            {row.original.project_id
              ? getString('governance.policySetGroupProject')
              : row.original.org_id
              ? getString('governance.policySetGroupOrg')
              : getString('governance.policySetGroupAccount')}
          </Text>
        )
      },
      {
        Header: getString('common.policy.table.lastModified'),
        accessor: row => row.updated,
        width: '12%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text font={{ variation: FontVariation.BODY }}>
            <ReactTimeago date={row.original?.updated || 0} />
          </Text>
        )
      }
    ],
    [getString]
  )
  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || '0'), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || '0'), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])
  const history = useHistory()

  useEffect(() => {
    if (itemCount) {
      setPolicySetCount(itemCount)
    }
  }, [itemCount, setPolicySetCount])

  return (
    <Container className={css.tabContent}>
      {loading && (
        <Container width="100%" height="calc(100% - var(--pagination-height))" flex={{ align: 'center-center' }}>
          <ContainerSpinner />
        </Container>
      )}
      {error && (
        <PageError
          message={get(error, 'data.error', get(error, 'data.message', error?.message))}
          onClick={() => refetch()}
        />
      )}
      {!loading && !error && !data?.length && (
        <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
          <NoDataCard icon="governance" message={getString('governance.noPolicySetForPipeline')} />
        </Container>
      )}
      {!loading && !error && (data?.length as number) > 0 && (
        <Container className={css.tableContainer}>
          <Table<PolicySet>
            columns={columns}
            data={data || []}
            onRowClick={policySet => {
              // Policy Set detail page is not yet ready (no design)
              // history.push(routes.toPolicySetDetail({ accountId, policySetIdentifier: policySet.identifier as string }))
              history.push(
                routes.toGovernancePolicySetsListing({
                  accountId,
                  orgIdentifier: policySet.org_id,
                  projectIdentifier: policySet.project_id,
                  module
                })
              )
            }}
          />
        </Container>
      )}
      <Container className={css.pagination}>
        <Pagination
          itemCount={itemCount}
          pageSize={pageSize}
          pageCount={pageCount}
          pageIndex={pageIndex}
          gotoPage={setPageIndex}
        />
      </Container>
    </Container>
  )
}
