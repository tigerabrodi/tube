import type { Video } from '../../lib'

import { collection, onSnapshot, query } from 'firebase/firestore'
import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'

import { VideoItem } from '../../components'
import { getFirebase } from '../../lib'
import './Home.css'

export default function Home() {
  const [videos, setVideos] = createSignal<Array<Video> | null>(null)

  const { firestore } = getFirebase()

  let hasLoadedVideos = false

  createEffect(() => {
    if (!hasLoadedVideos) {
      hasLoadedVideos = true
      const videosQuery = query<Video>(collection(firestore, 'videos'))
      const unsubscribe = onSnapshot(videosQuery, (videosQuerySnapshot) => {
        videosQuerySnapshot.forEach((doc) => {
          setVideos([...(videos() || []), doc.data()])
        })
      })

      onCleanup(() => unsubscribe)
    }
  })

  return (
    <main class="home">
      <h1 class="sr-only">feed</h1>
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
