/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(email: string, password: string): void
    loginAs(role: string): void
  }
}

/**
 * Permet de se connecter avec un email (code user) et un password.
 */
Cypress.Commands.add('login', (email:string, password:string) => {
  cy.visit('/login');
  cy.get('input[formControlName=email]').type(email);
  cy.get('input[formControlName=password]').type(`${password}{enter}{enter}`);
});

/**
 * Permet de se connecter avec un user dont le rôle est 'admin' ou bien 'client'.
 * Tout autre valeur sera considérée comme un user non autorisé.
 */
Cypress.Commands.add('loginAs', (role: string = 'unknown') => {
  const roles = {
    admin: { email: 'yoga@studio.com', password: 'test!1234' },
    client: { email: 'user@test.com', password: 'test!1234' },
    unknown: { email: 'inconnu@test.com', password: 'inconnu' }, // Défaut si rôle non connu
  };

  const credentials = roles[role] || roles['unknown']; // Si le rôle n'existe pas, on utilise le rôle "unknown"

  cy.login(credentials.email, credentials.password);
});


// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
