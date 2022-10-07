import type { User, Video } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { Link, useNavigate, useParams } from '@solidjs/router'
import { writeBatch } from 'firebase/firestore'
import { doc, increment, onSnapshot, updateDoc } from 'firebase/firestore'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import toast from 'solid-toast'

import { Edit } from '../../icons/Edit'
import { Like } from '../../icons/Like'
import { Unlike } from '../../icons/Unlike'
import { getTimestamp } from '../../lib'
import { getDateWithTimestamp, getFirebase, store } from '../../lib'
import './VideoDetail.css'

export default function VideoDetail() {
  const [video, setVideo] = createSignal<Video | null>(null)
  const navigate = useNavigate()

  const { firestore } = getFirebase()

  const { id } = useParams()

  function videoDoc() {
    return doc(firestore, `/videos/${id}`) as DocumentReference<Video>
  }

  function currentUserDoc() {
    return doc(firestore, `/users/${store.user.id}`) as DocumentReference<User>
  }

  onMount(() => {
    const unsubscribe = onSnapshot(videoDoc(), (doc) => {
      if (doc.exists()) {
        setVideo(doc.data())
      } else {
        toast.error("The video couldn't be found")
        navigate('/')
      }
    })

    onCleanup(() => unsubscribe)
  })

  onMount(async () => {
    await updateDoc(videoDoc(), { views: increment(1) })
  })

  function hasUserLikedVideo() {
    return Boolean(store.user?.likedVideoIds.includes(video()?.id))
  }

  function likeButtonLabel() {
    return `${hasUserLikedVideo() ? 'Unlike' : 'Like'} video, currently ${
      video()?.likes
    } likes`
  }

  async function onLike() {
    const batch = writeBatch(firestore)

    if (hasUserLikedVideo()) {
      const newUserLikedIds = store.user?.likedVideoIds.filter(
        (id) => id !== video().id
      )

      batch.update(videoDoc(), {
        likes: increment(-1),
      })

      batch.update(currentUserDoc(), {
        likedVideoIds: newUserLikedIds,
      })

      await batch.commit()

      return
    }

    const newUserLikedIds = [...store.user.likedVideoIds, video().id]

    batch.update(videoDoc(), {
      likes: increment(1),
    })

    batch.update(currentUserDoc(), {
      likedVideoIds: newUserLikedIds,
    })

    await batch.commit()
  }

  return (
    <main class="video-detail">
      <video src={video()?.videoUrl} controls class="video-detail__video" />
      <div class="video-detail__video-info">
        <h1>{video()?.title}</h1>

        <Show when={store.user}>
          <button
            aria-label={likeButtonLabel()}
            class="video-detail__video-info-like"
            onClick={onLike}
          >
            <Show when={hasUserLikedVideo()} fallback={<Like />}>
              <Unlike />
            </Show>
            <span>{video()?.likes}</span>
          </button>
        </Show>

        <p class="video-detail__video-info-views">
          <span>{video()?.views} views</span>
          <span>•</span>
          <span>{getDateWithTimestamp(getTimestamp(video()?.createdAt))}</span>
        </p>

        <p class="video-detail__video-info-description">
          {video()?.description}
        </p>

        <img
          src={video()?.author.imageUrl}
          alt=""
          class="video-detail__video-author-image"
        />

        <Link
          href={`/profiles/${video()?.author.id}`}
          class="video-detail__video-author-fullname"
        >
          {video()?.author.fullname}
        </Link>

        <p class="video-detail__video-author-subscribers">
          {video()?.author.subscriberIds.length} subscribers
        </p>

        <Show when={store.user && store.user.id === video()?.author.id}>
          <Link
            href={`/videos/${video()?.id}/edit`}
            aria-label="Edit video"
            class="video-detail__video-edit"
          >
            <Edit />
          </Link>
        </Show>
      </div>
    </main>
  )
}
