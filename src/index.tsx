/* @refresh reload */
import { Router } from '@solidjs/router'
import { render } from 'solid-js/web'

import './index.css'
import { App } from './App'

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
