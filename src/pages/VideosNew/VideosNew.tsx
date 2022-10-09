import type { FormState, VideoState } from '../../components'
import type { Status, Timestamp, Video } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { useNavigate } from '@solidjs/router'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { createSignal } from 'solid-js'
import { v4 } from 'uuid'

import { VideoUpload } from '../../components'
import { getExtensionOfFile } from '../../lib'
import { getFirebase } from '../../lib'
import { store } from '../../lib'

export default function VideosNew() {
  const [status, setStatus] = createSignal<Status>('idle')
  const navigate = useNavigate()

  const { storage, firestore } = getFirebase()

  async function onVideoCreation({
    formState: { title, description, thumbnailFile },
    videoState: { file: videoFile },
  }: {
    formState: FormState
    videoState: VideoState
  }) {
    setStatus('loading')

    const id = v4()

    const thumbnailExtension = getExtensionOfFile(thumbnailFile)
    const thumbnailRef = ref(storage, `thumbnails/${id}.${thumbnailExtension}`)

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

    const video: Video = {
      id,
      title,
      description,
      views: 0,
      likes: 0,
      thumbnailUrl: thumbnailFirestoreUrl,
      videoUrl: videoFirestoreUrl,
      createdAt: serverTimestamp() as Timestamp,
      author: {
        id: store.user.id,
        imageUrl: store.user.imageUrl,
        fullname: store.user.fullname,
        subscribers: 0,
      },
    }

    const videoDoc = doc(firestore, `/videos/${id}`) as DocumentReference<Video>

    await setDoc(videoDoc, video)

    setStatus('success')
    navigate(`/videos/${id}`)
  }

  return <VideoUpload onSubmit={onVideoCreation} status={status} />
}
