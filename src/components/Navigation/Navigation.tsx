import { Link } from '@solidjs/router'

import { Login } from '../../icons/Login'
import { Logo } from '../../icons/Logo'
import { Search } from '../../icons/Search'
import './Navigation.css'

export function Navigation() {
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

      <Link href="/login" aria-label="Login" class="navigation__login-link">
        <Login />
      </Link>
    </nav>
  )
}
