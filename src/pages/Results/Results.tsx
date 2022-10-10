import type { Video } from '../../lib'

import { useLocation, useSearchParams } from '@solidjs/router'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'

import { VideoSearchItem } from '../../components/VideoSearchItem'
import { getFirebase } from '../../lib'
import './Results.css'

export function Results() {
  const [videos, setVideos] = createSignal<Array<Video> | null>(null)

  const { firestore } = getFirebase()

  const [params] = useSearchParams<{ query: string }>()
  const location = useLocation()

  createEffect(() => {
    if (params.query) {
      const videosQuery = query<Video>(collection(firestore, 'videos'))

      const unsubscribe = onSnapshot(videosQuery, (videosQuerySnapshot) => {
        // Necessary to check the location pathname here because the subscription seems to be firing off right when we switch page. This leads to no videos being found, hence type error is thrown.
        if (!videosQuerySnapshot.empty && location.pathname === '/results') {
          const newVideos = new Set(
            videosQuerySnapshot.docs
              .map((doc) => doc.data())
              .filter((video) =>
                video.title.toLowerCase().includes(params.query.toLowerCase())
              )
          )

          if (newVideos) {
            setVideos([...newVideos])
          } else {
            setVideos(null)
          }
        }
      })

      onCleanup(() => unsubscribe)
    }
  })

  return (
    <main class="results">
      <h1 class="sr-only">Results</h1>
      <Show when={videos()}>
        <div class="results__items">
          <For each={videos()}>
            {(video) => <VideoSearchItem video={video} />}
          </For>
        </div>
      </Show>
    </main>
  )
}
