import { faker } from '@faker-js/faker'

const user = {
  email: faker.internet.email(),
  fullname: faker.name.fullName(),
  password: faker.internet.password(),
  description: faker.random.words(5),
  editedDescription: faker.random.words(5),
}

beforeEach(() => {
  indexedDB.deleteDatabase('firebaseLocalStorageDb')
})

it('Should be able to sign up, create and edit profile.', () => {
  cy.visit('/')

  cy.findByRole('link', { name: 'Tube' }).should('be.visible')
  cy.findByLabelText('Search').should('be.visible')

  cy.findByRole('link', { name: 'Login' }).click()

  cy.location('pathname').should('eq', '/login')

  cy.findByRole('heading', { level: 1, name: 'Login' }).should('be.visible')
  cy.findByText('Don’t have an account yet?').should('be.visible')

  cy.findByRole('link', { name: 'Register' }).click()

  cy.location('pathname').should('eq', '/register')
  cy.findByRole('heading', { level: 1, name: 'Register' }).should('be.visible')

  cy.findByText('Already have an account?').should('be.visible')
  cy.findByRole('link', { name: 'Login' }).should('be.visible')

  cy.findByLabelText('Email').type(user.email)
  cy.findByLabelText('Full name').type(user.fullname)
  cy.findByLabelText('Password').type(user.password)

  cy.findByRole('status').within(() => {
    cy.findByText('Successfully created an account.').should('be.visible')
  })

  cy.findByLabelText('Fullname').should('have.value', user.fullname)
  cy.findByLabelText('Description').type(user.description)

  cy.findByLabelText('Upload avatar').attachFile('demo-avatar.webp')

  cy.findByRole('button', { name: 'Save' }).click()

  cy.findByRole('heading', { level: 1, name: 'Profile' }).should('be.visible')
  cy.findByRole('heading', { level: 2, name: user.fullname }).should(
    'be.visible'
  )
  cy.findByText(user.description).should('be.visible')

  cy.findByRole('link', { name: 'Edit' }).click()

  cy.findByRole('heading', { level: 1, name: 'Edit Profile' }).should(
    'be.visible'
  )
  cy.findByLabelText('Description').clear().type(user.editedDescription)

  cy.findByRole('button', { name: 'Save' }).click()
  cy.findByText(user.editedDescription).should('be.visible')
})
