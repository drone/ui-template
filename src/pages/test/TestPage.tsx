import { Text, FontVariation } from '@wings-software/uicore'
import React from 'react'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings/String'
import { useGetPolicyList } from 'services/pm'
import css from './TestPage.module.scss'

export const TestPage: React.FC = () => {
  const { getString } = useStrings()
  const { loading, error, data } = useGetPolicyList({})

  if (loading) {
    return <Text>Loading...</Text>
  }

  if (error) {
    return <Text font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>{get(error, 'message', error)}</Text>
  }

  return (
    <>
      <h1>{getString('overview')}</h1>
      <div className={css.container}>This is a test page</div>

      {data && (
        <Text font={{ variation: FontVariation.YAML }} tag="pre">
          {JSON.stringify(data, null, 2)}
        </Text>
      )}
    </>
  )
}
