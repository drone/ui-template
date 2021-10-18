let basePath = ''

export const setBasePath = (_basePath: string): void => {
  basePath = _basePath
}

export const withBasePath = (path: string): string => `${basePath}${path}`
