import type { FormEvent } from '../../lib'

import { useNavigate } from '@solidjs/router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { createEffect, Show } from 'solid-js'
import toast from 'solid-toast'

import { Authenticate } from '../../components'
import { getFirebase } from '../../lib'
import { store } from '../../lib'

type FormElements = HTMLFormControlsCollection & {
  email: HTMLInputElement
  password: HTMLInputElement
}

export default function Login() {
  const navigate = useNavigate()
  const { auth } = getFirebase()

  createEffect(() => {
    if (store.user) {
      navigate('/')
    }
  })

  async function onLogin(event: FormEvent<FormElements>) {
    event.preventDefault()
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

  return (
    <Show when={store.hasFinishedLoadingAuthUser}>
      <Authenticate onAuthenticate={onLogin} />
    </Show>
  )
}
