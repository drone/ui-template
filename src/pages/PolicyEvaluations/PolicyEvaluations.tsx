import React, { useState, useEffect, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
// import * as moment from 'moment'
import { Page, Text, Color, Layout, Intent, Button, Container, TableV2 as Table } from '@wings-software/uicore'
// import { useGet } from 'restful-react'
import ReactTimeago from 'react-timeago'
import { Position, PopoverInteractionKind, Popover } from '@blueprintjs/core'
import type { CellProps, Renderer, Column } from 'react-table'
import { useStrings } from 'framework/strings'
// import { StringUtils } from '@common/exports'

// import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
// import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { setPageNumber } from 'utils/GovernanceUtils'
import routes from 'RouteDefinitions'

import { useGetEvaluationList, Evaluation, EvaluationDetail } from 'services/pm'
import { EvaluationStatus, LIST_FETCHING_PAGE_SIZE, QUERY_PARAM_VALUE_ALL } from 'utils/GovernanceUtils'
import { EvaluationStatusLabel } from 'components/EvaluationStatus/EvaluationStatusLabel'
import type { GovernancePathProps } from 'RouteUtils'
import css from './PolicyEvaluations.module.scss'

const PolicyEvaluations: React.FC = () => {
  const { getString } = useStrings()
  const [pageIndex, setPageIndex] = useState(0)
  const {
    accountId,
    orgIdentifier = QUERY_PARAM_VALUE_ALL,
    projectIdentifier = QUERY_PARAM_VALUE_ALL,
    module
  } = useParams<GovernancePathProps>()
  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      per_page: String(LIST_FETCHING_PAGE_SIZE),
      page: String(pageIndex)
    }),
    [accountId, orgIdentifier, projectIdentifier, pageIndex]
  )
  const history = useHistory()
  // useDocumentTitle(getString('common.policies'))
  const [page, setPage] = useState(0)

  const {
    data: evaluationsList,
    loading: fetchingEvaluations,
    error,
    refetch,
    response
  } = useGetEvaluationList({ queryParams })

  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || '0'), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || '0'), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: 1000 })
  }, [evaluationsList, page])

  const RenderPipelineName: Renderer<CellProps<Evaluation>> = ({ row }) => {
    const record = row.original

    return (
      <Layout.Vertical spacing="small">
        <Text color={Color.BLACK} lineClamp={1} font={{ weight: 'semi-bold' }}>
          {record.input?.pipeline?.name}
        </Text>
        <Text color={Color.BLACK} lineClamp={1}>
          {record?.input?.pipeline?.projectIdentifier} / {record?.input?.pipeline?.orgIdentifier}
        </Text>
      </Layout.Vertical>
    )
  }

  const RenderEntityType: Renderer<CellProps<Evaluation>> = () => {
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {'Pipeline'}
      </Text>
    )
  }

  const RenderEvaluatedon: Renderer<CellProps<Evaluation>> = ({ row }) => {
    const record = row.original

    return (
      <Text color={Color.BLACK} lineClamp={1}>
        <ReactTimeago date={record.created as number} />
      </Text>
    )
  }

  const RenderPolicySets: Renderer<CellProps<Evaluation>> = ({ row }) => {
    const record = row.original
    const [menuOpen, setMenuOpen] = React.useState(false)
    const firstRecord = record?.details?.[0]
    const totalRecords = (record?.details?.length || 1) - 1

    return (
      <>
        {record?.details?.length && (
          <span key={'first-record'} className={css.pill}>
            {firstRecord?.name}
          </span>
        )}
        {!record?.details && <span>{getString('common.policiesSets.noPolicySets')}</span>}
        {totalRecords > 0 && (
          <Popover
            isOpen={menuOpen}
            usePortal={true}
            onInteraction={nextOpenState => {
              setMenuOpen(nextOpenState)
            }}
            interactionKind={PopoverInteractionKind.HOVER}
            popoverClassName={css.popoverSets}
            position={Position.BOTTOM_RIGHT}
            content={
              <Container padding={'medium'}>
                {record?.details?.map((data: EvaluationDetail, index: number) => {
                  if (index > 0) {
                    return (
                      <span key={(data.name || '') + index} className={css.pill}>
                        {data.name}
                      </span>
                    )
                  }
                })}
              </Container>
            }>
            <Button
              minimal
              inline
              intent={'primary'}
              onClick={e => {
                e.stopPropagation()
                setMenuOpen(true)
              }}>
              +{totalRecords} more
            </Button>
          </Popover>
        )}
      </>
    )
  }

  const RenderAction: Renderer<CellProps<Evaluation>> = ({ row }) => {
    const record = row.original

    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {record?.input?.action === 'onrun' ? getString('governance.onRun') : getString('governance.onSave')}
      </Text>
    )
  }

  const RenderStatus: Renderer<CellProps<Evaluation>> = ({ row }) => {
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
    return (
      <>
        <EvaluationStatusLabel intent={policySetOutcomeIntent} label={policySetOutcomeLabel.toUpperCase()} />
      </>
    )
  }

  const columns: Column<Evaluation>[] = useMemo(
    () => [
      {
        Header: 'Entity',
        accessor: row => row,
        width: '20%',
        Cell: RenderPipelineName
      },
      {
        Header: 'Entity Type',
        accessor: row => row,
        width: '13%',
        Cell: RenderEntityType
      },
      {
        Header: 'Execution',
        accessor: row => row,
        width: '30%',
        Cell: RenderPolicySets
      },
      {
        Header: 'Evaluated on',
        accessor: row => row,
        width: '20%',
        Cell: RenderEvaluatedon
      },
      {
        Header: 'Action',
        accessor: row => row,
        width: '10%',
        Cell: RenderAction
      },
      {
        Header: 'Status',
        accessor: row => row,
        width: '7%',
        Cell: RenderStatus
      }
    ],
    []
  )

  return (
    <>
      <Page.Body
        className={css.pageBody}
        loading={fetchingEvaluations}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={{
          when: () => !evaluationsList?.length,
          icon: 'nav-project',
          message: getString('common.policy.noPolicyEvalResult')
        }}>
        <Table<Evaluation>
          className={css.table}
          columns={columns}
          data={evaluationsList as Evaluation[]}
          // TODO: enable when page is ready

          pagination={{
            itemCount,
            pageSize,
            pageCount,
            pageIndex,
            gotoPage: (index: number) => {
              setPageIndex(index)
            }
          }}
          onRowClick={evaluation => {
            history.push(
              routes.toGovernanceEvaluationDetail({
                accountId,
                orgIdentifier: orgIdentifier !== QUERY_PARAM_VALUE_ALL ? orgIdentifier : undefined,
                projectIdentifier: projectIdentifier !== QUERY_PARAM_VALUE_ALL ? projectIdentifier : undefined,
                module,
                evaluationId: String(evaluation.id)
              })
            )
          }}
        />
      </Page.Body>
    </>
  )
}

export default PolicyEvaluations
