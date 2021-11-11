import React, { useState, useMemo } from 'react'
import * as moment from 'moment'
import {
  ButtonVariation,
  // ExpandingSearchInput,
  Layout,
  Toggle,
  Button,
  Text,
  Color,
  useModalHook,
  PageHeader,
  Utils,
  TableV2 as Table,
  useToaster,
  useConfirmationDialog,
  Page
} from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer, Column } from 'react-table'
import { useUpdatePolicySet, useDeletePolicySet, useGetPolicySetList, PolicySetWithLinkedPolicies } from 'services/pm'
import { useStrings } from 'framework/strings'
// import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { OptionsMenuButton } from 'components/OptionsMenuButton/OptionsMenuButton'
import { getErrorMessage, LIST_FETCHING_PAGE_SIZE, DEFAULT_DATE_FORMAT } from 'utils/GovernanceUtils'
import PolicySetWizard from './components/PolicySetWizard'
import PolicyIcon from './PolicySetIcon.svg'
import css from './PolicySets.module.scss'

const PolicySets: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  // useDocumentTitle(getString('common.policies'))
  // const [, setPage] = useState(0)
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
    [accountId, orgIdentifier, projectIdentifier, pageIndex]
  )

  const [policySetData, setPolicySetData] = React.useState<any>()

  const modalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1080,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  }

  const {
    data: policyList,
    loading: fetchingPolicieSets,
    error,
    refetch,
    response
  } = useGetPolicySetList({
    queryParams
  })

  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || '0'), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || '0'), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])

  // useEffect(() => {
  //   setPageNumber({ setPage, page, pageItemsCount: totalPages * pageSize })
  // }, [policyList])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <PolicySetWizard hideModal={hideModal} refetch={refetch} policySetData={policySetData}></PolicySetWizard>
        <Button
          minimal
          className={css.closeIcon}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            refetch()
            hideModal()
          }}
        />
      </Dialog>
    ),
    [policySetData]
  )

  const newUserGroupsBtn = (): JSX.Element => (
    <Button
      text={getString('common.policiesSets.newPolicyset')}
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      onClick={() => {
        setPolicySetData({})
        showModal()
      }}
    />
  )

  const RenderPolicyName: Renderer<CellProps<PolicySetWithLinkedPolicies>> = ({ row }) => {
    const record = row.original
    return (
      <Layout.Horizontal
        spacing="small"
        flex
        style={{ alignItems: 'center', justifyContent: 'flex-start', cursor: 'pointer' }}>
        <img src={PolicyIcon} height="22" />
        <Text
          color={Color.BLACK}
          lineClamp={1}
          font={{ weight: 'semi-bold' }}
          onClick={() => {
            setPolicySetData(row.original)
            showModal()
          }}>
          {record.name}
        </Text>
      </Layout.Horizontal>
    )
  }

  const getValue = (value: number): string | null => {
    return value ? moment.unix(value / 1000).format(DEFAULT_DATE_FORMAT) : null
  }

  const RenderCreatedAt: Renderer<CellProps<PolicySetWithLinkedPolicies>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.created as number)}
      </Text>
    )
  }

  const RenderLastUpdated: Renderer<CellProps<PolicySetWithLinkedPolicies>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.updated as number)}
      </Text>
    )
  }

  const RenderEntityType: Renderer<CellProps<PolicySetWithLinkedPolicies>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {record.type}
      </Text>
    )
  }

  const RenderEnforced: Renderer<CellProps<PolicySetWithLinkedPolicies>> = ({ row }) => {
    const record = row.original
    // const id = '' + row.original.identifier
    const { mutate: updatePolicySet } = useUpdatePolicySet({
      policyset: String(row.original.identifier),
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      }
    })

    return (
      <Toggle
        checked={record.enabled}
        onToggle={async value => {
          const updatePayload = {
            action: row.original.action,
            enabled: value,
            name: row.original.name,
            type: row.original.type
          }
          await updatePolicySet(updatePayload)
          refetch()
        }}
      />
    )
  }

  const RenderAction: Renderer<CellProps<PolicySetWithLinkedPolicies>> = ({ row }) => {
    const record = row.original

    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {record?.action === 'onrun' ? getString('governance.onRun') : getString('governance.onSave')}
      </Text>
    )
  }

  const RenderColumnMenu: Renderer<CellProps<PolicySetWithLinkedPolicies>> = ({ row }) => {
    const data = row.original
    const { showSuccess, showError } = useToaster()
    const { mutate: deletePolicySet } = useDeletePolicySet({ queryParams })
    const { openDialog: openDeleteDialog } = useConfirmationDialog({
      contentText: getString('governance.deletePolicySetConfirmation', { name: data.name }),
      titleText: getString('governance.deletePolicySetTitle'),
      confirmButtonText: getString('delete'),
      cancelButtonText: getString('cancel'),
      onCloseDialog: async didConfirm => {
        if (didConfirm && data) {
          try {
            await deletePolicySet(data?.identifier?.toString() as string)
            showSuccess(getString('governance.deletePolicySetDone', { name: data.name }))
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
                setPolicySetData(row.original)
                showModal()
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
  }

  const columns: Column<PolicySetWithLinkedPolicies>[] = useMemo(
    () => [
      {
        Header: getString('common.policiesSets.table.name'),

        accessor: row => row.name,
        width: '35%',
        Cell: RenderPolicyName
      },
      {
        Header: getString('action'),
        accessor: row => row.action,
        width: '10%',
        Cell: RenderAction
      },
      {
        Header: getString('common.policiesSets.table.enforced'),

        accessor: row => row.enabled,
        width: '10%',
        Cell: RenderEnforced
      },
      {
        Header: getString('common.policiesSets.table.entityType'),

        accessor: row => row.type,
        width: '10%',
        Cell: RenderEntityType
      },
      {
        Header: getString('common.policy.table.createdAt'),

        accessor: row => row.updated,
        width: '20%',
        Cell: RenderCreatedAt
      },
      {
        Header: getString('common.policy.table.lastModified'),

        accessor: row => row.updated,
        width: '20%',
        Cell: RenderLastUpdated
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.identifier,
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true
      }
    ],
    [getString]
  )

  return (
    <>
      <PageHeader title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>} />
      <Page.Body
        loading={fetchingPolicieSets}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={{
          when: () => !policyList?.length,
          icon: 'nav-project',
          message: getString('common.policiesSets.noPolicySet'),
          button: newUserGroupsBtn()
        }}>
        <Table<PolicySetWithLinkedPolicies>
          className={css.table}
          columns={columns}
          data={policyList || []}
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

export default PolicySets
