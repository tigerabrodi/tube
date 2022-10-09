import type { User, Video } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { Link, useParams } from '@solidjs/router'
import { getDocs, increment, runTransaction } from 'firebase/firestore'
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

  function userDoc() {
    return doc(firestore, `/users/${id}`) as DocumentReference<User>
  }

  function currentUserDoc() {
    return doc(firestore, `/users/${store.user.id}`) as DocumentReference<User>
  }

  onMount(() => {
    const unsubscribe = onSnapshot(userDoc(), (doc) => {
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
        if (!videosQuerySnapshot.empty) {
          const newVideos = new Set(
            videosQuerySnapshot.docs.map((doc) => doc.data())
          )

          // Vague check to make sure we don't reset videos if this effect reruns and the videos are still the same as before, because of the user but the videos themselves haven't changed.
          const isSameLength = videos()?.length === newVideos.size
          if (isSameLength) return

          setVideos([...newVideos])
        }
      })

      onCleanup(() => unsubscribe)
    }
  })

  function hasCurrentUserSubscribedToProfileUser() {
    return Boolean(store.user.subscribedToIds.includes(user().id))
  }

  async function onSubscribe() {
    try {
      await runTransaction(firestore, async (transaction) => {
        const videosQuery = query(
          collection(firestore, 'videos'),
          where('author.id', '==', user().id)
        )
        const videosSnapshot = await getDocs<Video>(videosQuery)

        if (!videosSnapshot.empty) {
          videosSnapshot.forEach((doc) =>
            transaction.update(doc.ref, {
              'author.subscribers': increment(1),
            })
          )
        }

        transaction.update(currentUserDoc(), {
          subscribedToIds: [...store.user.subscribedToIds, user().id],
        })
        transaction.update(userDoc(), { subscribers: increment(1) })
      })
    } catch (error) {
      console.error('Transaction failed: ', error)
    }
  }

  async function onUnsubscribe() {
    try {
      await runTransaction(firestore, async (transaction) => {
        const videosQuery = query(
          collection(firestore, 'videos'),
          where('author.id', '==', user().id)
        )
        const videosSnapshot = await getDocs<Video>(videosQuery)

        if (!videosSnapshot.empty) {
          videosSnapshot.forEach((doc) =>
            transaction.update(doc.ref, {
              'author.subscribers': increment(-1),
            })
          )
        }

        const newSubscribedToIds = store.user.subscribedToIds.filter(
          (id) => id !== user().id
        )

        transaction.update(currentUserDoc(), {
          subscribedToIds: newSubscribedToIds,
        })
        transaction.update(userDoc(), { subscribers: increment(-1) })
      })
    } catch (error) {
      console.error('Transaction failed: ', error)
    }
  }

  return (
    <Show when={user()}>
      (
      <main class="profile">
        <h1 class="sr-only">Profile</h1>
        <div class="profile__info">
          <Show when={store.user && store.user.id !== user().id}>
            <Show
              when={hasCurrentUserSubscribedToProfileUser()}
              fallback={
                <button
                  type="button"
                  onClick={onSubscribe}
                  class="profile__subscribe"
                >
                  Subscribe
                </button>
              }
            >
              <button
                type="button"
                onClick={onUnsubscribe}
                class="profile__subscribing"
              >
                Subscribing
              </button>
            </Show>
          </Show>

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
