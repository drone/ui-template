import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
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
  FlexExpander
} from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router'
import { showToaster, getErrorMessage, isEvaluationFailed } from '@policy/utils/PmUtils'
import routes from '@common/RouteDefinitions'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
import { REGO_FORMAT } from '@policy/utils/rego'
import { PolicyInput, useCreatePolicy, useEvaluateRaw, useGetPolicy, useUpdatePolicy } from 'services/pm'
import { EditPolicyMetadataModalButton } from './EditPolicyMetadataModalButton'
import type { PolicyMetadata } from './EditPolicyMetadataModalButton'
import css from './EditPolicy.module.scss'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PolicyTestOutputResponse = any

const editorOptions = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  scrollBeyondLastLine: false,
  smartSelect: false,
  tabSize: 2,
  insertSpaces: true
}

const EDITOR_GAP = 25
const PAGE_PADDING = 50

const deselectAll = (editor?: EDITOR.IStandaloneCodeEditor): void => {
  editor?.focus()
  setTimeout(() => {
    editor?.setSelection(new monaco.Selection(0, 0, 0, 0))
  }, 0)
}

export const EditPolicy: React.FC = () => {
  const { accountId, policyIdentifier: policyIdentifierFromURL } =
    useParams<{ accountId: string; policyIdentifier: string }>()
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
  const { mutate: createPolicy } = useCreatePolicy({})
  const { mutate: evaluateRawPolicy } = useEvaluateRaw({})
  const [createPolicyLoading, setCreatePolicyLoading] = useState(false)
  const [testPolicyLoading, setTestPolicyLoading] = useState(false)
  const [regoEditor, setRegoEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const [inputEditor, setInputEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const [outputEditor, setOutputEditor] = useState<EDITOR.IStandaloneCodeEditor>()
  const history = useHistory()
  const { mutate: updatePolicy } = useUpdatePolicy({ policy: policyIdentifier })
  const onSavePolicy = useCallback(() => {
    setCreatePolicyLoading(true)
    const api = isEdit ? updatePolicy : createPolicy
    api({
      accountIdentifier: accountId,
      identifier: policyIdentifier,
      name,
      description,
      rego: regoScript
    } as PolicyInput)
      .then(response => {
        showToaster('Policy saved!')
        if (!isEdit) {
          setEdit(true)
          history.replace(routes.toPolicyEditPage({ accountId, policyIdentifier: String(response.identifier || '') }))
        }
      })
      .catch(error => {
        showToaster(getErrorMessage(error), { intent: Intent.DANGER })
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
    description
  ])
  const { data: policyData, refetch: fetchPolicyData } = useGetPolicy({ policy: policyIdentifier, lazy: true })
  const [loadingPolicy, setLoadingPolicy] = useState(false)
  const [testFailure, setTestFailure] = useState<boolean | undefined>()
  const scriptContainerRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const outputContainerRef = useRef<HTMLDivElement>(null)

  const PolicyNameGroup = (): JSX.Element => {
    return (
      <Layout.Horizontal spacing="xsmall">
        <Text
          font={{ variation: FontVariation.H6 }}
          icon="governance"
          iconProps={{ style: { paddingRight: 'var(--spacing-small)' } }}
          className={css.policyNameInputContainer}
        >
          {name} {/*policyIdentifier ? ` (ID: ${policyIdentifier})` : ''*/}
        </Text>
        <EditPolicyMetadataModalButton
          isEdit={isEdit}
          shouldOpenModal={shouldOpenMetadataModal}
          identifier={policyIdentifier}
          modalTitle={policyIdentifier ? 'Edit Policy' : 'New Policy'}
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
          deselectAll(outputEditor)
          setTestFailure(isEvaluationFailed(_response.status))
          layoutEditors()
        } catch {
          // eslint-disable-line no-empty
        }
      })
      .catch(error => showToaster(getErrorMessage(error), { intent: Intent.DANGER }))
      .finally(() => setTestPolicyLoading(false))
  }, [evaluateRawPolicy, regoScript, input, outputEditor, setTestFailure, layoutEditors, resetOutput])
  const toolbar = useMemo(() => {
    return (
      <Layout.Horizontal spacing="small">
        {/* BUG: somehow dynamically showing loading is not working, workaround below */}
        {!createPolicyLoading && (
          <Button
            icon="upload-box"
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            text="Save"
            onClick={onSavePolicy}
            disabled={!(regoScript || '').trim()}
            loading={createPolicyLoading}
          />
        )}
        {createPolicyLoading && (
          <Button icon="upload-box" variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} text="Save" loading />
        )}
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text="Discard"
          onClick={() => {
            history.push(routes.toPolicyListPage({ accountId }))
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
  }, [history, testPolicyLoading, accountId, createPolicyLoading, isInputValid, onSavePolicy, onTestPolicy, regoScript])

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
      deselectAll(regoEditor)
    }
  }, [policyData, regoEditor])

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
      <Page.Body loading={loadingPolicy}>
        <Container className={css.container}>
          <SplitPane
            split="vertical"
            defaultSize="60%"
            minSize={400}
            maxSize={-300}
            onChange={layoutEditors}
            resizerStyle={{ width: '25px', background: 'none', borderLeft: 'none', borderRight: 'none' }}
            pane2Style={{ margin: 'var(--spacing-xlarge) var(--spacing-xlarge) var(--spacing-xlarge) 0' }}
          >
            <Container ref={scriptContainerRef} className={cx(css.module, css.regoContainer)}>
              <MonacoEditor
                language="rego"
                theme="vs-light"
                value={regoScript}
                options={editorOptions}
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
              pane2Style={{ overflow: 'hidden', flexShrink: 'unset' }}
            >
              <Container className={cx(css.module, css.inputContainer)}>
                <Layout.Vertical style={{ height: '100%' }}>
                  <Container padding="medium" flex className={css.inputHeader}>
                    <Text color={Color.WHITE}>Input</Text>
                    <FlexExpander />
                    <Layout.Horizontal spacing="small">
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="code"
                        tooltip="Format Input"
                        size={ButtonSize.SMALL}
                        disabled={!(input || '').trim()}
                        onClick={() => {
                          try {
                            setInput(JSON.stringify(JSON.parse(input), null, 2))
                          } catch (e) {
                            showToaster(getErrorMessage(e), { intent: Intent.DANGER })
                          }
                        }}
                      />
                      <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} text="Select Input" />
                    </Layout.Horizontal>
                  </Container>
                  <Container flex className={css.ioEditor} ref={inputContainerRef}>
                    <MonacoEditor
                      language="json"
                      theme="vs-light"
                      value={input}
                      options={editorOptions}
                      onChange={newValue => {
                        setInput(newValue)
                      }}
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
                    style={{ paddingRight: 'var(--spacing-small)' }}
                  >
                    <Text color={Color.WHITE}>Output</Text>
                    <FlexExpander />
                    <Button
                      variation={ButtonVariation.ICON}
                      icon="trash"
                      tooltip="Clear Output"
                      size={ButtonSize.SMALL}
                      onClick={resetOutput}
                      disabled={!output}
                    />
                  </Container>
                  {(testFailure == false || testFailure === true) && (
                    <Container background={testFailure ? Color.RED_100 : Color.GREEN_100} padding="medium">
                      <Text
                        icon={testFailure ? 'warning-sign' : 'tick-circle'}
                        iconProps={{
                          style: { color: testFailure ? 'var(--red-500)' : 'var(--green-500)' },
                          padding: { right: 'medium' }
                        }}
                        font={{ variation: output?.error ? FontVariation.YAML : FontVariation.BODY1 }}
                        className={css.outputError}
                        tag={output?.error ? 'pre' : undefined}
                      >
                        {output?.error
                          ? output?.error
                          : testFailure
                          ? 'Policy failed to be evaluated'
                          : 'Policy evaluated successfully'}
                      </Text>
                      {output?.deny_messages?.map((message: string, index: number) => (
                        <Text
                          padding={{ left: 'xxlarge', top: index === 0 ? 'small' : undefined }}
                          key={message}
                          font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}
                        >
                          - {message}
                        </Text>
                      ))}
                    </Container>
                  )}
                  <Container flex className={css.ioEditor} ref={outputContainerRef}>
                    <MonacoEditor
                      language="json"
                      theme="vs-light"
                      value={output ? JSON.stringify(output, null, 2) : ''}
                      options={{ ...editorOptions, readOnly: true }}
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
