import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  Text,
  Color,
  StepProps,
  FormikForm,
  Formik,
  Container,
  SelectOption,
  Layout,
  FieldArray,
  StepWizard,
  Select,
  FormInput,
  useToaster
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useMutate, UseMutateProps } from 'restful-react'
import { isEqual, pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { getErrorMessage, ILLEGAL_IDENTIFIERS } from 'utils/GovernanceUtils'

import { NameIdDescriptionTags } from 'components/NameIdDescriptionTags/NameIdDescriptionTags'
import {
  useCreatePolicySet,
  useGetPolicyList,
  Policy,
  useUpdatePolicySet,
  LinkedPolicy,
  useGetPolicySet,
  PolicySetWithLinkedPolicies,
  useAddLinkedPolicy,
  GetPolicyListQueryParams,
  DeleteLinkedPolicyQueryParams
} from 'services/pm'
import { getConfig } from 'services/config'
import css from '../PolicySets.module.scss'

type CreatePolicySetWizardProps = StepProps<{ refetch: () => void; hideModal: () => void }> & {
  hideModal?: () => void
  refetch: () => void
  prevStepData: any
  policySetData: PolicySetWithLinkedPolicies | any
}

interface GetPolicyListParams extends GetPolicyListQueryParams {
  include_hierarchy?: boolean
}

interface DeleteLinkedPolicyPathParams {
  policyset: string
  policy: string
}

type UseDeleteLinkedPolicyProps = Omit<
  UseMutateProps<void, unknown, DeleteLinkedPolicyQueryParams, string, DeleteLinkedPolicyPathParams>,
  'path' | 'verb'
> &
  DeleteLinkedPolicyPathParams

export const useDeleteLinkedPolicy = ({ policyset, policy, ...props }: UseDeleteLinkedPolicyProps) =>
  useMutate<void, unknown, DeleteLinkedPolicyQueryParams, string, DeleteLinkedPolicyPathParams>(
    'DELETE',
    (paramsInPath: DeleteLinkedPolicyPathParams) =>
      `/policysets/${paramsInPath.policyset}/policy/${paramsInPath.policy}`,
    { base: getConfig('pm/api/v1'), pathParams: { policyset, policy }, ...props }
  )

const StepOne: React.FC<CreatePolicySetWizardProps> = ({ nextStep, policySetData, prevStepData }) => {
  const _policySetData = { ...policySetData, ...prevStepData }
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const queryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  }
  const { mutate: createPolicySet } = useCreatePolicySet({ queryParams })
  const { mutate: updatePolicySet } = useUpdatePolicySet({
    policyset: _policySetData?.identifier?.toString(),
    queryParams
  })
  const { showSuccess, showError } = useToaster()

  const onSubmitFirstStep = async (values: any) => {
    values['enabled'] = true

    const _fields = pick(_policySetData, ['action', 'enabled', 'name', 'type', 'identifier'])
    const _clonedValues = pick(values, ['action', 'enabled', 'name', 'type', 'identifier'])

    // console.log(Object.keys(_clonedValues).length, policySetData?.id, _fields, _clonedValues)
    if (!isEqual(_fields, _clonedValues)) {
      if (policySetData?.id || Object.keys(_fields).length === Object.keys(_clonedValues).length) {
        updatePolicySet(values)
          .then(response => {
            showSuccess(`Successfully updated ${values.name} Policy Set`)
            nextStep?.({ ...values, id: response?.identifier })
          })
          .catch(error => showError(getErrorMessage(error)))
      } else {
        createPolicySet(values)
          .then(response => {
            showSuccess(`Successfully created ${values.name} Policy Set`)
            nextStep?.({ ...values, id: response?.identifier })
          })
          .catch(error => {
            showError(getErrorMessage(error))
          })
      }
    } else {
      nextStep?.({ ...values, id: _policySetData.identifier })
    }
  }

  const { getString } = useStrings()

  return (
    <Container padding="small" height={500}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('overview')}
      </Text>
      <Formik
        enableReinitialize={true}
        onSubmit={values => {
          onSubmitFirstStep(values)
        }}
        formName="CreatePolicySet"
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('common.policiesSets.stepOne.validName')),
          identifier: Yup.string().when('name', {
            is: val => val?.length,
            then: Yup.string()
              .trim()
              .required(getString('validation.identifierRequired'))
              .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
              .notOneOf(ILLEGAL_IDENTIFIERS)
          }),
          type: Yup.string().trim().required(getString('validation.thisIsARequiredField')),
          action: Yup.string().trim().required(getString('validation.thisIsARequiredField'))
        })}
        initialValues={{
          name: _policySetData?.name || '',
          identifier: _policySetData?.identifier || '',
          type: _policySetData?.type || '',
          action: _policySetData?.action || ''
        }}>
        {formikProps => {
          return (
            <FormikForm>
              <Container>
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{
                    inputName: 'name',
                    isIdentifierEditable: true
                  }}
                />
                <FormInput.Select
                  items={[{ label: 'Pipeline', value: 'pipeline' }]}
                  label={'Entity Type that this policy set applies to'}
                  name="type"
                  disabled={false}
                />
                <FormInput.Select
                  items={[
                    { label: 'On Run', value: 'onrun' },
                    { label: 'On Save', value: 'onsave' }
                  ]}
                  label={'On what event should the policy set be evaluated'}
                  name="action"
                  disabled={false}
                />
              </Container>
              <Layout.Horizontal>
                <Button type="submit" intent="primary" text={getString('continue')} style={{ marginTop: '150px' }} />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

const StepTwo: React.FC<{
  hideModal: () => void
  refetch: () => void
  prevStepData: { id: string }
  previousStep?: (data: any) => void
  policySetData: PolicySetWithLinkedPolicies | any
}> = ({ prevStepData, hideModal, refetch, policySetData, previousStep }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const queryParams: GetPolicyListParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  }
  if (projectIdentifier) {
    queryParams['include_hierarchy'] = true
  }
  const { data: policies } = useGetPolicyList({ queryParams })
  const [policyId, setPolicyId] = React.useState('')
  const [severity, setSeverity] = React.useState('')
  const [plList, setPlList] = React.useState<SelectOption[]>()
  const [deLinkpolicyId, setDelinkPolicyId] = React.useState('')
  const [addedPolicies, setAddedPolicies] = React.useState<LinkedPolicy[]>()
  const policyList: SelectOption[] = []

  const { showSuccess, showError } = useToaster()

  React.useEffect(() => {
    if (policies) {
      policies.forEach((v: Policy) => {
        policyList.push({
          label: v.org_id || v.project_id ? (`${v.org_id}/${v.project_id} - ${v.name}` as string) : (v.name as string),
          value: v.identifier?.toString() as string
        })
      })
      setPlList(policyList)
    }
  }, [policies])

  const { data, loading: fetchingPolicySet } = useGetPolicySet({
    queryParams,
    policyset: policySetData?.identifier?.toString() || prevStepData?.id
  })

  const { mutate: patchPolicy } = useAddLinkedPolicy({ policyset: prevStepData?.id, policy: policyId, queryParams })

  const { mutate: deleteLinkedPolicy } = useDeleteLinkedPolicy({
    policyset: prevStepData?.id,
    policy: deLinkpolicyId,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const handlePatchRequest = async (severitySelected: any) => {
    const response = await patchPolicy({ severity: severitySelected })
    return response
  }

  const handleDeleteRequest = async () => {
    const response = await deleteLinkedPolicy({} as string)
    return response
  }

  React.useEffect(() => {
    if (policyId && severity) {
      handlePatchRequest(severity)
        .then(() => {
          showSuccess('Successfully linked policy with the policy set')
        })
        .catch(error => {
          showError(getErrorMessage(error))
        })
    }
  }, [policyId, severity])

  React.useEffect(() => {
    if (deLinkpolicyId) {
      handleDeleteRequest()
        .then(() => {
          showSuccess('Successfully delinked policy with the policy set')
        })
        .catch(error => {
          showError(getErrorMessage(error))
        })
    }
  }, [deLinkpolicyId])

  const handleChangeValue = async (attachedPolicies: any) => {
    if (attachedPolicies?.modifiedRows?.length) {
      const { rowIndex } = attachedPolicies

      const row = attachedPolicies.modifiedRows[rowIndex]

      const policyDetail = row?.policy?.value
      const severitySelected = row?.severity?.value
      if (policyDetail && severitySelected) {
        setPolicyId(policyDetail)
        setSeverity(severitySelected)
      }
    }
  }

  React.useEffect(() => {
    const _attachedPolicy: LinkedPolicy[] = []
    if (data && data.policies?.length) {
      data.policies.forEach((policy: LinkedPolicy) => {
        const _obj: any = {
          policy: {
            value: policy.identifier?.toString(),
            label: policy.name
          },
          severity: {
            label: policy.severity == 'error' ? 'Error and exit' : 'Warn & continue',
            value: policy.severity
          }
        }
        _attachedPolicy.push(_obj)
      })
      setAddedPolicies(_attachedPolicy)
    }
  }, [data])

  const onPreviousStep = (): void => {
    previousStep?.({ ...prevStepData })
  }

  return (
    <Container padding="small" height={500}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('common.policiesSets.evaluationCriteria')}
      </Text>
      <Formik
        formLoading={fetchingPolicySet || undefined}
        enableReinitialize={true}
        onSubmit={() => {
          hideModal()
          refetch()
        }}
        formName="patchPolicy"
        initialValues={{
          attachedPolicies: addedPolicies
        }}>
        {() => {
          return (
            <FormikForm>
              <Container className={css.policyAssignment}>
                <FieldArray
                  label={getString('governance.wizard.fieldArray')}
                  addLabel="Add Policy"
                  key={Math.random().toString(36).substring(2, 8)}
                  name="attachedPolicies"
                  onChange={_data => handleChangeValue(_data)}
                  insertRowAtBeginning={false}
                  isDeleteOfRowAllowed={() => true}
                  onDeleteOfRow={async onDeleteData => {
                    setDelinkPolicyId(onDeleteData?.policy?.value)
                    return true
                  }}
                  containerProps={{ className: css.containerProps }}
                  fields={[
                    {
                      name: 'policy',
                      label: getString('governance.wizard.policyToEval'),
                      renderer: (value, _index, handleChange) => (
                        <Layout.Vertical flex={{ alignItems: 'end' }} style={{ width: '315px' }} spacing="xsmall">
                          <Select
                            items={plList?.length ? plList : []}
                            value={value}
                            inputProps={{
                              placeholder: 'Select Policy'
                            }}
                            onChange={handleChange}
                          />
                        </Layout.Vertical>
                      )
                    },
                    {
                      name: 'severity',
                      label: 'What should happen if a policy fails?',
                      renderer: (value, _index, handleChange) => (
                        <Layout.Vertical flex={{ alignItems: 'end' }} style={{ width: '165px' }} spacing="xsmall">
                          <Select
                            items={[
                              { label: 'Warn & continue', value: 'warning' },
                              { label: 'Error and exit', value: 'error' }
                            ]}
                            value={value}
                            inputProps={{
                              placeholder: 'Select Severity'
                            }}
                            onChange={handleChange}
                          />
                        </Layout.Vertical>
                      )
                    }
                  ]}
                />

                <Layout.Horizontal spacing="medium">
                  <Button type="button" text={getString('back')} onClick={onPreviousStep} />
                  <Button type="submit" intent="primary" text={getString('finish')} />
                </Layout.Horizontal>
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

const CreatePolicySetWizard: React.FC<any> = props => {
  //   const { isEdit } = props
  const { getString } = useStrings()

  return (
    <StepWizard iconProps={{ size: 37 }} title={getString('common.policiesSets.table.name')}>
      <StepOne name={getString('overview')} {...props} />
      <StepTwo name={getString('common.policiesSets.evaluationCriteria')} {...props} />
    </StepWizard>
  )
}

export default CreatePolicySetWizard
