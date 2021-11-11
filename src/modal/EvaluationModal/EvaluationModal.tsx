import React, { useState } from 'react'
import { Dialog } from '@blueprintjs/core'
import { Container, FontVariation, Heading } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { EvaluationView, EvaluationViewProps } from '../../views/EvaluationView/EvaluationView'

export interface EvaluationModalProps extends EvaluationViewProps {
  modalTitle?: string
}

export const EvaluationModal: React.FC<Partial<EvaluationModalProps>> = ({
  metadata,
  accountId,
  module,
  modalTitle: title,
  headingErrorMessage: failureMessage
}) => {
  const [opened, setOpened] = useState(true)
  const { getString } = useStrings()

  if (!accountId || !metadata) {
    return null
  }

  return (
    <Dialog
      isOpen={opened}
      onClose={() => setOpened(false)}
      title={
        <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ top: 'medium' }}>
          {title || getString('governance.failureModalTitle')}
        </Heading>
      }
      enforceFocus={false}
      style={{ width: 900, height: 600 }}
    >
      <Container style={{ overflow: 'auto' }}>
        <EvaluationView
          metadata={metadata}
          accountId={accountId}
          module={module}
          headingErrorMessage={failureMessage}
        />
      </Container>
    </Dialog>
  )
}
