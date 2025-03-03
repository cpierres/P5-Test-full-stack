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
    cy.get('[formControlName="firstName"]').type('Prenom');
    cy.get('[formControlName="lastName"]').type('Nom');
    cy.get('[formControlName="email"]').type('user@test.com');
    cy.get('[formControlName="password"]').type('test!1234');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/login')
    cy.get('.mat-card-title').should('include.text','Login');
  });

  it('Tentative Register User existant affiche erreur', () => {

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
    cy.get('[formControlName="firstName"]').type('Prenom');
    cy.get('[formControlName="lastName"]').type('Nom');
    cy.get('[formControlName="email"]').type('user@test.com');
    cy.get('[formControlName="password"]').type('test!1234');
    cy.get('button[type="submit"]').click();

    cy.get('.error');//doit afficher une erreur

  });


  it('correction email précédent en doublon par user2@test.com et enregistrement ok', () =>
  {
    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {
          message: 'User registered successfully!'
        },
      });
    }// if (!Cypress.env('useRealBackend')) {

    //corriger l'erreur du doublon (note : ce user2@test.com sera supprimé ultérieurement

    cy.get('[formControlName="email"]').clear();
    cy.get('[formControlName="email"]').type('user2@test.com');

    cy.get('button[type="submit"]').click();//devrait réussir

    cy.url().should('include', '/login')

  });
});
