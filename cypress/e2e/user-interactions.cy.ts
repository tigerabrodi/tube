import { faker } from '@faker-js/faker'
import { User } from '../support/types'

const DEMO_VIDEO = 'demo-video.mp4'
const DEMO_THUMBNAIL = 'demo-thumbnail.webp'

const firstUser: User = {
  email: 'john@gmail.com',
  password: 'danaher123',
  fullname: 'John Danaher',
} as const

const secondUser: User = {
  email: 'venus@gmail.com',
  fullname: 'Venus Ovan',
  password: 'venus123',
}

const video = {
  title: faker.random.words(4),
  description: faker.random.words(7),
} as const

beforeEach(() => {
  indexedDB.deleteDatabase('firebaseLocalStorageDb')
})

it('User should be able to interact with another user: Subscribe to account, see subscribed videos, like videos, and add comments.', () => {
  cy.visit('/login')

  cy.login(firstUser)
})
