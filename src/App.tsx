import type { User } from './lib'
import type { DocumentReference } from 'firebase/firestore'

import { Route, Routes } from '@solidjs/router'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { onMount } from 'solid-js'

import { Navigation } from './components'
import { getFirebase, setStore, UserSchema } from './lib'
import { Home } from './pages'

export function App() {
  const { auth, firestore } = getFirebase()

  onMount(() => {
    onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDoc = doc(
          firestore,
          `/users/${authUser.uid}`
        ) as DocumentReference<User>
        const userSnapshot = await getDoc(userDoc)
        const user = UserSchema.parse(userSnapshot.data())

        setStore({ user })
      } else {
        setStore({ user: null })
      }
    })
  })

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" component={Home} />
      </Routes>
    </>
  )
}
