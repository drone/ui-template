import { withBasePath } from 'RouteUtils'

export default {
  toSignIn: (): string => withBasePath('/signin'),
  toPolicies: (): string => withBasePath('/policies')
}
