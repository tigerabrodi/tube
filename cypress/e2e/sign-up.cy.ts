beforeEach(() => {
  indexedDB.deleteDatabase('firebaseLocalStorageDb')
})

it('Should be able to sign up and redirected to profile', () => {
  cy.visit('/')
})
