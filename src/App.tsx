import type { User } from './lib'
import type { DocumentReference } from 'firebase/firestore'

import { Route, Routes } from '@solidjs/router'
import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'
import { createEffect, onCleanup, onMount, lazy } from 'solid-js'
import { Toaster } from 'solid-toast'

import { Navigation } from './components'
import { store } from './lib'
import { getFirebase, setStore, UserSchema } from './lib'
import { Results } from './pages/Results'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'))
const Profile = lazy(() => import('./pages/Profile'))
const VideosNew = lazy(() => import('./pages/VideosNew'))
const VideoEdit = lazy(() => import('./pages/VideoEdit'))
const VideoDetail = lazy(() => import('./pages/VideoDetail'))

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

        setStore({ user, hasFinishedLoadingAuthUser: true })
      } else {
        setStore({ user: null, hasFinishedLoadingAuthUser: true })
      }
    })
  })

  // Necessary to make sure user object updates whenever any changes happen to the user document in firestore.
  createEffect(() => {
    if (
      store.user &&
      store.hasFinishedLoadingAuthUser &&
      !store.hasFinishedLoadingUser
    ) {
      // Necessary so we don't end up rerunning this all the time
      setStore({ hasFinishedLoadingUser: true })
      const userDoc = doc(
        firestore,
        `/users/${store.user.id}`
      ) as DocumentReference<User>
      const unsubscribe = onSnapshot(userDoc, (doc) => {
        setStore({ user: doc.data() })
      })

      onCleanup(() => unsubscribe)
    }
  })

  return (
    <>
      <Navigation />
      {/* TODO: change this to 3000ms before PROD */}
      <Toaster position="top-center" toastOptions={{ duration: 500 }} />
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/results" component={Results} />
        <Route path="/profiles/:id/edit" component={ProfileEdit} />
        <Route path="/profiles/:id" component={Profile} />
        <Route path="/profiles/:id" component={Profile} />
        <Route path="/videos/new" component={VideosNew} />
        <Route path="/videos/:id/edit" component={VideoEdit} />
        <Route path="/videos/:id" component={VideoDetail} />
      </Routes>
    </>
  )
}
