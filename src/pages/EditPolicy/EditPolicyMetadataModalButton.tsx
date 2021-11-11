import React, { useEffect } from 'react'
import {
  Button,
  Container,
  Layout,
  useModalHook,
  FormInput,
  Formik,
  ButtonProps,
  ButtonVariation,
  FormikForm
} from '@wings-software/uicore'
import * as yup from 'yup'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { Description } from 'components/NameIdDescriptionTags/NameIdDescriptionTags'
import css from './EditPolicyMetadataModalButton.module.scss'

export interface PolicyMetadata {
  identifier: string
  name: string
  description: string
}

export interface EditPolicyMetadataButtonProps extends PolicyMetadata {
  isEdit: boolean
  shouldOpenModal?: boolean
  modalTitle: string
  onApply: (formData: PolicyMetadata) => void
  onClose?: () => void
}

export const EditPolicyMetadataModalButton: React.FC<EditPolicyMetadataButtonProps & ButtonProps> = ({
  modalTitle,
  isEdit,
  shouldOpenModal,
  identifier = '',
  name = '',
  description = '',
  onApply,
  onClose,
  ...props
}) => {
  const { getString } = useStrings()
  const [openModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={() => {
          hideModal()
          onClose?.()
        }}
        title={modalTitle}
        style={{ padding: 'none' }}>
        <Formik
          initialValues={{ identifier, name, description }}
          onSubmit={formData => {
            onApply(formData)
            hideModal()
            onClose?.()
          }}
          formName="editPolicyForm"
          validationSchema={yup.object().shape({
            name: yup.string().trim().required(getString('validation.nameRequired')),
            identifier: yup.string().trim().required(getString('validation.identifierRequired'))
          })}
          validateOnBlur={false}
          validateOnChange={false}>
          {formikProps => (
            <FormikForm>
              <Container padding={{ top: 'large', right: 'large', left: 'large' }}>
                <Layout.Vertical spacing="small">
                  <FormInput.InputWithIdentifier
                    inputName="name"
                    inputGroupProps={{ inputGroup: { autoFocus: true } }}
                    idName="identifier"
                    isIdentifierEditable={!isEdit}
                    inputLabel={getString('name')}
                  />
                  <Container className={css.desc}>
                    <Description descriptionProps={{}} hasValue={!!formikProps?.values.description} />
                  </Container>
                  <Layout.Horizontal spacing="small" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Button text={getString('apply')} onClick={() => formikProps.handleSubmit()} intent="primary" />
                    <Button
                      text={getString('cancel')}
                      onClick={() => {
                        hideModal()
                        onClose?.()
                      }}
                      minimal
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Container>
            </FormikForm>
          )}
        </Formik>
      </Dialog>
    )
  }, [modalTitle, identifier, name, description, onApply, shouldOpenModal])

  useEffect(() => {
    if (shouldOpenModal && openModal) {
      openModal()
    }
  }, [shouldOpenModal, openModal])

  return (
    <Button
      icon="Edit"
      variation={ButtonVariation.ICON}
      onClick={openModal}
      {...props}
      tooltip={getString('governance.editPolicy')}
    />
  )
}
