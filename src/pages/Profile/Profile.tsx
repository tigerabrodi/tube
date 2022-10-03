import type { User } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { Link, useParams } from '@solidjs/router'
import { doc, onSnapshot } from 'firebase/firestore'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'

import defaultAvatar from '../../assets/default-avatar.webp'
import { Edit } from '../../icons/Edit'
import { getFirebase, store } from '../../lib'

import './Profile.css'

type Params = {
  id: string
}

export function Profile() {
  const [user, setUser] = createSignal<User | null>(null)

  const { firestore } = getFirebase()

  const { id } = useParams<Params>()

  onMount(() => {
    const userDoc = doc(firestore, `/users/${id}`) as DocumentReference<User>
    const unsubscribe = onSnapshot(userDoc, (doc) => {
      setUser(doc.data())
    })

    onCleanup(() => unsubscribe)
  })

  return (
    <main class="profile">
      <h1 class="sr-only">Profile</h1>
      <div class="profile__info">
        <Show when={store.user?.id === user()?.id}>
          <Link href={`/profiles/${store.user?.id}/edit`} aria-label="Edit">
            <Edit />
          </Link>
        </Show>
        <img
          src={user()?.imageUrl === '' ? defaultAvatar : user()?.imageUrl}
          alt=""
        />
        <div>
          <h2> {user()?.fullname} </h2>
          <p> {user()?.description} </p>
        </div>
      </div>
    </main>
  )
}
