import { useNavigate, useParams } from '@solidjs/router'
import { createEffect } from 'solid-js'
import toast from 'solid-toast'

import { store } from '../../lib'
import './ProfileEdit.css'

type Params = {
  id: string
}

export function ProfileEdit() {
  const navigate = useNavigate()
  const { id } = useParams<Params>()

  createEffect(() => {
    const isUserNotAuthorized = id !== store.user?.id
    if (isUserNotAuthorized && store.hasFinishedLoadingUser) {
      toast.error('You are not authorized to edit this profile.')
      navigate('/')
    }
  })

  return <div>hello</div>
}
