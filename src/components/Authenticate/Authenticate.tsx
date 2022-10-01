import type { FormEvent } from '../../lib'
import './Authenticate.css'

import { Link } from '@solidjs/router'
import { Show } from 'solid-js'

type FormElements = HTMLFormControlsCollection & {
  name: HTMLInputElement
  email: HTMLInputElement
  password: HTMLInputElement
  confirmPassword: HTMLInputElement
}

export type AuthFormElement = HTMLFormElement & {
  readonly elements: FormElements
}

type AuthenticateProps<FormElements extends HTMLFormControlsCollection> = {
  isRegister?: boolean
  onAuthenticate: (event: FormEvent<FormElements>) => void
}

export function Authenticate<FormElements extends HTMLFormControlsCollection>(
  props: AuthenticateProps<FormElements>
) {
  const title = props.isRegister ? 'Register' : 'Login'
  const oppositeTitle = props.isRegister ? 'Login' : 'Register'

  const bottomText = props.isRegister
    ? 'Already have an account?'
    : "Don't have an account yet?"

  return (
    <main class="authenticate">
      <h1 class="authenticate__heading">{title}</h1>

      <form class="authenticate__form" onSubmit={props.onAuthenticate}>
        <div class="authenticate__form-group">
          <label for="Email">Email</label>
          <input type="text" id="email" name="email" required />
        </div>

        <Show when={props.isRegister}>
          <div class="authenticate__form-group">
            <label for="fullname">Full name</label>
            <input type="text" id="fullname" name="fullname" required />
          </div>
        </Show>

        <div class="authenticate__form-group">
          <label for="fullname">Password</label>
          <input type="text" id="password" name="password" required />
        </div>

        <button type="submit">{title}</button>
      </form>

      <div class="authenticate__bottom">
        <p>{bottomText}</p>
        <Link href={`/${oppositeTitle.toLowerCase()}`}>{oppositeTitle}</Link>
      </div>
    </main>
  )
}
