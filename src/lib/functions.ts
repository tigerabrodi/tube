import type { Timestamp } from '.'
import type { FieldValue } from 'firebase/firestore'

export function getTimestamp(timestamp: Timestamp | FieldValue): Timestamp {
  if ('seconds' in timestamp) {
    return timestamp
  }

  return getCurrentTimestamp()
}

export function getCurrentTimestamp(): Timestamp {
  return {
    seconds: Date.now() * 1000,
    nanoseconds: 0,
  }
}

export function getDateWithTimestamp(firebaseDate: Timestamp) {
  return new Date(firebaseDate.seconds * 1000)
}

export function getExtensionOfFile(file: File) {
  return file.type.split('/')[1]
}
