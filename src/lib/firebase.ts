import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

import { firebaseConfig } from './config'

function initialize() {
  const firebaseApp = initializeApp(firebaseConfig)
  const auth = getAuth(firebaseApp)
  const firestore = getFirestore(firebaseApp)
  return { auth, firestore }
}

function connectToEmulators({
  auth,
  firestore,
}: {
  firestore: Firestore
  auth: Auth
}) {
  if (location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    })
    connectFirestoreEmulator(firestore, 'localhost', 8080)
  }
  return { auth, firestore }
}

export function getFirebase() {
  const existingApp = getApps().at(0)
  if (existingApp) return initialize()
  return connectToEmulators(initialize())
}
