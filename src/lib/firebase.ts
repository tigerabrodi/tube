import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { connectStorageEmulator } from 'firebase/storage'
import { getStorage } from 'firebase/storage'

import { firebaseConfig } from './config'

type FirebaseObject = {
  firestore: Firestore
  auth: Auth
  storage: FirebaseStorage
}

function initialize() {
  const firebaseApp = initializeApp(firebaseConfig)
  const auth = getAuth(firebaseApp)
  const firestore = getFirestore(firebaseApp)
  const storage = getStorage(firebaseApp)
  return { auth, firestore, storage }
}

function connectToEmulators({ auth, firestore, storage }: FirebaseObject) {
  if (location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    })
    connectFirestoreEmulator(firestore, 'localhost', 8080)
    connectStorageEmulator(storage, 'localhost', 9199)
  }
  return { auth, firestore, storage }
}

export function getFirebase() {
  const existingApp = getApps().at(0)
  if (existingApp) return initialize()
  return connectToEmulators(initialize())
}
