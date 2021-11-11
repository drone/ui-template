import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import {
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Text,
  Color,
  Intent,
  Radio,
  TableV2 as Table
} from '@wings-software/uicore'

import type { CellProps, Renderer, Column } from 'react-table'
import ReactTimeago from 'react-timeago'

import { useGetEvaluationList, Evaluation, GetEvaluationListQueryParams } from 'services/pm'
import { EvaluationStatus, LIST_FETCHING_PAGE_SIZE, setPageNumber } from 'utils/GovernanceUtils'
import { EvaluationStatusLabel } from 'components/EvaluationStatus/EvaluationStatusLabel'

import { useStrings } from 'framework/strings'

import css from './SelectInputModal.module.scss'

interface ExtentedGetEvaluationListQueryParams extends GetEvaluationListQueryParams {
  action?: string
}

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

const RenderEvaluatedon: Renderer<CellProps<Evaluation>> = ({ row }) => {
  const record = row.original

  return (
    <Text color={Color.BLACK} lineClamp={1}>
      <ReactTimeago date={record.created as number} />
    </Text>
  )
}

const RenderAction: Renderer<CellProps<Evaluation>> = ({ row }) => {
  const record = row.original
  const { getString } = useStrings()
  return (
    <Text color={Color.BLACK} lineClamp={1}>
      {record?.input?.action === 'onrun' ? getString('governance.onRun') : getString('governance.onSave')}
    </Text>
  )
}

const RenderStatus: Renderer<CellProps<Evaluation>> = ({ row }) => {
  const { getString } = useStrings()

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

const SelectInputModal: React.FC<{ handleOnSelect: (data: string) => void }> = props => {
  const [page, setPage] = useState(0)
  const { accountId, orgIdentifier = '*', projectIdentifier = '*' } = useParams<Record<string, string>>()
  const [action, setAction] = useState<string>()
  const [pageIndex, setPageIndex] = useState(0)

  const queryParams: ExtentedGetEvaluationListQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      action,
      per_page: String(LIST_FETCHING_PAGE_SIZE),
      page: String(pageIndex)
    }),
    [accountId, orgIdentifier, projectIdentifier, pageIndex, action]
  )

  const { data: evaluationsList, response } = useGetEvaluationList({
    queryParams
  })
  const [isEvaluationTableVisible, setEvalTableVisibility] = useState(false)

  const { getString } = useStrings()

  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || '0'), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || '0'), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: 1000 })
  }, [evaluationsList, page])

  const columns: Column<Evaluation>[] = useMemo(
    () => [
      {
        id: 'enabled',
        accessor: 'id',
        width: '5%',
        disableSortBy: true,
        // eslint-disable-next-line react/display-name
        Cell: ({ row }) => {
          return (
            <Radio
              className={css.radioSelector}
              name={'selector'}
              onChange={() => {
                props?.handleOnSelect(JSON.stringify(row?.original?.input) || '')
                // handleSelectChange(event.currentTarget.checked, row.original.identifier)
              }}
            />
          )
        }
      },
      {
        Header: 'Entity',
        accessor: row => row,
        width: '30%',
        Cell: RenderPipelineName
      },

      //   {
      //     Header: 'Execution',
      //     accessor: row => row,
      //     width: '30%',
      //     Cell: RenderPolicySets
      //   },
      {
        Header: 'Evaluated on',
        accessor: row => row,
        width: '30%',
        Cell: RenderEvaluatedon
      },
      {
        Header: 'Action',
        accessor: row => row,
        width: '20%',
        Cell: RenderAction
      },
      {
        Header: 'Status',
        accessor: row => row,
        width: '15%',
        Cell: RenderStatus
      }
    ],
    []
  )

  return (
    <>
      <Layout.Vertical>
        <Layout.Horizontal>
          <Formik
            enableReinitialize={true}
            formName="CreatePolicySet"
            initialValues={{
              type: '',
              action: '',
              event: ''
            }}
            onSubmit={() => {
              noop
            }}
            validate={(values: { type: string; action: string; event: string }) => {
              if (values?.type == 'pipeline' && values?.action && values?.event == 'evaluation') {
                setAction(values?.action)
                setEvalTableVisibility(true)
              } else {
                setEvalTableVisibility(false)
              }
            }}>
            {() => {
              return (
                <FormikForm>
                  <Layout.Horizontal spacing="small">
                    <FormInput.Select
                      items={[{ label: 'Pipeline', value: 'pipeline' }]}
                      label={'Entity Type'}
                      name="type"
                      disabled={false}
                    />
                    <FormInput.Select
                      items={[{ label: 'Pipeline Evaluation', value: 'evaluation' }]}
                      label={'Event Type'}
                      name="event"
                      disabled={false}
                    />
                    <FormInput.Select
                      items={[
                        { label: 'On Run', value: 'onrun' },
                        { label: 'On Save', value: 'onsave' }
                      ]}
                      label={'Action'}
                      name="action"
                      disabled={false}
                    />
                  </Layout.Horizontal>
                </FormikForm>
              )
            }}
          </Formik>
        </Layout.Horizontal>
      </Layout.Vertical>
      <Layout.Vertical>
        {isEvaluationTableVisible && evaluationsList?.length !== 0 && (
          <Layout.Horizontal>
            <Table<Evaluation>
              className={css.table}
              columns={columns}
              data={evaluationsList as Evaluation[]}
              pagination={{
                itemCount,
                pageSize,
                pageCount,
                pageIndex,
                gotoPage: (index: number) => {
                  setPageIndex(index)
                }
              }}
            />
          </Layout.Horizontal>
        )}
        {isEvaluationTableVisible && evaluationsList?.length == 0 && (
          <Layout.Horizontal flex style={{ justifyContent: 'center', alignItems: 'center', height: '350px' }}>
            {getString('common.policy.noPolicyEvalResult')}
          </Layout.Horizontal>
        )}
        {!isEvaluationTableVisible && (
          <Layout.Horizontal flex style={{ justifyContent: 'center', alignItems: 'center', height: '350px' }}>
            {getString('common.policy.noSelectInput')}
          </Layout.Horizontal>
        )}
      </Layout.Vertical>
    </>
  )
}

export default SelectInputModal
