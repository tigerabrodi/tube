import { Route, Routes } from '@solidjs/router'
import { onAuthStateChanged } from 'firebase/auth'
import { onMount } from 'solid-js'

import { Navigation } from './components'
import { getFirebase, setStore } from './lib'
import { Home } from './pages'

export function App() {
  const { auth } = getFirebase()

  onMount(() => {
    onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setStore({ authUser })
      } else {
        setStore({ authUser: null })
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
