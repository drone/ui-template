import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from 'utils/testUtils'
import { TestPage } from '../TestPage'

describe('Test TestPage', () => {
  test('Test rendering', () => {
    const { container } = render(
      <TestWrapper>
        <TestPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
