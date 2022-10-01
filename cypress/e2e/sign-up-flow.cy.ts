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

it('Should be able to sign up, edit profile and logout.', () => {
  cy.visit('/')

  cy.findByRole('link', { name: 'Tube' }).should('be.visible')
  cy.findByLabelText('Search').should('be.visible')

  // Authenticated navigation actions are not visible
  cy.findByRole('link', { name: 'Upload' }).should('not.exist')
  cy.findByRole('link', { name: 'Profile' }).should('not.exist')
  cy.findByRole('button', { name: 'Logout' }).should('not.exist')

  // Sign up page
  cy.findByRole('link', { name: 'Login' }).click()
  cy.location('pathname').should('eq', '/login')
  cy.findByRole('heading', { level: 1, name: 'Login' }).should('be.visible')
  cy.findByText('Don’t have an account yet?').should('be.visible')
  cy.findByRole('link', { name: 'Register' }).click()
  cy.location('pathname').should('eq', '/register')
  cy.findByRole('heading', { level: 1, name: 'Register' }).should('be.visible')
  cy.findByText('Already have an account?').should('be.visible')
  cy.get('main').within(() => {
    cy.findByRole('link', { name: 'Login' }).should('be.visible')
  })

  // User signs up
  cy.findByLabelText('Email').type(user.email)
  cy.findByLabelText('Full name').type(user.fullname)
  cy.findByLabelText('Password').type(user.password)
  cy.findByRole('button', { name: 'Register' }).click()

  // Toast message
  cy.findByRole('status').within(() => {
    cy.findByText('Successfully created an account.').should('be.visible')
  })

  // Authenticated navigation actions are visible
  cy.findByRole('link', { name: 'Upload' }).should('be.visible')
  cy.findByRole('link', { name: 'Profile' }).should('be.visible')
  cy.findByRole('button', { name: 'Logout' }).should('be.visible')

  // User edits new profile
  cy.findByLabelText('Fullname').should('have.value', user.fullname)
  cy.findByLabelText('Description').type(user.description)
  cy.findByLabelText('Upload avatar').attachFile('demo-avatar.webp')
  cy.findByRole('button', { name: 'Save' }).click()

  // Profile
  cy.findByRole('heading', { level: 1, name: 'Profile' }).should('be.visible')
  cy.findByRole('heading', { level: 2, name: user.fullname }).should(
    'be.visible'
  )
  cy.findByText(user.description).should('be.visible')

  // User edits profile
  cy.findByRole('link', { name: 'Edit' }).click()
  cy.findByRole('heading', { level: 1, name: 'Edit Profile' }).should(
    'be.visible'
  )
  cy.findByLabelText('Description').clear().type(user.editedDescription)
  cy.findByRole('button', { name: 'Save' }).click()

  // Edited Profile
  cy.findByText(user.editedDescription).should('be.visible')

  // Logout
  cy.findByRole('button', { name: 'Logout' }).click()

  // Toast message
  cy.findByRole('status').within(() => {
    cy.findByText('Successfully logged out.').should('be.visible')
  })

  // Authenticated navigation actions are not visible
  cy.findByRole('link', { name: 'Upload' }).should('not.exist')
  cy.findByRole('link', { name: 'Profile' }).should('not.exist')
  cy.findByRole('button', { name: 'Logout' }).should('not.exist')

  // User logs in
  cy.findByRole('link', { name: 'Login' }).click()
  cy.findByLabelText('Email').type(user.email)
  cy.findByLabelText('Password').type(user.password)
  cy.findByLabelText('Full name').should('not.exist')
  cy.findByRole('button', { name: 'Login' }).click()

  // Toast message
  cy.findByRole('status').within(() => {
    cy.findByText('Successfully logged in.').should('be.visible')
  })

  // Gets redirected to feed
  cy.location('pathname').should('eq', '/')

  // Authenticated navigation actions are visible
  cy.findByRole('link', { name: 'Upload' }).should('be.visible')
  cy.findByRole('link', { name: 'Profile' }).should('be.visible')
  cy.findByRole('button', { name: 'Logout' }).should('be.visible')
})
