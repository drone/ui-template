/**
 * Get API token to use in Restful React calls.
 */
export function getAPIToken(): string | undefined {
  console.error('TODO: Implement getAPIToken()...')
  return undefined
}

/**
 * Handle 401 error from API.
 */
export function handle401() {
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

  if (!!token?.length) {
    headers.Authorization = `Bearer ${token}`
  }

  return { headers }
}
