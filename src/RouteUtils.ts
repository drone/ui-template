import { generatePath } from 'react-router-dom'

let basePath = ''
let baseURL = ''

export const setRouteBase = (_basePath: string, _baseURL: string): void => {
  basePath = _basePath
  baseURL = _baseURL
}

export const withRouteBasePath = (path: string): string => `${basePath}${path}`

export const withRouteBaseURL = (path: string, params?: Record<string, string | number | boolean>): string =>
  generatePath(`${baseURL}${path}`, params)
