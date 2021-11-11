import { generatePath } from 'react-router-dom'

export interface GovernancePathProps {
  accountId?: string
  orgIdentifier?: string
  projectIdentifier?: string
  module?: string
  policyIdentifier?: string
  policySetIdentifier?: string
  evaluationId?: string
}

let basePath = ''
let baseURL = ''

export const setRouteBase = (_basePath: string, _baseURL: string): void => {
  basePath = _basePath
  baseURL = _baseURL
}

export const routePath = (path: string): string => `${basePath}${path}`

export const toRoute = (path: string, params?: GovernancePathProps): string =>
  generatePath(`${baseURL}${path}`, params as Record<string, string | number | boolean>)
