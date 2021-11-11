import React, { useEffect, useMemo } from 'react'
import { get } from 'lodash-es'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { Page } from '@wings-software/uicore'
import { useGetEvaluation } from 'services/pm'
import { getErrorMessage, PipleLineEvaluationEvent, QUERY_PARAM_VALUE_ALL } from 'utils/GovernanceUtils'
import { EvaluationView } from 'views/EvaluationView/EvaluationView'
import type { StringsContextValue } from 'framework/strings/StringsContext'
import { useStrings } from 'framework/strings'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'

const evaluationNameFromAction = (getString: StringsContextValue['getString'], action?: string): string => {
  return getString?.(action === PipleLineEvaluationEvent.ON_RUN ? 'governance.onRun' : 'governance.onSave') || ''
}

export const EvaluationDetail: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, evaluationId } = useParams<GovernancePathProps>()
  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier || QUERY_PARAM_VALUE_ALL,
      projectIdentifier: projectIdentifier || QUERY_PARAM_VALUE_ALL
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )
  const history = useHistory()
  const location = useLocation()
  const { data, refetch, loading, error } = useGetEvaluation({ queryParams, evaluation: evaluationId as string })
  const entityMetadata = useMemo(() => {
    if (data?.entity_metadata) {
      try {
        return JSON.parse(decodeURIComponent(data.entity_metadata as string))
      } catch {
        // eslint-disable-line no-empty
      }
    }
  }, [data])

  useEffect(() => {
    if (data && entityMetadata) {
      const pageTitle = `${get(entityMetadata, 'pipelineName')} - ${evaluationNameFromAction(
        getString,
        data.action as string
      )} (${new Date(data.created as number).toLocaleString()})`
      history.replace({ pathname: location.pathname, search: `pageTitle=${pageTitle}` })
    }
  }, [entityMetadata]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Page.Body
      loading={loading}
      error={getErrorMessage(error)}
      retryOnError={() => refetch()}
      filled
      noData={{
        when: () => !data?.details || data?.details?.length === 0,
        icon: 'governance',
        noIconColor: true,
        message: getString('governance.evaluationEmpty')
      }}>
      {data && (
        <EvaluationView
          metadata={data}
          accountId={accountId}
          module={module || entityMetadata?.module}
          headingErrorMessage={getString('governance.failureHeadingEvaluationDetail')}
        />
      )}
    </Page.Body>
  )
}
