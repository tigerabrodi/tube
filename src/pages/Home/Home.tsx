import type { Video } from '../../lib'

import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'

import { VideoItem } from '../../components'
import { store } from '../../lib'
import { getFirebase } from '../../lib'
import './Home.css'

const ALL = 'all' as const

const SUBSCRIBING = 'subscribing' as const

type FilterValue = typeof ALL | typeof SUBSCRIBING

export default function Home() {
  const [videos, setVideos] = createSignal<Array<Video> | null>(null)
  const [selectedFilter, setSelectedFilter] = createSignal<FilterValue>(ALL)

  const { firestore } = getFirebase()

  createEffect(() => {
    if (store.user && store.hasFinishedLoadingAuthUser) {
      if (selectedFilter() === ALL) {
        const allVideosQuery = query<Video>(collection(firestore, 'videos'))
        const unsubscribe = onSnapshot(
          allVideosQuery,
          (videosQuerySnapshot) => {
            const newVideosData = videosQuerySnapshot.docs.map((doc) =>
              doc.data()
            )
            const newVideosSet = new Set(newVideosData)
            const newVideos = [...newVideosSet]

            setVideos(newVideos)
          }
        )

        onCleanup(() => unsubscribe)

        return
      }

      // Just set videos to empty array since firestore where clause doesn't accept empty arrays
      if (
        selectedFilter() === SUBSCRIBING &&
        store.user.subscribedToIds.length === 0
      ) {
        setVideos([])
        return
      }

      if (selectedFilter() === SUBSCRIBING) {
        const subscribingVideosQuery = query<Video>(
          collection(firestore, 'videos'),
          where('author.id', 'in', store.user.subscribedToIds)
        )

        const unsubscribe = onSnapshot(
          subscribingVideosQuery,
          (videosQuerySnapshot) => {
            const newVideosData = videosQuerySnapshot.docs.map((doc) =>
              doc.data()
            )
            const newVideosSet = new Set(newVideosData)
            const newVideos = [...newVideosSet]

            setVideos(newVideos)
          }
        )

        onCleanup(() => unsubscribe)

        return
      }
    }
  })

  createEffect(() => {
    if (!store.user && store.hasFinishedLoadingAuthUser) {
      const allVideosQuery = query<Video>(collection(firestore, 'videos'))

      const unsubscribe = onSnapshot(allVideosQuery, (videosQuerySnapshot) => {
        const newVideosData = videosQuerySnapshot.docs.map((doc) => doc.data())
        const newVideosSet = new Set(newVideosData)
        const newVideos = [...newVideosSet]

        setVideos(newVideos)
      })

      onCleanup(() => unsubscribe)
    }
  })

  function onFilterChange(event: Event & { target: Element }) {
    setSelectedFilter((event.target as HTMLInputElement).value as FilterValue)
  }

  return (
    <main class="home">
      <h1 class="sr-only">feed</h1>
      <Show when={store.user}>
        <div class="home__filters">
          <input
            type="radio"
            id={ALL}
            value={ALL}
            checked={selectedFilter() === ALL}
            onChange={onFilterChange}
            class="sr-only"
          />
          <label for={ALL}>All</label>

          <input
            type="radio"
            id={SUBSCRIBING}
            value={SUBSCRIBING}
            checked={selectedFilter() === SUBSCRIBING}
            onChange={onFilterChange}
            class="sr-only"
          />
          <label for={SUBSCRIBING}>Subscribing</label>
        </div>
      </Show>
      <Show when={videos()}>
        <div class="home__videos">
          <For each={videos()}>
            {(video) => <VideoItem video={video} headingLevel="second" />}
          </For>
        </div>
      </Show>
    </main>
  )
}
