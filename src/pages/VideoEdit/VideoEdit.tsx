import type { FormState, VideoState } from '../../components'
import type { Status, Video } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { useNavigate, useParams } from '@solidjs/router'
import { getDocs } from 'firebase/firestore'
import { collection, doc, query, updateDoc, where } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { createEffect, createSignal } from 'solid-js'
import toast from 'solid-toast'

import { VideoUpload } from '../../components'
import { getFirebase, store } from '../../lib'
import { getExtensionOfFile } from '../../lib'

export default function VideoEdit() {
  const [status, setStatus] = createSignal<Status>('idle')
  const [video, setVideo] = createSignal<Video | null>(null)

  const navigate = useNavigate()

  const { firestore, storage } = getFirebase()

  const { id } = useParams<{ id: string }>()

  async function onVideoEdit({
    formState: { title, description, thumbnailFile },
    videoState: { file: videoFile },
  }: {
    formState: FormState
    videoState: VideoState
  }) {
    setStatus('loading')

    const videoDoc = doc(firestore, `/videos/${id}`) as DocumentReference<Video>

    // New thumbnail and video
    if (thumbnailFile && videoFile) {
      const thumbnailExtension = getExtensionOfFile(thumbnailFile)
      const thumbnailRef = ref(
        storage,
        `thumbnails/${id}.${thumbnailExtension}`
      )

      const videoExtension = getExtensionOfFile(videoFile)
      const videoRef = ref(storage, `videos/${id}.${videoExtension}`)

      const thumbnailSnapshotPromise = uploadBytes(thumbnailRef, thumbnailFile)
      const videoSnapshotPromise = uploadBytes(videoRef, videoFile)

      const [thumbnailSnapshot, videoSnapshot] = await Promise.all([
        thumbnailSnapshotPromise,
        videoSnapshotPromise,
      ])

      const thumbnailUrlPromise = getDownloadURL(thumbnailSnapshot.ref)
      const videoUrlPromise = getDownloadURL(videoSnapshot.ref)

      const [thumbnailFirestoreUrl, videoFirestoreUrl] = await Promise.all([
        thumbnailUrlPromise,
        videoUrlPromise,
      ])

      await updateDoc(videoDoc, {
        thumbnailUrl: thumbnailFirestoreUrl,
        videoUrl: videoFirestoreUrl,
        title,
        description,
      })
    }

    // New thumbnail but no video
    if (thumbnailFile && !videoFile) {
      const thumbnailExtension = getExtensionOfFile(thumbnailFile)
      const thumbnailRef = ref(
        storage,
        `thumbnails/${id}.${thumbnailExtension}`
      )

      const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailFile)
      const thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref)

      await updateDoc(videoDoc, {
        title,
        description,
        thumbnailUrl,
      })
    }

    // New video but no thumbnail
    if (videoFile && !thumbnailFile) {
      const videoExtension = getExtensionOfFile(videoFile)
      const videoRef = ref(storage, `videos/${id}.${videoExtension}`)

      const videoSnapshot = await uploadBytes(videoRef, videoFile)
      const videoUrl = await getDownloadURL(videoSnapshot.ref)

      await updateDoc(videoDoc, {
        title,
        description,
        videoUrl,
      })
    }

    // No new thumbnail and video
    if (!videoFile && !thumbnailFile) {
      await updateDoc(videoDoc, {
        title,
        description,
      })
    }

    navigate(`/videos/${id}`)
    setStatus('success')
  }

  let hasTriggeredError = false

  const [hasLoadedVideos, setHasLoadedVideos] = createSignal(false)

  createEffect(async () => {
    if (store.user && !hasLoadedVideos() && !hasTriggeredError) {
      setHasLoadedVideos(true)

      const videosQuery = query<Video>(
        collection(firestore, 'videos'),
        where('id', '==', id),
        where('author.id', '==', store.user.id)
      )

      const videosQuerySnapshot = await getDocs<Video>(videosQuery)

      if (videosQuerySnapshot.empty) {
        toast.error("You're not authorized to edit this video.")
        hasTriggeredError = true
        navigate('/')
        return
      }

      const videoData = videosQuerySnapshot.docs[0].data()

      setVideo(videoData)
    }
  })

  return (
    <VideoUpload onSubmit={onVideoEdit} status={status} editedVideo={video} />
  )
}
