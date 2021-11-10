import { Button, Container, Layout, Text, TextInput } from '@wings-software/uicore'
import { get } from 'lodash-es'
import { useHistory } from 'react-router-dom'
import React, { useCallback, useState } from 'react'
import { useLogin } from 'services/pm'
import routes from 'RouteDefinitions'
import { setAPIToken } from 'AppUtils'

export const SignInPage: React.FC = () => {
  const history = useHistory()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { mutate } = useLogin({})
  const onLogin = useCallback(() => {
    const formData = new FormData()

    formData.append('username', username)
    formData.append('password', password)

    mutate(formData as unknown as void)
      .then(data => {
        setAPIToken(get(data, 'access_token'))
        history.replace(routes.toPolicyDashboard())
      })
      .catch(error => {
        // TODO: Use toaster to show error
        // eslint-disable-next-line no-console
        console.error({ error })
      })
  }, [mutate, username, password, history])

  return (
    <Layout.Vertical>
      <h1>Sign In Page</h1>
      <Container>
        <Layout.Horizontal>
          <Text>Username:</Text>
          <TextInput
            defaultValue={username}
            name="username"
            onChange={e => setUsername((e.target as HTMLInputElement).value)}></TextInput>
        </Layout.Horizontal>
      </Container>
      <Container>
        <Layout.Horizontal>
          <Text>Password:</Text>
          <TextInput
            defaultValue={password}
            type="password"
            name="password"
            onChange={e => setPassword((e.target as HTMLInputElement).value)}></TextInput>
        </Layout.Horizontal>
      </Container>
      <Container>
        <Button text="Sign In" onClick={() => onLogin()} />
      </Container>
    </Layout.Vertical>
  )
}
