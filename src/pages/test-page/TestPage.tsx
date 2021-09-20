import React from 'react'
import { useStrings } from '../../framework/strings/String'
import css from './TestPage.module.scss'

export const TestPage: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <h1>Hello World 1 {getString('harness')}</h1>
      <div className={css.container}>This is a test page</div>
    </>
  )
}
