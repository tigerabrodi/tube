import { Link } from '@solidjs/router'
import { Show } from 'solid-js'

import defaultAvatar from '../../assets/default-avatar.webp'
import { Login } from '../../icons/Login'
import { Logo } from '../../icons/Logo'
import { Logout } from '../../icons/Logout'
import { Search } from '../../icons/Search'
import { store } from '../../lib'
import './Navigation.css'

export function Navigation() {
  const { user } = store

  return (
    <nav class="navigation">
      <Link href="/" aria-label="Tube" class="navigation__logo-link">
        <Logo />
        Tube
      </Link>

      <form class="navigation__form">
        <label for="search" class="sr-only">
          Search
        </label>
        <input
          type="text"
          id="search"
          placeholder="Search"
          required
          class="navigation__form-input"
        />
        <button
          type="submit"
          aria-label="Search"
          class="navigation__form-button"
        >
          <Search />
        </button>
      </form>

      <Show
        when={user}
        fallback={
          <Link href="/login" aria-label="Login" class="navigation__login-link">
            <Login />
          </Link>
        }
      >
        <div class="navigation__actions">
          <Link href="/videos/new" class="navigation__actions-upload">
            Upload
          </Link>

          <Link href={`/profile/${user.id}`}>
            <img
              alt="Profile"
              class="navigation__actions-avatar"
              src={user.imageUrl ? user.imageUrl : defaultAvatar}
            />
          </Link>

          <button class="navigation__actions-logout" aria-label="Logout">
            <Logout />
          </button>
        </div>
      </Show>
    </nav>
  )
}
