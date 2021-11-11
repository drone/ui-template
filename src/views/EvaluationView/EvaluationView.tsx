import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { get } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Layout,
  Text,
  Intent,
  Utils
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import routes from 'RouteDefinitions'
import type { Evaluation, EvaluationDetails, EvaluatedPolicy } from 'services/pm'
import { EvaluationStatus, evaluationStatusToColor } from 'utils/GovernanceUtils'
import { EvaluationStatusLabel } from '../../components/EvaluationStatus/EvaluationStatusLabel'
import css from './EvaluationView.module.scss'

export interface EvaluationViewProps {
  accountId: string
  module?: Module

  // data from Pipeline execution's governanceMetadata and from OPA execution API is
  // slightly different. Hence this field has type unknown and will be converted to correct
  // data types depends on where this component is used (in Pipeline or in Governance)
  // @see https://harness.slack.com/archives/C029RA4PFJT/p1635106132101700?thread_ts=1634943427.098500&cid=C029RA4PFJT
  metadata: unknown

  headingErrorMessage?: string

  noDetailColumn?: boolean
}

const enum SortBy {
  NAME = 'NAME',
  STATUS = 'STATUS'
}

const enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  accountId,
  module: _module,
  metadata: _metadata,
  headingErrorMessage,
  noDetailColumn = false
}) => {
  const { getString } = useStrings()
  const history = useHistory()
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())
  const metadata = _metadata as Evaluation
  const failure = metadata.status === EvaluationStatus.ERROR
  const warning = metadata.status === EvaluationStatus.WARNING
  const details = get(metadata, 'details') as EvaluationDetails
  const timestamp = Number(get(metadata, 'timestamp') || 0)
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.STATUS)
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC)
  const toggleSortBy = useCallback(
    (column: SortBy) => {
      if (column !== sortBy) {
        setSortBy(sortBy === SortBy.NAME ? SortBy.STATUS : SortBy.NAME)
      } else {
        setSortDirection(sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC)
      }
    },
    [setSortBy, sortBy, setSortDirection, sortDirection]
  )
  const sortedDetails = useMemo(
    () =>
      details?.sort((a, b) => {
        const SORT_LEFT = sortDirection === SortDirection.ASC ? 1 : -1
        const SORT_RIGHT = sortDirection === SortDirection.ASC ? -1 : 1

        if (sortBy === SortBy.STATUS) {
          return (a.status as string).toLowerCase() > (b.status as string).toLowerCase() ? SORT_LEFT : SORT_RIGHT
        } else {
          const aName = get(a, 'name') || get(a, 'policySetName')
          const bName = get(b, 'name') || get(b, 'policySetName')

          return (aName as string).toLowerCase() > (bName as string).toLowerCase() ? SORT_LEFT : SORT_RIGHT
        }
      }),
    [details, sortBy, sortDirection]
  )
  // Note: This is a hack to build proper OPA links as module info is missing in the evaluation
  // @see https://harness.slack.com/archives/C029RA4PFJT/p1636491331284300
  const hasModule = (mod: string): boolean => !!document.querySelector(`[href$="/${mod}"][href^="#/account/"]`)
  const getModule = (orgIdentifier: string, projectIdentifier: string): Module | undefined => {
    if (orgIdentifier && projectIdentifier) {
      return hasModule('cd') ? 'cd' : hasModule('ci') ? 'ci' : undefined
    }
  }

  useEffect(() => {
    // Always expand if there's only one item
    if (details?.length === 1) {
      setExpandedSets(new Set([details[0].identifier as string]))
    }
  }, [details])

  return (
    <Container padding="xlarge">
      {/* Alert on top */}
      <Text
        data-status={failure ? Color.RED_100 : warning ? Color.ORANGE_100 : Color.GREEN_100}
        style={{
          background: Utils.getRealCSSColor(failure ? Color.RED_100 : warning ? Color.ORANGE_100 : Color.GREEN_100)
        }}
        icon={failure || warning ? 'warning-sign' : 'tick-circle'}
        iconProps={{ style: { color: failure ? 'var(--red-500)' : warning ? 'var(--warning)' : 'var(--green-500)' } }}
        font={{ variation: FontVariation.BODY1 }}
        padding="small">
        {failure
          ? headingErrorMessage || getString('governance.failureHeading')
          : warning
          ? getString('governance.warningHeading')
          : getString('governance.successHeading')}
      </Text>

      {/* Evaluation time */}
      {(timestamp && (
        <Text margin={{ top: 'large' }} font={{ variation: FontVariation.UPPERCASED }}>
          {getString('governance.evaluatedTime')}
          <ReactTimeago date={timestamp} live />
        </Text>
      )) ||
        null}

      {/* Detail header */}
      <Layout.Horizontal margin={{ top: 'large', bottom: 'medium' }}>
        <Text
          className={css.columHeader}
          font={{ variation: FontVariation.TABLE_HEADERS }}
          style={{ flexGrow: 1 }}
          role="button"
          tabIndex={0}
          rightIcon={
            sortBy === SortBy.NAME ? (sortDirection === SortDirection.ASC ? 'caret-up' : 'caret-down') : undefined
          }
          onClick={() => toggleSortBy(SortBy.NAME)}>
          {getString('common.policiesSets.table.name').toUpperCase()}
        </Text>
        <Text
          className={css.columHeader}
          width={200}
          font={{ variation: FontVariation.TABLE_HEADERS }}
          role="button"
          tabIndex={0}
          rightIcon={
            sortBy === SortBy.STATUS ? (sortDirection === SortDirection.ASC ? 'caret-up' : 'caret-down') : undefined
          }
          onClick={() => toggleSortBy(SortBy.STATUS)}>
          {getString('status').toUpperCase()}
        </Text>
        <Text width={100} font={{ variation: FontVariation.TABLE_HEADERS }}>
          {(!noDetailColumn && getString('details').toUpperCase()) || ''}
        </Text>
      </Layout.Horizontal>

      {/* Data content */}
      {sortedDetails?.map(policySet => {
        const { status: policySetStatus, identifier = '' } = policySet
        const policySetName = get(policySet, 'name') || get(policySet, 'policySetName')
        const policyMetadata = get(policySet, 'details') || (get(policySet, 'policyMetadata') as EvaluatedPolicy[])
        let policySetOutcomeIntent: Intent = Intent.DANGER
        let policySetOutcomeLabel = getString('failed')

        switch (policySetStatus) {
          case EvaluationStatus.PASS:
            policySetOutcomeIntent = Intent.SUCCESS
            policySetOutcomeLabel = getString('success')
            break
          case EvaluationStatus.WARNING:
            policySetOutcomeIntent = Intent.WARNING
            policySetOutcomeLabel = getString('governance.warning')
            break
        }

        return (
          <Layout.Horizontal
            key={identifier}
            padding="large"
            margin={{ bottom: 'medium' }}
            className={css.policySetItem}
            spacing="small">
            <Button
              variation={ButtonVariation.ICON}
              icon={expandedSets.has(identifier) ? 'main-chevron-up' : 'main-chevron-down'}
              onClick={() => {
                if (expandedSets.has(identifier)) {
                  expandedSets.delete(identifier)
                } else {
                  expandedSets.add(identifier)
                }
                setExpandedSets(new Set(expandedSets))
              }}
            />

            <Container style={{ flexGrow: 1 }}>
              <Layout.Horizontal spacing="xsmall" className={expandedSets.has(identifier) ? css.firstRow : ''}>
                <Text font={{ variation: FontVariation.BODY2 }} className={css.policySetName}>
                  {getString('governance.policySetName', { name: policySetName || identifier })}
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.status}>
                  <EvaluationStatusLabel intent={policySetOutcomeIntent} label={policySetOutcomeLabel.toUpperCase()} />
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.details}>
                  {!noDetailColumn && (
                    <Button
                      variation={ButtonVariation.ICON}
                      icon="main-link"
                      onClick={() => {
                        const orgIdentifier = get(policySet, 'org_id') || get(policySet, 'orgId')
                        const projectIdentifier = get(policySet, 'project_id') || get(policySet, 'projectId')
                        const module = _module || getModule(orgIdentifier, projectIdentifier)

                        history.push(
                          routes.toGovernancePolicySetsListing({
                            accountId,
                            orgIdentifier,
                            projectIdentifier,
                            module,
                            policyIdentifier: identifier
                          })
                        )
                      }}
                    />
                  )}
                </Text>
              </Layout.Horizontal>

              {expandedSets.has(identifier) && (
                <>
                  {!policyMetadata?.length && (
                    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} padding={{ top: 'medium' }}>
                      {getString('governance.emptyPolicySet')}
                    </Text>
                  )}
                  {policyMetadata?.map(evaluatedPolicy => {
                    const { status = '', deny_messages, policy } = evaluatedPolicy
                    const policyName = policy?.name || get(evaluatedPolicy, 'policyName')
                    const policyIdentifier = policy?.identifier || get(evaluatedPolicy, 'identifier')
                    const denyMessages =
                      deny_messages || (get(evaluatedPolicy, 'denyMessages') as EvaluatedPolicy['deny_messages'])

                    let policyOutcomeIntent: Intent = Intent.SUCCESS
                    let policyOutcomeLabel = getString('success')

                    switch (status) {
                      case EvaluationStatus.ERROR:
                        policyOutcomeIntent = Intent.DANGER
                        policyOutcomeLabel = getString('failed')
                        break
                      case EvaluationStatus.WARNING:
                        policyOutcomeIntent = Intent.WARNING
                        policyOutcomeLabel = getString('governance.warning')
                        break
                    }

                    const orgIdentifier = get(evaluatedPolicy, 'orgId') || policy?.org_id
                    const projectIdentifier = get(evaluatedPolicy, 'projectId') || policy?.project_id
                    const module = _module || getModule(orgIdentifier, projectIdentifier)

                    return (
                      <Layout.Horizontal spacing="xsmall" padding={{ top: 'medium' }} key={policyIdentifier}>
                        <Container width="calc(100% - 280px)">
                          <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_7}>
                            <Link
                              to={routes.toGovernanceEditPolicy({
                                accountId,
                                orgIdentifier,
                                projectIdentifier,
                                policyIdentifier,
                                module
                              })}>
                              {policyName}
                            </Link>
                          </Text>
                          {!!denyMessages?.length && (
                            <Layout.Horizontal
                              spacing="xsmall"
                              padding={{ left: 'xxxlarge', top: 'xsmall' }}
                              style={{ alignItems: 'center' }}>
                              <Text font={{ variation: FontVariation.UPPERCASED }}>{getString('details')}</Text>
                              <Container padding={{ left: 'small' }}>
                                {denyMessages.map(message => (
                                  <Text
                                    key={message}
                                    font={{ variation: FontVariation.BODY }}
                                    color={evaluationStatusToColor(status)}>
                                    {denyMessages?.length > 1 ? '- ' : ''}
                                    {message}
                                  </Text>
                                ))}
                              </Container>
                            </Layout.Horizontal>
                          )}
                        </Container>

                        <Text className={css.status} width={200}>
                          <EvaluationStatusLabel
                            intent={policyOutcomeIntent}
                            label={policyOutcomeLabel.toLocaleUpperCase()}
                          />
                        </Text>

                        <Text className={css.details} width={80}></Text>
                      </Layout.Horizontal>
                    )
                  })}
                </>
              )}
            </Container>
          </Layout.Horizontal>
        )
      })}
    </Container>
  )
}
