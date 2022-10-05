import type { FileInputEvent, FormEvent, Status, User } from '../../lib'
import type { DocumentReference } from 'firebase/firestore'

import { Link, useNavigate, useParams } from '@solidjs/router'
import { doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { createEffect, createSignal, Show } from 'solid-js'
import toast from 'solid-toast'

import defaultAvatar from '../../assets/default-avatar.webp'
import { Spinner } from '../../components'
import { Close } from '../../icons/Close'
import { getFirebase, store } from '../../lib'
import './ProfileEdit.css'
import { useFormState } from '../../primitives'

type Params = {
  id: string
}

export function ProfileEdit() {
  const navigate = useNavigate()
  const { firestore, storage } = getFirebase()
  const [imageState, setImageState] = createSignal({
    imageUrl: '',
    imageFile: {} as File,
  })

  const { formState, setFormState, handleFormStateChange } = useFormState({
    fullname: '',
    description: '',
  })

  const [status, setStatus] = createSignal<Status>('idle')

  const { id } = useParams<Params>()

  // Needed so the toast message only gets triggered once
  let hasErrorBeenTriggered = false

  createEffect(() => {
    const isUserNotAuthorized = id !== store.user?.id
    if (
      isUserNotAuthorized &&
      store.hasFinishedLoadingUser &&
      !hasErrorBeenTriggered
    ) {
      toast.error('You are not authorized to edit this profile.')
      hasErrorBeenTriggered = true
      navigate('/')
      return
    }

    if (store.hasFinishedLoadingUser && !hasErrorBeenTriggered) {
      setFormState({
        fullname: store.user.fullname,
        description: store.user.description,
      })
      return
    }
  })

  function onImageUpload(event: FileInputEvent) {
    const imageFile = event.target.files ? event.target.files?.[0] : null
    if (!imageFile) {
      toast.error('You must upload an image...')
      return
    }

    const imageUrl = URL.createObjectURL(imageFile)

    setImageState({
      imageUrl,
      imageFile,
    })
  }

  function getImageUrl() {
    return imageState().imageUrl !== ''
      ? imageState().imageUrl
      : store.user?.imageUrl === '' || !store.user
      ? defaultAvatar
      : store.user.imageUrl
  }

  async function handleUpdateUserDocument(imageUrl?: string) {
    const fullname = formState().fullname
    const description = formState().description

    const userDoc = doc(
      firestore,
      `users/${store.user.id}`
    ) as DocumentReference<User>

    await updateDoc(userDoc, {
      fullname,
      description,
      ...(imageUrl ? { imageUrl } : {}),
    })

    URL.revokeObjectURL(imageState().imageUrl)
    setStatus('success')
    navigate(`/profiles/${store.user.id}`)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('loading')

    const hasNewFileBeenUploaded = imageState().imageUrl === ''

    if (hasNewFileBeenUploaded) {
      return await handleUpdateUserDocument()
    }

    const file = imageState().imageFile
    const extension = file.type.split('/')[1]
    const avatarRef = ref(storage, `avatars/${store.user.id}.${extension}`)

    const snapshot = await uploadBytes(avatarRef, file)
    const imageUrl = await getDownloadURL(snapshot.ref)
    await handleUpdateUserDocument(imageUrl)
  }

  return (
    <main class="profile-edit">
      <h1 class="sr-only">Edit profile</h1>
      <form class="profile-edit__form" onSubmit={onSubmit}>
        <Show when={status() === 'loading'}>
          <Spinner label="Saving profile" class="spinner-profile-edit" />
        </Show>
        <input
          type="file"
          class="sr-only"
          id="image"
          accept="image/*"
          aria-label="Upload avatar"
          onChange={onImageUpload}
        />
        <label for="image" class="profile-edit__form-avatar-upload">
          <img alt="" src={getImageUrl()} />
        </label>
        <input
          type="text"
          id="fullname"
          placeholder="Simon Kuna"
          aria-label="Full name"
          value={formState().fullname}
          onInput={handleFormStateChange}
          class="profile-edit__form-input"
        />
        <textarea
          name="description"
          id="description"
          placeholder="I share cute videos."
          aria-label="Description"
          value={formState().description}
          onInput={handleFormStateChange}
        />
        <button type="submit">Save</button>

        <Link href={`/profiles/${store.user?.id}`} aria-label="Cancel edit">
          <Close />
        </Link>
      </form>
    </main>
  )
}
