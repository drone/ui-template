/**
 * Get API token to use in Restful React calls.
 *
 * This function is called to inject token to Restful React calls only when
 * application is run under standalone mode. In embedded mode, token is passed
 * from parent app.
 *
 * @returns API token.
 */
export function getAPIToken(): string | undefined {
  // eslint-disable-next-line no-console
  console.error('TODO: Implement getAPIToken()...')
  return 'TO BE IMPLEMENTED'
}

/**
 * Handle 401 error from API.
 *
 * This function is called to handle application (running in standalone mode) when
 * API returns a 401 (unauthorized). In embedded mode, the parent app is responsible
 * to pass its handler down.
 *
 * Mostly, the implementation of this function is just a redirection to signin page.
 */
export function handle401(): void {
  // eslint-disable-next-line no-console
  console.error('TODO: Handle 401 error...')
}

/**
 * Build Restful React Request Options.
 *
 * This function is an extension to configure HTTP headers before passing to Restful
 * React to make an API call. Customizations to fulfill the micro-frontend backend
 * service happen here.
 *
 * @param token API token
 * @returns Resful React RequestInit object.
 */
export function buildResfulReactRequestOptions(token?: string): Partial<RequestInit> {
  const headers: RequestInit['headers'] = {}

  if (token?.length) {
    headers.Authorization = `Bearer ${token}`
  }

  return { headers }
}
