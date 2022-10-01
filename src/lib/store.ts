import type { User } from 'firebase/auth'

import { createStore } from 'solid-js/store'

type Store = {
  authUser: User | null
}

export const [store, setStore] = createStore<Store>({
  authUser: null,
})
