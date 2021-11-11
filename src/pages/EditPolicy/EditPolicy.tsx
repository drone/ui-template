import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import YAML from 'yaml'
import SplitPane from 'react-split-pane'
import cx from 'classnames'
import type { editor as EDITOR } from 'monaco-editor/esm/vs/editor/editor.api'
import {
  ButtonVariation,
  Layout,
  Button,
  Container,
  Color,
  Text,
  FontVariation,
  ButtonSize,
  FlexExpander,
  PageHeader,
  useModalHook,
  Dialog,
  Page
} from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import {
  showToaster,
  getErrorMessage,
  isEvaluationFailed,
  MonacoEditorOptions,
  deselectAllMonacoEditor
} from 'utils/GovernanceUtils'
import { useStrings } from 'framework/strings'
import routes from 'RouteDefinitions'
import { REGO_FORMAT } from 'utils/rego'
import { useCreatePolicy, useEvaluateRaw, useGetPolicy, useUpdatePolicy } from 'services/pm'
import type { GovernancePathProps } from 'RouteUtils'
import { EditPolicyMetadataModalButton } from './EditPolicyMetadataModalButton'
import type { PolicyMetadata } from './EditPolicyMetadataModalButton'
import { SelectPolicyModalButton } from './SelectPolicyModalButton'
import SelectInputModal from './SelectInputModal'
import css from './EditPolicy.module.scss'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PolicyTestOutputResponse = any

const EDITOR_GAP = 25
const PAGE_PADDING = 50

export const EditPolicy: React.FC = () => {
  const {
    accountId,
    module,
    policyIdentifier: policyIdentifierFromURL,
    orgIdentifier,
    projectIdentifier
  } = useParams<GovernancePathProps>()
  const queryParams = useMemo(
    () => ({ accountIdentifier: accountId, orgIdentifier, projectIdentifier }),
    [accountId, orgIdentifier, projectIdentifier]
  )
  const [isEdit, setEdit] = useState(!!policyIdentifierFromURL)
  const [policyIdentifier, setPolicyIdentifier] = useState(policyIdentifierFromURL)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [regoScript, setRegoScript] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<PolicyTestOutputResponse>()
  const [shouldOpenMetadataModal, setShouldOpenMetatDataModal] = useState(!isEdit)
  const isInputValid = useMemo(() => {
    if (!(input || '').trim() || !(regoScript || '').trim()) {
      return false
    }

    try {
      JSON.parse(input)
      return true
    } catch (error) {
      return false
    }
  }, [input, regoScript])
  const { mutate: createPolicy } = useCreatePolicy({ queryParams })
  const { mutate: evaluateRawPolicy } = useEvaluateRaw({ queryParams } as Record<string, unknown>)
  const [createPolicyLoading, setCreatePolicyLoading] = useState(false)
  const [testPolicyLoading, setTestPolicyLoading] = useState(false)
  const [regoEditor, setRegoEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const [inputEditor, setInputEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const [inputFromSource, setInputFromSource] = useState<string>()
  const [outputEditor, setOutputEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const history = useHistory()
  const { mutate: updatePolicy } = useUpdatePolicy({ policy: policyIdentifier as string, queryParams })
  const onSavePolicy = useCallback(() => {
    setCreatePolicyLoading(true)
    const api = isEdit ? updatePolicy : createPolicy
    api({
      identifier: policyIdentifier,
      name,
      // description, // TODO: description is not supported by API currently
      rego: regoScript
    })
      .then(response => {
        showToaster('Policy saved!')
        if (!isEdit) {
          setEdit(true)
          history.replace(
            routes.toGovernanceEditPolicy({
              accountId,
              orgIdentifier,
              projectIdentifier,
              module,
              policyIdentifier: String(response.identifier || '')
            })
          )
        }
      })
      .catch(error => {
        showToaster(getErrorMessage(error), { intent: Intent.DANGER, timeout: 0 })
      })
      .finally(() => {
        setCreatePolicyLoading(false)
      })
  }, [
    isEdit,
    name,
    regoScript,
    createPolicy,
    setCreatePolicyLoading,
    updatePolicy,
    policyIdentifier,
    history,
    accountId,
    orgIdentifier,
    projectIdentifier,
    module
  ])
  const {
    data: policyData,
    refetch: fetchPolicyData,
    loading: getPolicyLoading,
    error: getPolicyError
  } = useGetPolicy({
    policy: policyIdentifier as string,
    queryParams,
    lazy: true
  })
  const [loadingPolicy, setLoadingPolicy] = useState(false)
  const { getString } = useStrings()
  const [testFailure, setTestFailure] = useState<boolean | undefined>()
  const scriptContainerRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const outputContainerRef = useRef<HTMLDivElement>(null)

  const PolicyNameGroup = (): JSX.Element => {
    return (
      <Layout.Horizontal>
        <Container className={css.titleContainer} padding={{ right: 'small' }}>
          <Text
            font={{ variation: FontVariation.H6 }}
            icon="governance"
            iconProps={{ style: { paddingRight: 'var(--spacing-small)' } }}
            className={css.policyNameInputContainer}
            tooltip={
              <Layout.Vertical spacing="xsmall" padding="medium">
                <Text font={{ variation: FontVariation.SMALL }}>
                  {getString('governance.policyIdentifier', { policyIdentifier })}
                </Text>
                <Text font={{ variation: FontVariation.SMALL }}>{getString('governance.policyName', { name })}</Text>
              </Layout.Vertical>
            }>
            {name}
          </Text>
        </Container>
        <EditPolicyMetadataModalButton
          isEdit={isEdit}
          shouldOpenModal={shouldOpenMetadataModal}
          identifier={policyIdentifier as string}
          modalTitle={getString(policyIdentifier ? 'governance.editPolicy' : 'common.policy.newPolicy')}
          name={name}
          description={description}
          onApply={(formData: PolicyMetadata) => {
            setPolicyIdentifier(formData.identifier)
            setName(formData.name)
            setDescription(formData.description)
          }}
          onClose={() => {
            setShouldOpenMetatDataModal(false)
          }}
        />
        <SelectPolicyModalButton
          modalTitle={getString('governance.selectSamplePolicy')}
          onApply={({ rego: sampleRego, input: sampleInput }) => {
            if (sampleRego !== regoScript || sampleInput !== input) {
              setRegoScript(sampleRego || '')
              setInput(sampleInput || '')
              deselectAllMonacoEditor(regoEditor)
              deselectAllMonacoEditor(inputEditor)
              resetOutput()
            }
          }}
        />
      </Layout.Horizontal>
    )
  }
  const layoutEditors = useCallback(() => {
    if (scriptContainerRef.current) {
      regoEditor?.layout({
        width: (scriptContainerRef.current?.parentNode as HTMLDivElement)?.offsetWidth - EDITOR_GAP,
        height: (scriptContainerRef.current?.parentNode as HTMLDivElement)?.offsetHeight - PAGE_PADDING
      })
      inputEditor?.layout({
        width: (inputContainerRef.current as HTMLDivElement)?.offsetWidth,
        height: (inputContainerRef.current as HTMLDivElement)?.offsetHeight
      })
      outputEditor?.layout({
        width: (outputContainerRef.current as HTMLDivElement)?.offsetWidth,
        height: (outputContainerRef.current as HTMLDivElement)?.offsetHeight
      })
    }
  }, [regoEditor, inputEditor, outputEditor])
  const resetOutput = useCallback(() => {
    setOutput('')
    setTestFailure(undefined)
    layoutEditors()
  }, [setOutput, setTestFailure, layoutEditors])
  const onTestPolicy = useCallback(() => {
    resetOutput()
    setTestPolicyLoading(true)
    evaluateRawPolicy({ rego: regoScript, input: JSON.parse(input) })
      .then(response => {
        try {
          const _response = typeof response === 'string' ? JSON.parse(response) : response
          setOutput(_response)
          deselectAllMonacoEditor(outputEditor)
          setTestFailure(isEvaluationFailed(_response.status))
          layoutEditors()
        } catch {
          // eslint-disable-line no-empty
        }
      })
      .catch(error => showToaster(getErrorMessage(error), { intent: Intent.DANGER, timeout: 0 }))
      .finally(() => setTestPolicyLoading(false))
  }, [evaluateRawPolicy, regoScript, input, outputEditor, setTestFailure, layoutEditors, resetOutput])
  const toolbar = useMemo(() => {
    return (
      <Layout.Horizontal spacing="small">
        {/* BUG: somehow dynamically showing loading is not working, workaround below */}
        {!createPolicyLoading && (
          <Button
            icon="send-data"
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            text="Save"
            onClick={onSavePolicy}
            disabled={!(regoScript || '').trim()}
            loading={createPolicyLoading}
          />
        )}
        {createPolicyLoading && (
          <Button icon="send-data" variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} text="Save" loading />
        )}
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text="Discard"
          onClick={() => {
            history.push(routes.toGovernancePolicyListing({ accountId, orgIdentifier, projectIdentifier, module }))
          }}
        />
        {!testPolicyLoading && (
          <Button
            icon="run-pipeline"
            variation={ButtonVariation.PRIMARY}
            text={'Test'}
            intent="success"
            size={ButtonSize.SMALL}
            disabled={!isInputValid}
            onClick={onTestPolicy}
            loading={testPolicyLoading}
          />
        )}
        {testPolicyLoading && (
          <Button
            icon="run-pipeline"
            variation={ButtonVariation.PRIMARY}
            text={'Test'}
            intent="success"
            size={ButtonSize.SMALL}
            loading
          />
        )}
      </Layout.Horizontal>
    )
  }, [
    history,
    testPolicyLoading,
    accountId,
    createPolicyLoading,
    isInputValid,
    onSavePolicy,
    onTestPolicy,
    regoScript,
    orgIdentifier,
    projectIdentifier,
    module
  ])

  useEffect(() => {
    window.addEventListener('resize', layoutEditors)
    layoutEditors()
    return () => {
      window.removeEventListener('resize', layoutEditors)
    }
  }, [layoutEditors])

  useEffect(() => {
    if (isEdit) {
      setLoadingPolicy(true)
      fetchPolicyData().finally(() => setLoadingPolicy(false))
    }
  }, [isEdit, fetchPolicyData])

  useEffect(() => {
    if (policyData) {
      setRegoScript(policyData.rego || '')
      setPolicyIdentifier(policyData.identifier || '')
      setRegoScript(policyData.rego || '')
      setName(policyData.name || '')

      // TODO Remove casting when BE supports description
      setDescription((policyData as { desription: string }).desription || '')
      deselectAllMonacoEditor(regoEditor)
    }
  }, [policyData, regoEditor])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        onClose={() => {
          hideModal()
        }}
        title={'Select Input'}
        style={{ width: 750, height: 650 }}
        footer={
          <Layout.Horizontal spacing="small" padding="none" margin="none">
            <Button
              text="Apply"
              variation={ButtonVariation.PRIMARY}
              onClick={() => {
                setInput(JSON.stringify(JSON.parse(inputFromSource || ''), null, 2))
                hideModal()
              }}></Button>
            <Button text="Cancel" variation={ButtonVariation.TERTIARY} onClick={() => hideModal()}></Button>
          </Layout.Horizontal>
        }>
        <SelectInputModal handleOnSelect={_data => setInputFromSource(_data)} />
      </Dialog>
    ),
    [inputFromSource]
  )

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal>
            <PolicyNameGroup />
          </Layout.Horizontal>
        }
        toolbar={toolbar}
      />
      <Page.Body
        loading={loadingPolicy || getPolicyLoading}
        error={getErrorMessage(getPolicyError)}
        retryOnError={() => fetchPolicyData()}>
        <Container className={css.container}>
          <SplitPane
            split="vertical"
            defaultSize="60%"
            minSize={400}
            maxSize={-300}
            onChange={layoutEditors}
            resizerStyle={{ width: '25px', background: 'none', borderLeft: 'none', borderRight: 'none' }}
            pane2Style={{ margin: 'var(--spacing-xlarge) var(--spacing-xlarge) var(--spacing-xlarge) 0' }}>
            <Container ref={scriptContainerRef} className={cx(css.module, css.regoContainer)}>
              <MonacoEditor
                language="rego"
                theme="vs-light"
                value={regoScript}
                options={MonacoEditorOptions}
                onChange={newValue => {
                  setRegoScript(newValue)
                }}
                editorWillMount={monaco => {
                  // Registering new language
                  monaco.languages.register({ id: 'rego' })

                  // Registering rego language tokens
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ;(monaco.languages.setMonarchTokensProvider as (name: string, format: any) => void)(
                    'rego',
                    REGO_FORMAT
                  )
                }}
                editorDidMount={_editor => {
                  setRegoEditor(_editor)
                }}
              />
            </Container>
            <SplitPane
              split="horizontal"
              defaultSize="50%"
              minSize={38}
              maxSize={-54}
              onChange={layoutEditors}
              resizerStyle={{ height: '25px', background: 'none', borderTop: 'none', borderBottom: 'none' }}
              pane2Style={{ overflow: 'hidden', flexShrink: 'unset' }}>
              <Container className={cx(css.module, css.inputContainer)}>
                <Layout.Vertical style={{ height: '100%' }}>
                  <Container padding="medium" flex className={css.inputHeader}>
                    <Text color={Color.WHITE}>Input</Text>
                    <FlexExpander />
                    <Layout.Horizontal spacing="small">
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="code"
                        tooltip={getString('governance.formatInput')}
                        size={ButtonSize.SMALL}
                        disabled={!(input || '').trim()}
                        onClick={() => {
                          try {
                            setInput(JSON.stringify(JSON.parse(input), null, 2))
                          } catch (e) {
                            try {
                              setInput(JSON.stringify(YAML.parse(input), null, 2))
                            } catch {
                              showToaster(getErrorMessage(e), { intent: Intent.DANGER, timeout: 0 })
                            }
                          }
                        }}
                      />
                      <Button
                        variation={ButtonVariation.SECONDARY}
                        size={ButtonSize.SMALL}
                        text={getString('governance.selectInput')}
                        onClick={() => showModal()}
                      />
                    </Layout.Horizontal>
                  </Container>
                  <Container flex className={css.ioEditor} ref={inputContainerRef}>
                    <MonacoEditor
                      language="json"
                      theme="vs-light"
                      value={input}
                      options={MonacoEditorOptions}
                      onChange={newValue => setInput(newValue)}
                      editorDidMount={setInputEditor}
                    />
                  </Container>
                </Layout.Vertical>
              </Container>
              <Container className={cx(css.module, css.outputContainer)}>
                <Layout.Vertical style={{ height: '100%' }}>
                  <Container
                    padding="medium"
                    flex
                    className={css.inputHeader}
                    style={{ paddingRight: 'var(--spacing-small)' }}>
                    <Text color={Color.WHITE}>{getString('outputLabel')}</Text>
                    <FlexExpander />
                    <Button
                      variation={ButtonVariation.ICON}
                      icon="trash"
                      tooltip={getString('governance.clearOutput')}
                      size={ButtonSize.SMALL}
                      onClick={resetOutput}
                      disabled={!output}
                    />
                  </Container>
                  {(testFailure == false || testFailure === true) && (
                    <Container
                      background={testFailure ? Color.RED_100 : Color.GREEN_100}
                      padding="medium"
                      className={css.outputError}>
                      <Text
                        icon={testFailure ? 'warning-sign' : 'tick-circle'}
                        iconProps={{
                          style: { color: testFailure ? 'var(--red-500)' : 'var(--green-500)' },
                          padding: { right: 'medium' }
                        }}
                        font={{ variation: output?.error ? FontVariation.YAML : FontVariation.BODY1 }}
                        className={css.outputError}
                        tag={output?.error ? 'pre' : undefined}>
                        {output?.error
                          ? output?.error
                          : testFailure
                          ? getString('governance.inputFailedEvaluation')
                          : getString('governance.inputSuccededEvaluation')}
                      </Text>
                      {output?.deny_messages?.map((message: string, index: number) => (
                        <Text
                          padding={{ left: 'xxlarge', top: index === 0 ? 'small' : undefined }}
                          key={message}
                          font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
                          - {message}
                        </Text>
                      ))}
                    </Container>
                  )}
                  <Container flex className={css.ioEditor} ref={outputContainerRef}>
                    <MonacoEditor
                      language="json"
                      theme="vs-light"
                      value={output?.output ? JSON.stringify(output?.output, null, 2) : ''}
                      options={{ ...MonacoEditorOptions, readOnly: true }}
                      editorDidMount={setOutputEditor}
                    />
                  </Container>
                </Layout.Vertical>
              </Container>
            </SplitPane>
          </SplitPane>
        </Container>
      </Page.Body>
    </>
  )
}
