/**
 * Get API token to use in Restful React calls.
 */
export function getAPIToken(): string | undefined {
  // eslint-disable-next-line no-console
  console.error('TODO: Implement getAPIToken()...')
  return 'TO BE IMPLEMENTED'
}

/**
 * Handle 401 error from API.
 */
export function handle401(): void {
  // eslint-disable-next-line no-console
  console.error('TODO: Handle 401 error...')
}

/**
 * Build Restful React Request Options.
 * @param token API token
 * @returns RequestInit object.
 */
export function buildResfulReactRequestOptions(
  token?: string,
): Partial<RequestInit> {
  const headers: RequestInit['headers'] = {}

  if (token?.length) {
    headers.Authorization = `Bearer ${token}`
  }

  return { headers }
}
