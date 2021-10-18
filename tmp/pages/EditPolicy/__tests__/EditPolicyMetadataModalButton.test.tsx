import React from 'react'
import { render, waitFor, getByText, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { EditPolicyMetadataModalButton } from '../EditPolicyMetadataModalButton'

describe('EditPolicyMetadataModalButton', () => {
  test('EditPolicyMetadataModalButton should render new Policy Modal correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const policyIdentifier = 'policyIdentifier1'
    const modalTitle = 'New Policy'
    const name = ''
    const description = ''
    const onApply = jest.fn()
    const onClose = jest.fn()

    const Component = (
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <EditPolicyMetadataModalButton
          isEdit={false}
          shouldOpenModal={false}
          identifier={policyIdentifier}
          modalTitle={modalTitle}
          name={name}
          description={description}
          onApply={onApply}
          onClose={onClose}
        />
      </TestWrapper>
    )
    const { container } = render(Component)

    const button = container.querySelector('button[type="button"]') as HTMLElement
    expect(button).toBeDefined()
    fireEvent.click(button)

    await waitFor(() => expect(getByText(document.body, modalTitle)).toBeDefined())
    await waitFor(() => expect(container.querySelector('input[name="name"]')).toBeDefined())
    await waitFor(() => expect(container.querySelector('label.descriptionLabel')).toBeDefined())
    await waitFor(() => expect(getByText(document.body, 'Apply')).toBeDefined())
    await waitFor(() => expect(getByText(document.body, 'Cancel')).toBeDefined())
  })

  test('EditPolicyMetadataModalButton should render edit Policy Modal correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const policyIdentifier = 'policyIdentifier1'
    const modalTitle = 'New Policy'
    const name = 'Test Name'
    const description = 'Test Description'
    const onApply = jest.fn()
    const onClose = jest.fn()

    const Component = (
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <EditPolicyMetadataModalButton
          isEdit={true}
          shouldOpenModal={true}
          identifier={policyIdentifier}
          modalTitle={modalTitle}
          name={name}
          description={description}
          onApply={onApply}
          onClose={onClose}
        />
      </TestWrapper>
    )
    const { container } = render(Component)

    await waitFor(() => expect(getByText(document.body, modalTitle)).toBeDefined())
    await waitFor(() => expect(container.querySelector(`input[value="${name}"]`)).toBeDefined())
    await waitFor(() => expect(container.querySelector('textarea')).toBeDefined())
  })
})
