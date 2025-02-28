/// <reference types="cypress" />
describe('Register spec', () => {
  it('Register new User passes', () => {

    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {
          message: 'User registered successfully!'
        },
      });
    }//if (!Cypress.env('useRealBackend'))

    cy.visit('/');
    cy.get('[routerlink="register"]').click();
    cy.contains('First name *').should('be.visible');
    cy.get('#mat-input-0').type('Prenom');
    cy.get('#mat-input-1').type('Nom');
    cy.get('#mat-input-2').type('user@test.com');
    cy.get('#mat-input-3').type('test!1234');
    cy.get('.mat-button-wrapper').click();
    cy.url().should('include', '/login')
    cy.get('.mat-card-title').should('include.text','Login');
  });

  it('Tentative Register existing User passes', () => {

    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'Error: Email is already taken!'
        },
      });
    }// if (!Cypress.env('useRealBackend')) {

    cy.visit('/');
    cy.get('[routerlink="register"]').click();
    cy.contains('First name *').should('be.visible');
    cy.get('#mat-input-0').type('Prenom');
    cy.get('#mat-input-1').type('Nom');
    cy.get('#mat-input-2').type('user@test.com');
    cy.get('#mat-input-3').type('test!1234');
    cy.get('.mat-button-wrapper').click();
    cy.get('.error');
  });

})
