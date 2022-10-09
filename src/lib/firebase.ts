import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

import { firebaseConfig } from './config'

function initialize() {
  const firebaseApp = initializeApp(firebaseConfig)
  const auth = getAuth(firebaseApp)
  const firestore = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
  })
  const storage = getStorage(firebaseApp)
  return { auth, firestore, storage }
}

export function getFirebase() {
  return initialize()
}
