import { generatePath } from 'react-router-dom'

export interface AppPathProps {
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

export const getRoutePath = (path: string): string => `${basePath}${path}`

export const toRoute = (path: string, params?: AppPathProps): string =>
  generatePath(`${baseURL}${path}`, params as Record<string, string | number | boolean>)
