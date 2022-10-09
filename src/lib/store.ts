import type { User } from './schemas'

import { createStore } from 'solid-js/store'

type Store = {
  user: User | null
  hasFinishedLoadingAuthUser: boolean
  hasFinishedLoadingUser: boolean
}

export const [store, setStore] = createStore<Store>({
  user: null,
  hasFinishedLoadingAuthUser: false,
  hasFinishedLoadingUser: false,
})
