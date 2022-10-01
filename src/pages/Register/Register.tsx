import type { FormEvent, User } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { useNavigate } from '@solidjs/router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import toast from 'solid-toast'

import { Authenticate } from '../../components'
import { getFirebase } from '../../lib'

type FormElements = HTMLFormControlsCollection & {
  email: HTMLInputElement
  fullname: HTMLInputElement
  password: HTMLInputElement
}

export function Register() {
  const navigate = useNavigate()
  const { auth, firestore } = getFirebase()

  async function onLogin(event: FormEvent<FormElements>) {
    const formElements = event.currentTarget.elements

    const email = formElements.email.value
    const fullname = formElements.fullname.value
    const password = formElements.password.value

    try {
      const authUser = await signInWithEmailAndPassword(auth, email, password)

      const user: User = {
        id: authUser.user.uid,
        email: authUser.user.email,
        fullname,
        description: '',
        imageUrl: '',
        likedVideoIds: [],
        subscriberIds: [],
        subscribedToIds: [],
      }

      const userDoc = doc(
        firestore,
        `/users/${user.id}`
      ) as DocumentReference<User>
      setDoc(userDoc, user)

      toast.success('Successfully created an account.')
      navigate(`/profiles/${user.id}`)
    } catch (error) {
      // TODO: implement error handling if email already exists by showing a toast message
    }
  }

  return <Authenticate isRegister onAuthenticate={onLogin} />
}
