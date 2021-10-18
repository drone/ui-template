//
// TODO: This file is just a place-holder
//
import React, { useState, useEffect, useMemo } from 'react'
// import * as moment from 'moment'
import { Text, Color, Layout, Icon } from '@wings-software/uicore'
// import { useParams } from 'react-router-dom'
// import { useGet } from 'restful-react'
import ReactTimeago from 'react-timeago'
import type { CellProps, Renderer, Column } from 'react-table'
import { useStrings } from 'framework/strings'
// import { StringUtils } from '@common/exports'
import { Page } from '@common/exports'

// import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { setPageNumber } from '@common/utils/utils'
import Table from '@common/components/Table/Table'

import { useGetEvaluationList, Evaluation, EvaluationDetail } from 'services/pm'
import { isEvaluationFailed } from '@policy/utils/PmUtils'

import css from './PolicyEvaluations.module.scss'

const PolicyEvaluations: React.FC = () => {
  const { getString } = useStrings()
  useDocumentTitle(getString('common.policies'))
  const [page, setPage] = useState(0)

  const { data: evaluationsList, loading: fetchingEvaluations, error, refetch } = useGetEvaluationList({})

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

    return (
      <>
        {record?.details?.map((data: EvaluationDetail, index: number) => {
          return (
            <span key={(data.name || '') + index} className={css.pill}>
              {data.name}
            </span>
          )
        })}
      </>
    )
  }

  const RenderAction: Renderer<CellProps<Evaluation>> = ({ row }) => {
    const record = row.original

    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {record?.input?.action === 'onrun' ? 'Run' : 'Save'}
      </Text>
    )
  }

  const RenderStatus: Renderer<CellProps<Evaluation>> = ({ row }) => {
    const record = row.original

    return (
      <>
        {isEvaluationFailed(record?.status) ? (
          <span className={css.pillDanger}>
            <Icon name="deployment-failed-new" size={12} style={{ marginRight: 'var(--spacing-small)' }} /> FAILED
          </span>
        ) : (
          <span className={css.pillSuccess}>
            <Icon name="tick-circle" size={12} style={{ marginRight: 'var(--spacing-small)' }} /> PASSED
          </span>
        )}
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
        loading={fetchingEvaluations}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={{
          when: () => !evaluationsList?.length,
          icon: 'nav-project',
          message: getString('common.policy.noPolicyResult')
        }}
      >
        <Table<Evaluation>
          className={css.table}
          columns={columns}
          data={evaluationsList as Evaluation[]}
          // TODO: enable when page is ready

          pagination={{
            itemCount: evaluationsList?.length || 0,
            pageSize: 1000,
            pageCount: 0,
            pageIndex: 0,
            gotoPage: (pageNumber: number) => setPage(pageNumber)
          }}
        />
      </Page.Body>
    </>
  )
}

export default PolicyEvaluations
