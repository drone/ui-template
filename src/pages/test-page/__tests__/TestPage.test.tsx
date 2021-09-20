import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper, mockImport } from 'utils/test/testUtils'
import { TestPage } from '../TestPage'

describe('Test TestPage', () => {
  test('Test loading', () => {
    mockImport('services/petstore', {
      useGetInventory: () => ({ loading: true, refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper>
        <TestPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Test error', () => {
    mockImport('services/petstore', {
      useGetInventory: () => ({ error: 'something wrong happened', refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper>
        <TestPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Test rendering data', () => {
    mockImport('services/petstore', {
      useGetInventory: () => ({ data: { foo: 'bar' }, refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper>
        <TestPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
