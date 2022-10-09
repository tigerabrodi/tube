import type { User, Video } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { Link, useParams } from '@solidjs/router'
import { where } from 'firebase/firestore'
import { collection, query } from 'firebase/firestore'
import { doc, onSnapshot } from 'firebase/firestore'
import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'

import defaultAvatar from '../../assets/default-avatar.webp'
import { VideoItem } from '../../components'
import { Edit } from '../../icons/Edit'
import { getFirebase, store } from '../../lib'

import './Profile.css'

export default function Profile() {
  const [user, setUser] = createSignal<User | null>(null)
  const [videos, setVideos] = createSignal<Array<Video> | null>(null)

  const { firestore } = getFirebase()

  const { id } = useParams<{
    id: string
  }>()

  onMount(() => {
    const userDoc = doc(firestore, `/users/${id}`) as DocumentReference<User>
    const unsubscribe = onSnapshot(userDoc, (doc) => {
      setUser(doc.data())
    })

    onCleanup(() => unsubscribe)
  })

  let hasLoadedVideos = false

  createEffect(() => {
    if (user() && !hasLoadedVideos) {
      hasLoadedVideos = true
      const videosQuery = query<Video>(
        collection(firestore, 'videos'),
        where('author.id', '==', user().id)
      )

      const unsubscribe = onSnapshot(videosQuery, (videosQuerySnapshot) => {
        videosQuerySnapshot.forEach((doc) => {
          setVideos([...(videos() || []), doc.data()])
        })
      })

      onCleanup(() => unsubscribe)
    }
  })

  return (
    <Show when={user()}>
      (
      <main class="profile">
        <h1 class="sr-only">Profile</h1>
        <div class="profile__info">
          <Show when={store.user?.id === user().id}>
            <Link href={`/profiles/${store.user?.id}/edit`} aria-label="Edit">
              <Edit />
            </Link>
          </Show>
          <img
            src={user().imageUrl === '' ? defaultAvatar : user().imageUrl}
            alt=""
          />
          <div>
            <h2> {user().fullname} </h2>
            <p> {user().description} </p>
          </div>
        </div>

        <div class="profile__videos">
          <For each={videos()}>
            {(video) => <VideoItem video={video} headingLevel="third" />}
          </For>
        </div>
      </main>
      )
    </Show>
  )
}
