import type { FormEvent, User } from '../../lib'
import type { FirebaseError } from 'firebase/app'
import type { DocumentReference } from 'firebase/firestore'

import { useNavigate } from '@solidjs/router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import toast from 'solid-toast'

import { Authenticate } from '../../components'
import { getFirebase } from '../../lib'

type FormElements = HTMLFormControlsCollection & {
  email: HTMLInputElement
  fullname: HTMLInputElement
  password: HTMLInputElement
}

export default function Register() {
  const navigate = useNavigate()
  const { auth, firestore } = getFirebase()

  async function onLogin(event: FormEvent<FormElements>) {
    event.preventDefault()
    const formElements = event.currentTarget.elements

    const email = formElements.email.value
    const fullname = formElements.fullname.value
    const password = formElements.password.value

    try {
      const authUser = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

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
      await setDoc(userDoc, user)

      toast.success('Successfully created an account.')
      navigate(`/profiles/${user.id}/edit`)
    } catch (error) {
      const firebaseError = error as FirebaseError

      const isPasswordTooWeak = firebaseError.code === 'auth/weak-password'
      const isEmailAlreadyInUse =
        firebaseError.code === 'auth/email-already-in-use'

      if (isPasswordTooWeak) {
        toast.error('Password needs to be at least 6 characters.')
      }

      if (isEmailAlreadyInUse) {
        toast.error('Email is already being used, please use a different one.')
      }
    }
  }

  return <Authenticate isRegister onAuthenticate={onLogin} />
}
