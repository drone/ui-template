/* eslint-disable react/display-name */
import React, { useState, useMemo } from 'react'
import * as moment from 'moment'
import {
  ButtonVariation,
  Layout,
  Button,
  Text,
  Color,
  Utils,
  PageHeader,
  useToaster,
  useConfirmationDialog,
  Page,
  TableV2 as Table
} from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { useStrings } from 'framework/strings'
import { Policy, useDeletePolicy, useGetPolicyList } from 'services/pm'
import { OptionsMenuButton } from 'components/OptionsMenuButton/OptionsMenuButton'
import routes from 'RouteDefinitions'
import { getErrorMessage, LIST_FETCHING_PAGE_SIZE, DEFAULT_DATE_FORMAT } from 'utils/GovernanceUtils'
import type { GovernancePathProps } from 'RouteUtils'
import PolicyIcon from './Policy.svg'
import css from './Policies.module.scss'

const Policies: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<GovernancePathProps>()
  const { getString } = useStrings()

  const [pageIndex, setPageIndex] = useState(0)
  // const [searchTerm, setsearchTerm] = useState<string>('')
  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      per_page: String(LIST_FETCHING_PAGE_SIZE),
      page: String(pageIndex)
    }),
    [accountId, pageIndex, orgIdentifier, projectIdentifier]
  )

  const { data: policyList, loading: fetchingPolicies, error, refetch, response } = useGetPolicyList({ queryParams })
  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || '0'), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || '0'), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])
  const history = useHistory()

  const newUserGroupsBtn = (): JSX.Element => {
    const pathname = routes.toGovernanceNewPolicy({ accountId, orgIdentifier, projectIdentifier, module })

    return (
      <Button
        text={getString('common.policy.newPolicy')}
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        onClick={() => {
          history.push({ pathname })
        }}
      />
    )
  }

  const getValue = (value: number): string | null => {
    return value ? moment.unix(value / 1000).format(DEFAULT_DATE_FORMAT) : null
  }

  const columns: Column<Policy>[] = useMemo(
    () => [
      {
        Header: getString('common.policy.table.name'),
        accessor: row => row.name,
        width: '45%',
        Cell: ({ row }: CellProps<Policy>) => {
          const record = row.original
          return (
            <Layout.Horizontal spacing="small" flex style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <img src={PolicyIcon} height="22" />
              <Text color={Color.BLACK} lineClamp={1} font={{ weight: 'semi-bold' }}>
                {record.name}
              </Text>
            </Layout.Horizontal>
          )
        }
      },
      {
        Header: getString('common.policy.table.createdAt'),
        accessor: row => row.updated,
        width: '25%',
        Cell: ({ row }: CellProps<Policy>) => {
          const record = row.original
          return (
            <Text color={Color.BLACK} lineClamp={1}>
              {getValue(record.created || 0)}
            </Text>
          )
        }
      },
      {
        Header: getString('common.policy.table.lastModified'),
        accessor: row => row.updated,
        width: '25%',
        Cell: ({ row }: CellProps<Policy>) => {
          const record = row.original
          return (
            <Text color={Color.BLACK} lineClamp={1}>
              {getValue(record.updated || 0)}
            </Text>
          )
        }
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.identifier,
        width: '5%',
        Cell: ({ row }: CellProps<Policy>) => {
          const data = row
          const { showSuccess, showError } = useToaster()
          const { mutate: deletePolicy } = useDeletePolicy({ queryParams })
          const { openDialog: openDeleteDialog } = useConfirmationDialog({
            contentText: getString('governance.deleteConfirmation', { name: data.original.name }),
            titleText: getString('governance.deleteTitle'),
            confirmButtonText: getString('delete'),
            cancelButtonText: getString('cancel'),
            onCloseDialog: async didConfirm => {
              if (didConfirm && data) {
                try {
                  await deletePolicy(data.original.identifier as string)
                  showSuccess(getString('governance.deleteDone', { name: data.original.name }))
                  refetch()
                } catch (err) {
                  showError(getErrorMessage(err))
                }
              }
            }
          })

          return (
            <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} onClick={Utils.stopEvent}>
              <OptionsMenuButton
                items={[
                  {
                    icon: 'edit',
                    text: getString('edit'),
                    onClick: () => {
                      history.push(
                        routes.toGovernanceEditPolicy({
                          accountId,
                          orgIdentifier,
                          projectIdentifier,
                          module,
                          policyIdentifier: data?.original?.identifier as string
                        })
                      )
                    }
                  },
                  {
                    icon: 'trash',
                    text: getString('delete'),
                    onClick: openDeleteDialog
                  }
                ]}
              />
            </Layout.Horizontal>
          )
        },
        disableSortBy: true
      }
    ],
    [getString, accountId, history, refetch, queryParams, orgIdentifier, projectIdentifier, module]
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>}
        // toolbar={
        //   <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
        //     <ExpandingSearchInput
        //       alwaysExpanded
        //       placeholder={getString('common.policy.policySearch')}
        //       onChange={text => {
        //         setsearchTerm(text.trim())
        //         setPage(0)
        //       }}
        //       width={250}
        //     />
        //   </Layout.Horizontal>
        // }
      />
      <Page.Body
        loading={fetchingPolicies}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={{
          when: () => !policyList?.length,
          icon: 'nav-project',
          message: getString('common.policy.noPolicy'),
          button: newUserGroupsBtn()
        }}>
        <Table<Policy>
          className={css.table}
          columns={columns}
          data={policyList || []}
          onRowClick={data => {
            history.push(
              routes.toGovernanceEditPolicy({
                accountId,
                orgIdentifier,
                projectIdentifier,
                module,
                policyIdentifier: data?.identifier as string
              })
            )
          }}
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
      </Page.Body>
    </>
  )
}

export default Policies
