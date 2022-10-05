import type { FileInputEvent, FormEvent, Status } from '../../lib'
import type { Accessor } from 'solid-js'

import { Link, useNavigate } from '@solidjs/router'
import { createEffect } from 'solid-js'
import { createSignal, Show } from 'solid-js'
import toast from 'solid-toast'

import { Thumbnail } from '../../icons/Thumbnail'
import { Video } from '../../icons/Video'
import { store } from '../../lib'
import { useFormState } from '../../primitives'
import { Spinner } from '../Spinner'
import './VideoUpload.css'

export type VideoState = {
  url: string
  file: File
}

export type FormState = {
  title: string
  description: string
  thumbnailUrl: string
  thumbnailFile: File
}

type VideoUploadProps = {
  onSubmit: ({
    formState,
    videoState,
  }: {
    formState: FormState
    videoState: VideoState
  }) => Promise<void>
  status: Accessor<Status>
}

export function VideoUpload(props: VideoUploadProps) {
  const navigate = useNavigate()
  const { formState, handleFormStateChange, setFormState } = useFormState({
    title: '',
    description: '',
    thumbnailUrl: '',
    thumbnailFile: {} as File,
  })

  // Necessary to keep separate state for the video otherwise it keeps flickering whenever you type in one of the inputs.
  const [videoState, setVideoState] = createSignal<VideoState>({
    url: '',
    file: {} as File,
  })

  let hasErrorBeenTriggered = false

  createEffect(() => {
    const isNotLoggedIn = store.hasFinishedLoadingUser && !store.user
    if (isNotLoggedIn && !hasErrorBeenTriggered) {
      toast.error('You are not allowed to create a new video when logged out.')
      hasErrorBeenTriggered = true
      navigate('/')
      return
    }
  })

  function onImageUpload(event: FileInputEvent) {
    const thumbnailFile = event.target.files ? event.target.files?.[0] : null
    if (!thumbnailFile) {
      toast.error('You must upload an image file...')
      return
    }

    const thumbnailUrl = URL.createObjectURL(thumbnailFile)

    setFormState({
      ...formState(),
      thumbnailFile,
      thumbnailUrl,
    })
  }

  function onVideoUpload(event: FileInputEvent) {
    const file = event.target.files ? event.target.files?.[0] : null
    if (!file) {
      toast.error('You must upload an video file...')
      return
    }

    const url = URL.createObjectURL(file)

    setVideoState({ url, file })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    URL.revokeObjectURL(formState().thumbnailUrl)
    URL.revokeObjectURL(videoState().url)
    await props.onSubmit({ formState: formState(), videoState: videoState() })
  }

  return (
    <main class="video-upload">
      <h1 class="sr-only">Upload new video</h1>
      <form class="video-upload__form" onSubmit={handleSubmit}>
        <Show when={props.status() === 'loading'}>
          <Spinner label="Saving video" class="spinner-video-upload" />
        </Show>
        <div class="video-upload__form-text-group">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Vlog visiting Tokyo during summer"
            value={formState().title}
            onInput={handleFormStateChange}
            required
          />
        </div>

        <div class="video-upload__form-text-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="If you like the video, please give me a thumbs up and don't forget to subscribe to my channel!"
            value={formState().description}
            onInput={handleFormStateChange}
            required
          />
        </div>

        <div class="video-upload__form-file-group">
          <input
            type="file"
            class="sr-only"
            id="thumbnail"
            required
            accept="image/*"
            onChange={onImageUpload}
          />
          <label for="thumbnail">
            Thumbnail
            <Thumbnail />
          </label>

          <Show when={formState().thumbnailUrl !== ''}>
            <img src={formState().thumbnailUrl} alt="" />
          </Show>
        </div>

        <div class="video-upload__form-file-group">
          <input
            type="file"
            class="sr-only"
            id="video"
            required
            accept="video/*"
            onChange={onVideoUpload}
          />
          <label for="video">
            Video
            <Video />
          </label>

          <Show when={videoState().url !== ''}>
            <video src={videoState().url} controls />
          </Show>
        </div>

        <div class="video-upload__actions">
          <Link href="/">Cancel</Link>
          <button type="submit">Save</button>
        </div>
      </form>
    </main>
  )
}
