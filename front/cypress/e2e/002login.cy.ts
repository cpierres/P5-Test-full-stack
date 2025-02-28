/// <reference types="cypress" />
describe('Login spec', () => {
  it('Login as Admin successful', () => {
    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'yoga@studio.com',
          firstName: 'Admin',
          lastName: 'Admin',
          admin: true
        },
      })

      cy.intercept(
        {
          method: 'GET',
          url: '/api/session',
        },
        []).as('session')
    }// if (!Cypress.env('useRealBackend'))

    // cy.visit('/login')
    // cy.get('input[formControlName=email]').type("yoga@studio.com")
    // cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)
    //cy.login('yoga@studio.com','test!1234');
    cy.loginAs('admin');

    cy.url().should('include', '/sessions')
  });

  it('Login as Customer successful', () => {
    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 1,
          username: 'user@test.com',
          firstName: 'Prenom',
          lastName: 'Nom',
          admin: false
        },
      })

      cy.intercept(
        {
          method: 'GET',
          url: '/api/session',
        },
        []).as('session')
    }// if (!Cypress.env('useRealBackend')) {

    // cy.visit('/login')
    // cy.get('input[formControlName=email]').type("user@test.com")
    // cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    //cy.login('user@test.com','test!1234');//v1
    cy.loginAs('client');//v2

    cy.url().should('include', '/sessions')
  })

  it('Login non autorisé', () => {
    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
      })
    }

    // cy.visit('/login')
    // cy.get('input[formControlName=email]').type("inconnu@test.com")
    // cy.get('input[formControlName=password]').type(`${"zzzz"}{enter}{enter}`)

    //cy.login('inconnu@test.com','123!zzzz');
    cy.loginAs('inconnu');

    cy.get('.error');
  })

});
