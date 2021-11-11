/* eslint-disable react/display-name,react-hooks/rules-of-hooks */
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { get } from 'lodash-es'
import {
  Button,
  useModalHook,
  ButtonProps,
  ButtonVariation,
  Text,
  FontVariation,
  Container,
  PageError,
  Layout,
  Icon,
  TableV2 as Table
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useGetexamples, Example } from 'services/pm'
import { ContainerSpinner } from 'components/ContainerSpinner/ContainerSpinner'
import { getErrorMessage } from 'utils/GovernanceUtils'

export interface SelectPolicyModalButtonProps {
  modalTitle: string
  onApply: (example: Example) => void
}

export const SelectPolicyModalButton: React.FC<SelectPolicyModalButtonProps & ButtonProps> = ({
  modalTitle,
  onApply,
  ...props
}) => {
  const [openModal, hideModal] = useModalHook(() => {
    const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
    const queryParams = useMemo(
      () => ({
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      }),
      [accountId, orgIdentifier, projectIdentifier]
    )
    const { data: examples, loading, error, refetch } = useGetexamples({ queryParams } as Record<string, unknown>)
    const { getString } = useStrings()

    const columns: Column<Example>[] = useMemo(
      () => [
        {
          Header: getString('common.policy.table.name'),
          accessor: item => get(item, 'name') || item.type,
          width: '80%',
          Cell: ({ row }: CellProps<Example>) => (
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <Icon name="governance" size={20} />
              <Container>
                <Layout.Vertical spacing="xsmall">
                  <Text font={{ variation: FontVariation.SMALL_BOLD }}>
                    {get(row.original, 'name') || row.original.type}
                  </Text>
                  <Text font={{ variation: FontVariation.SMALL }}>{get(row.original, 'desc') || ''}</Text>
                </Layout.Vertical>
              </Container>
            </Layout.Horizontal>
          )
        },
        {
          Header: getString('typeLabel'),
          accessor: item => item.type,
          width: '20%',
          Cell: ({ row }: CellProps<Example>) => (
            <Text font={{ variation: FontVariation.BODY }}>{row.original.type}</Text>
          )
        }
      ],
      [getString]
    )

    return (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={modalTitle}
        style={{ padding: 'none', width: 900 }}>
        <Container padding="medium" style={{ height: 500, overflow: 'auto' }}>
          {loading && <ContainerSpinner />}
          {error && <PageError message={getErrorMessage(error)} onClick={() => refetch()} />}
          {!error && !loading && examples && (
            <Table<Example>
              columns={columns}
              data={examples || []}
              onRowClick={example => {
                onApply(example)
                hideModal()
              }}
            />
          )}
        </Container>
      </Dialog>
    )
  }, [modalTitle, onApply])
  const { getString } = useStrings()

  return (
    <Button
      icon="folder-shared"
      variation={ButtonVariation.ICON}
      onClick={openModal}
      tooltip={getString('governance.selectSamplePolicy')}
      {...props}
    />
  )
}
