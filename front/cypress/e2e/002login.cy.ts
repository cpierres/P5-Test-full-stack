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

  it('Affichage du compte (me), contrôle données affichées et absence de Delete', () => {
    if (!Cypress.env('useRealBackend')) {
      // Intercepter la requête pour charger les informations utilisateur
      cy.intercept('GET', '/api/user/1', {
        body: {
          id: 1,
          firstName: 'Admin',
          lastName: 'Admin',
          email: 'yoga@studio.com',
          admin: true, // Utilisateur admin
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-10-01T00:00:00Z',
        },
      }).as('getUserInfo');

    }

    // Naviguer sur la page "Account"
    cy.get('[routerlink="me"]').click();
    cy.url().should('include', '/me');

    // Vérifie que la carte s'affiche correctement avec les informations utilisateur
    cy.get('[data-test="user-name"]').should('contain.text', 'Admin ADMIN'); // Vérifie le nom en majuscule
    cy.get('[data-test="user-email"]').should('contain.text', 'yoga@studio.com'); // Vérifie l’email

    // Vérifie que le bouton "Delete" n'est pas visible pour un utilisateur admin
    cy.get('[data-test="delete-action"]').should('not.exist');

    // Vérifie les dates affichées
    cy.contains('Create at:').should('exist');
    cy.contains('Last update:').should('exist');
  });

  it('Login as Customer user@test.com successful', () => {
    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 2,
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
    cy.loginAs('client');
    cy.url().should('include', '/sessions');
    //cy.wait(1000);
  })

  it('Login user2@test.com, affichage de Account (me), Suppression du compte', () => {
    if (!Cypress.env('useRealBackend')) {
      cy.intercept('POST', '/api/auth/login', {
        body: {
          id: 3,
          username: 'user2@test.com',
          firstName: 'Prenom',
          lastName: 'Nom',
          admin: false
        },
      })

      cy.intercept('POST', '/api/user/3', {
        body: {
          id: 3,
          username: 'user2@test.com',
          firstName: 'Prenom',
          lastName: 'Nom',
          admin: false
        },
      })

      cy.intercept('GET', '/api/user/3', {
        body: {
          id: 1,
          firstName: 'Prenom',
          lastName: 'Nom',
          email: 'user2@test.com',
          admin: false,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-10-01T00:00:00Z',
        },
      }).as('getUserInfo');

      cy.intercept('DELETE', '/api/user/3', {
        body: {
          id: 3,
          username: 'user2@test.com',
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

    cy.login('user2@test.com','test!1234');

    cy.get('[routerlink="me"]').click();
    cy.url().should('include', '/me');

    cy.get('[data-test="delete-action"]').click();

    //cy.url().should('eq', Cypress.config('baseUrl'));//diff de comportement selon exec via open ou run
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
    cy.loginAs('inconnu');

    cy.get('.error');//une erreur doit être affichée
  })

});
