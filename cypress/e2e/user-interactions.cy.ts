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

const videoComments = {
  firstComment: faker.random.words(4),
} as const

beforeEach(() => {
  indexedDB.deleteDatabase('firebaseLocalStorageDb')
})

it('User should be able to interact with another user: Subscribe to account, see subscribed videos, like videos, and add comments.', () => {
  cy.visit('/login')

  cy.login(firstUser)

  // Create video
  cy.findByRole('link', { name: 'Upload' }).click()
  cy.findByLabelText('Title').type(video.title)
  cy.findByLabelText('Description').type(video.description)
  cy.findByLabelText('Thumbnail').attachFile(DEMO_THUMBNAIL)
  cy.findByLabelText('Video').attachFile(DEMO_VIDEO)
  cy.findByRole('button', { name: 'Save' }).click()
  cy.findByRole('heading', {
    level: 1,
    name: video.title,
    timeout: 8000,
  }).should('be.visible')

  // Sign in with second user and go to video
  cy.logout()
  cy.visit('/login')
  cy.login(secondUser)
  cy.findByRole('link', { name: video.title }).click()

  // Assert video page
  cy.findByRole('heading', { level: 1, name: video.title }).should('be.visible')
  cy.findByText('2 views').should('be.visible')
  cy.findByText(video.description).should('be.visible')

  // Like video
  cy.findByRole('button', { name: 'Like video, currently 0 likes' }).click()
  cy.findByRole('button', { name: 'Unlike video, currently 1 likes' }).click()
  cy.findByRole('button', { name: 'Like video, currently 0 likes' }).should(
    'be.visible'
  )

  // Subscribe to first user
  cy.findByText('0 subscribers').should('be.visible')
  cy.findByRole('button', { name: 'Subscribe' }).click()
  cy.findByText('1 subscribers').should('be.visible')
  cy.findByRole('button', { name: 'Subscribing' }).should('be.visible')

  // Go to profile of first user and unsubscribe
  cy.findByRole('link', { name: firstUser.fullname }).click()
  cy.findByRole('heading', { level: 2, name: firstUser.fullname }).should(
    'be.visible'
  )
  cy.findByRole('button', { name: 'Subscribing' }).click()
  cy.findByRole('button', { name: 'Subscribe' }).should('be.visible')

  // Go to video again and assert subscribe status
  cy.findByRole('link', { name: video.title }).click()
  cy.findByText('0 subscribers').should('be.visible')
  cy.findByRole('button', { name: 'Subscribe' }).should('be.visible')

  // Comment on the video
  cy.findByText(videoComments.firstComment).should('not.exist')
  cy.findByRole('heading', { level: 2, name: '0 comments' }).should(
    'be.visible'
  )
  cy.findByLabelText('Add a comment').type(videoComments.firstComment)
  cy.findByRole('button', { name: 'Comment' }).click()
  cy.findByText(videoComments.firstComment).should('be.visible')

  // Go to second user via comment link
  cy.findByRole('link', { name: secondUser.fullname }).click()
  cy.findByRole('heading', { level: 2, name: secondUser.fullname }).should(
    'be.visible'
  )

  // Assert feed filters
  cy.findByRole('link', { name: 'Tube' }).click()

  cy.findByLabelText('All').should('be.checked')
  cy.findByRole('link', { name: video.title }).should('be.visible')

  // Need to click on text because input is hidden visibily
  cy.findByText('Subscribing').click()
  cy.findByRole('link', { name: video.title }).should('not.exist')

  cy.findByText('All').click()
  cy.findByRole('link', { name: video.title }).click()
  cy.findByRole('button', { name: 'Subscribe' }).click()
  cy.findByRole('button', { name: 'Subscribing' }).should('be.visible')

  cy.findByRole('link', { name: 'Tube' }).click()

  cy.findByText('Subscribing').click()
  cy.findByRole('link', { name: video.title }).should('be.visible')
})
