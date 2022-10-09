import { faker } from '@faker-js/faker'
import { User } from '../support/types'

const DEMO_VIDEO = 'demo-video.mp4'
const DEMO_THUMBNAIL = 'demo-thumbnail.webp'

const firstUser: User = {
  email: 'john@gmail.com',
  password: 'danaher123',
  fullname: 'John Danaher',
} as const

const video = {
  title: faker.random.words(4),
  description: faker.random.words(7),
  editedTitle: faker.random.words(4),
  editedDescription: faker.random.words(7),
} as const

beforeEach(() => {
  indexedDB.deleteDatabase('firebaseLocalStorageDb')
})

it('Should be able to sign in, create a new video and edit the video.', () => {
  cy.visit('/login')

  cy.login(firstUser)

  // Create video
  cy.findByRole('link', { name: 'Upload' }).click()
  cy.location('pathname').should('eq', '/videos/new')
  cy.findByRole('heading', { name: 'Upload new video', level: 1 }).should(
    'exist'
  )
  cy.findByLabelText('Title').type(video.title)
  cy.findByLabelText('Description').type(video.description)

  cy.get('main').within(() => {
    cy.findByRole('img').should('not.exist')
    cy.get('video').should('not.exist')
  })
  cy.findByLabelText('Thumbnail').attachFile(DEMO_THUMBNAIL)
  cy.findByLabelText('Video').attachFile(DEMO_VIDEO)
  cy.get('main').within(() => {
    cy.findByRole('img').should('be.visible')
    cy.get('video').should('be.visible')
  })

  cy.findByRole('button', { name: 'Save' }).click()
  cy.findByRole('alert', { name: 'Saving video' }).should('be.visible')

  // Assert the video page
  cy.findByRole('heading', {
    level: 1,
    name: video.title,
    timeout: 8000,
  }).should('be.visible')
  cy.findByText(video.description).should('be.visible')
  cy.findByText('1 views').should('be.visible')
  cy.findByText('0 subscribers').should('be.visible')

  // First user likes own video
  cy.findByRole('button', { name: 'Like video, currently 0 likes' }).click()
  cy.findByRole('button', { name: 'Unlike video, currently 1 likes' }).click()
  cy.findByRole('button', { name: 'Like video, currently 0 likes' }).should(
    'be.visible'
  )

  // Go to profile
  cy.findByRole('link', { name: firstUser.fullname }).click()

  // Click on video item
  cy.findByRole('link', { name: video.title }).within(() => {
    cy.findByRole('heading', { level: 3, name: video.title }).should(
      'be.visible'
    )
    cy.findByRole('link', { name: firstUser.fullname }).should('be.visible')

    cy.findByRole('link', { name: 'Edit video' }).should('be.visible')
    cy.findByText('1 views').should('be.visible')
  })

  cy.findByRole('link', { name: video.title }).click()

  // Go to edit video
  cy.findByRole('heading', { level: 1, name: video.title }).should('be.visible')
  cy.findByRole('link', { name: 'Edit video' }).click()

  // Edit video
  cy.findByRole('heading', { name: 'Edit video', level: 1 }).should('exist')
  cy.findByLabelText('Title').clear().type(video.editedTitle)
  cy.findByLabelText('Description').clear().type(video.editedDescription)

  cy.findByRole('button', { name: 'Save' }).click()
  cy.findByRole('alert', { name: 'Saving video' }).should('be.visible')

  // Assert the edited video page
  cy.findByRole('heading', { level: 1, name: video.editedTitle }).should(
    'be.visible'
  )
  cy.findByText(video.editedDescription).should('be.visible')
  cy.findByText('3 views').should('be.visible')
  cy.findByText('0 subscribers').should('be.visible')
})
