import type { FormEvent } from '../../lib'

import { useNavigate } from '@solidjs/router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import toast from 'solid-toast'

import { Authenticate } from '../../components'
import { getFirebase } from '../../lib'

type FormElements = HTMLFormControlsCollection & {
  email: HTMLInputElement
  password: HTMLInputElement
}

export function Login() {
  const navigate = useNavigate()
  const { auth } = getFirebase()

  async function onLogin(event: FormEvent<FormElements>) {
    const formElements = event.currentTarget.elements

    const email = formElements.email.value
    const password = formElements.password.value

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Successfully logged in.')
      navigate('/')
    } catch (error) {
      toast.error(
        'Something went wrong, either email or password is incorrect.'
      )
    }
  }

  return <Authenticate onAuthenticate={onLogin} />
}
