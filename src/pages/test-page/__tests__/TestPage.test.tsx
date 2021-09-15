import React from 'react'
import { render } from '@testing-library/react'
import { TestPage } from '../TestPage'

describe('Test TestPage', () => {
  test('Test rendering', () => {
    const { container } = render(<TestPage />)
    expect(container).toMatchSnapshot()
  })
})
