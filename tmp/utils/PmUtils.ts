import { Intent, IToaster, IToastProps, Position, Toaster } from '@blueprintjs/core'
import { get } from 'lodash-es'

/** This utility shows a toaster without being bound to any component.
 * It's useful to show cross-page/component messages */
export function showToaster(message: string, props?: Partial<IToastProps>): IToaster {
  const toaster = Toaster.create({ position: Position.TOP })
  toaster.show({ message, intent: Intent.SUCCESS, ...props })
  return toaster
}

// eslint-disable-next-line
export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

export const EvaluationStatus = {
  DENY: 'deny',
  ERROR: 'error'
} as const

export const isEvaluationFailed = (status?: string): boolean =>
  status === EvaluationStatus.DENY || status === EvaluationStatus.ERROR
