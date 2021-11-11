/* eslint-disable react/display-name */
import React, { useState, useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { get } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import {
  Container,
  FontVariation,
  PageError,
  Text,
  IconName,
  Intent,
  Pagination,
  NoDataCard,
  TableV2 as Table
} from '@wings-software/uicore'
import { Evaluation, GetEvaluationListQueryParams, PolicySet, useGetEvaluationList } from 'services/pm'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from 'components/ContainerSpinner/ContainerSpinner'
import routes from 'RouteDefinitions'
import type { GovernancePathProps } from 'RouteUtils'
import type { StringsContextValue } from 'framework/strings/StringsContext'
import { EvaluationStatusLabel } from 'components/EvaluationStatus/EvaluationStatusLabel'
import { EvaluationStatus, PipleLineEvaluationEvent, LIST_FETCHING_PAGE_SIZE } from 'utils/GovernanceUtils'
import css from './PipelineGovernanceView.module.scss'

const policyEvaluationActionIcon = (action?: string): IconName => {
  return action === PipleLineEvaluationEvent.ON_RUN ? 'run-pipeline' : 'send-data'
}

const evaluationNameFromAction = (getString: StringsContextValue['getString'], action?: string): string => {
  return getString?.(action === PipleLineEvaluationEvent.ON_RUN ? 'governance.onRun' : 'governance.onSave') || ''
}

export const EvaluationsTab: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const { accountId, orgIdentifier, projectIdentifier, pipelineIdentifier, module } = useParams<
    GovernancePathProps & { pipelineIdentifier: string }
  >()
  const entity = `accountIdentifier:${accountId}/orgIdentifier:${orgIdentifier}/projectIdentifier:${projectIdentifier}/pipelineIdentifier:${pipelineIdentifier}`
  const queryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      entity: encodeURIComponent(entity),
      per_page: String(LIST_FETCHING_PAGE_SIZE),
      page: String(pageIndex),
      include_hierarchy: true
    } as GetEvaluationListQueryParams
  }, [accountId, orgIdentifier, projectIdentifier, entity, pageIndex])
  const { data, loading, error, refetch, response } = useGetEvaluationList({ queryParams })
  const { getString } = useStrings()
  const columns: Column<Evaluation>[] = useMemo(
    () => [
      {
        Header: getString('governance.event').toLocaleUpperCase(),
        accessor: row => row.type,
        width: '65%',
        Cell: ({ row }: CellProps<Evaluation>) => (
          <Text
            icon={policyEvaluationActionIcon(row.original.action)}
            iconProps={{ padding: { right: 'small' } }}
            font={{ variation: FontVariation.BODY2 }}>
            {evaluationNameFromAction(getString, row.original.action)}
          </Text>
        )
      },
      {
        Header: getString('governance.evaluatedOn').toLocaleUpperCase(),
        accessor: row => row.created,
        width: '20%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text font={{ variation: FontVariation.BODY }}>
            <ReactTimeago date={row.original?.created || 0} />
          </Text>
        )
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: row => row.status,
        width: '15%',
        Cell: ({ row }: CellProps<Evaluation>) => {
          let policySetOutcomeIntent: Intent = Intent.DANGER
          let policySetOutcomeLabel = getString('failed')

          switch (row.original.status) {
            case EvaluationStatus.PASS:
              policySetOutcomeIntent = Intent.SUCCESS
              policySetOutcomeLabel = getString('success')
              break
            case EvaluationStatus.WARNING:
              policySetOutcomeIntent = Intent.WARNING
              policySetOutcomeLabel = getString('governance.warning')
              break
          }

          return <EvaluationStatusLabel intent={policySetOutcomeIntent} label={policySetOutcomeLabel.toUpperCase()} />
        }
      }
    ],
    [getString]
  )
  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || '0'), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || '0'), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])
  const history = useHistory()

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
          <NoDataCard icon="governance" message={getString('governance.noEvaluationForPipeline')} />
        </Container>
      )}
      {!loading && !error && (data?.length as number) > 0 && (
        <Container className={css.tableContainer}>
          <Table<Evaluation>
            columns={columns}
            data={data || []}
            onRowClick={evaluation => {
              history.push(
                routes.toGovernanceEvaluationDetail({
                  accountId,
                  orgIdentifier: evaluation.org_id,
                  projectIdentifier: evaluation.project_id,
                  module,
                  evaluationId: String(evaluation.id)
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
