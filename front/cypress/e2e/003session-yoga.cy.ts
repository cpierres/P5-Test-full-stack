/// <reference types="cypress" />
import {Session} from "../../src/app/features/sessions/interfaces/session.interface";
import {Teacher} from "../../src/app/interfaces/teacher.interface";

describe('Gestion des sessions de yoga - E2E', () => {
  let updatedSessions: Session[] = [];

  beforeEach(() => {
    if (!Cypress.env('useRealBackend')) {
      cy.fixture('teacher.json').then((teachers) => {
        cy.intercept('GET', '/api/teacher', teachers).as('getTeachers');
      });

      //cy.fixture('user.json').as('usersJSON');
      //cy.fixture('session.json').as('sessionsJSON');
    }
  });

  context('Actions d\'initialisation pour l\'administrateur', () => {
    beforeEach(() => {

      if (!Cypress.env('useRealBackend')) {
        // Définir un token simulé
        const fakeJwtToken = 'fake-jwt-token';

        cy.intercept(
          {
            // Filtrer toutes les requêtes HTTP (GET, POST, PUT, etc.)
            pathname: '/api/**',
          },
          (req) => {
            // Ajouter dynamiquement l'en-tête Authorization
            req.headers['Authorization'] = `Bearer ${fakeJwtToken}`;
          }
        ).as('authenticatedRequest');

        // Login de l'administrateur
        cy.intercept('POST', '/api/auth/login', {
          body: {
            token: 'fake-jwt-token',
            type: 'Bearer',
            id: 1,
            username: 'yoga@studio.com',
            firstName: 'Admin',
            lastName: 'Admin',
            admin: true
          },
        }).as('adminLogin');

        cy.intercept('GET', '/api/session', (req) => {
          //req.headers.Authorization = 'Bearer fake-jwt-token';
          // cy.get('@sessionsJSON').then((sessions) => {
          //   updatedSessions = [...sessions];
          // });
          //req.reply('@sessionsJSON');
          req.reply(
            updatedSessions
          );
        }).as('getSessions');

      }//if (!Cypress.env('useRealBackend')) {

      cy.loginAs('admin');
      cy.url().should('include', '/sessions');
    });

    it('Créer 3 sessions de yoga', () => {
      if (!Cypress.env('useRealBackend')) {

        let currentIdSession = 1;
        cy.intercept('POST', '/api/session', (req) => {
          //expect(req.headers.authorization).toEqual('Bearer fake-jwt-token');
          const newSession: Session = req.body;
          newSession.id = currentIdSession;
          req.body.users = [];
          currentIdSession++;

          req.reply({
            statusCode: 201,
            body: newSession
          });
          // Mettre à jour la variable globale avec la nouvelle session
          updatedSessions.push(newSession);
        }).as('getPostSession');

        cy.intercept('GET', '/api/session', (req) => {
          req.reply({
            statusCode: 200,
            headers: {
              Authorization: 'Bearer fake-jwt-token',
              'Content-Type': 'application/json'
            },
            body: updatedSessions
          });
        }).as('getSessionsUpdated');
      }//if (!Cypress.env('useRealBackend')) {

      // on se retrouve sur l'écran des sessions (avec le bouton Create)

      // Création de la première session
      cy.get('[data-test="create-action"]').click();//clic sur bouton Create

      cy.get('input[formControlName=name]').type('Session 1 matin');
      cy.get('input[formControlName=date]').type('2025-02-19');
      //cy.get('mat-select[formControlName=teacher_id]').click().contains('Margot DELAHAYE').click();

      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').contains('Margot DELAHAYE').click();
      //cy.get('mat-option').eq(1).click();//pour sélectionner 2eme option

      cy.get('textarea[formControlName=description]').type('Session yoga du matin');
      cy.get('[data-test="save-action"]').click();
      //cy.wait('@getPostSession');
      //cy.wait('@getSessionsUpdated');//pour voir la liste
      cy.url().should('include', '/sessions');

      cy.wait(500);

      // Création de la 2eme session
      cy.get('[data-test="create-action"]').click();//clic sur bouton Create
      cy.get('input[formControlName=name]').type('Session 2 soir');
      cy.get('input[formControlName=date]').type('2025-02-19');

      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').contains('Margot DELAHAYE').click();
      //cy.get('mat-option').eq(1).click();//pour sélectionner 2eme option
      cy.get('textarea[formControlName=description]').type('Session yoga du soir');
      cy.get('[data-test="save-action"]').click();
      //cy.wait('@getPostSession');
      //cy.wait('@getSessionsUpdated');//pour voir la liste
      cy.url().should('include', '/sessions');

      // Création de la 3eme session
      cy.get('[data-test="create-action"]').click();//clic sur bouton Create
      cy.get('input[formControlName=name]').type('Session 3 après-midi');
      cy.get('input[formControlName=date]').type('2025-02-19');

      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').contains('Margot DELAHAYE').click();
      //cy.get('mat-option').eq(1).click();//pour sélectionner 2eme option


      cy.get('textarea[formControlName=description]').type('Session yoga après-midi');
      cy.get('[data-test="save-action"]').click();
      //cy.wait('@getPostSession');
      //cy.wait('@getSessionsUpdated');//pour voir la liste
      //cy.url().should('include', '/sessions');
      cy.url().should('match', /\/sessions$/);//doit se terminer par /sessions

      if (!Cypress.env('useRealBackend')) {
        cy.wait('@getSessionsUpdated');
      }
    });

    it('Vérifier que les 3 sessions sont affichées et avec le bon contenu', () => {

      cy.get('.list .items mat-card').should('have.length', 3);

      cy.get('.list .items mat-card')
        .eq(0) // La première session
        .within(() => {
          cy.get('mat-card-title').should('contain', 'Session 1 matin');
          cy.get('mat-card-subtitle').should('contain', 'Session on February 19, 2025');
          cy.get('p').should('contain', 'Session yoga du matin');
        });

      cy.get('.list .items mat-card')
        .eq(1) // La deuxième session
        .within(() => {
          cy.get('mat-card-title').should('contain', 'Session 2 soir');
          cy.get('mat-card-subtitle').should('contain', 'Session on February 19, 2025');
          cy.get('p').should('contain', 'Session yoga du soir');
        });

      cy.get('.list .items mat-card')
        .eq(2) // La 3eme session
        .within(() => {
          cy.get('mat-card-title').should('contain', 'Session 3 après-midi'); // Titre
          cy.get('mat-card-subtitle').should('contain', 'Session on February 19, 2025');
          cy.get('p').should('contain', 'Session yoga après-midi');
        });

    });

    it('Met à jour la deuxième session en changeant de professeur', () => {
      if (!Cypress.env('useRealBackend')) {
        cy.intercept('GET', '/api/teacher', {fixture: 'teacher.json'}).as('getTeachers');

        cy.intercept('PUT', '/api/session/2', (req) => {
          const sessionIndex = updatedSessions.findIndex(s => s.id === 2);
          if (sessionIndex !== -1) {
            updatedSessions[sessionIndex] = {...updatedSessions[sessionIndex], ...req.body};
          }

          req.reply(
            {
              statusCode: 200,
              headers: {
                Authorization: 'Bearer fake-jwt-token',
                'Content-Type': 'application/json'
              },
              body: req.body
            }
          );
        });
        cy.intercept('GET', '/api/session/2', (req) => {
          const session: Session | undefined = updatedSessions.find(s => s.id === 2);
          req.reply(
            {
              statusCode: 200,
              headers: {
                Authorization: 'Bearer fake-jwt-token',
                'Content-Type': 'application/json'
              },
              body: session ? session : {"message": "Session not found"}
            });
        });
      }//if (!Cypress.env('useRealBackend')) {

      // Pointer sur le 2ème bouton Edit via son contexte (Session 2 après-midi)
      cy.get(':nth-child(2) > .mat-card-actions > [data-test="update-action"]').click();

      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').eq(1).click();//pour sélectionner 2eme option

      cy.get('[data-test="save-action"]').click();
      cy.url().should('include', '/sessions');
    });

    it('Supprimer la 3ème session', () => {
      if (!Cypress.env('useRealBackend')) {
        cy.intercept('GET', '/api/session/3', (req) => {
          const session: Session | undefined = updatedSessions.find(s => s.id === req.body.id);
          req.reply(
            {
              statusCode: 200,
              headers: {
                Authorization: 'Bearer fake-jwt-token',
                'Content-Type': 'application/json'
              },
              body: session ? session : {"message": "Session not found"}
            });
        });

        cy.intercept('DELETE', '/api/session/3', (req) => {
          updatedSessions = updatedSessions.filter(session => session.id !== 3);
          req.reply({
            statusCode: 200,
            headers: {
              Authorization: 'Bearer fake-jwt-token',
              'Content-Type': 'application/json'
            },
          });
        }).as('deleteSession');
      }//if (!Cypress.env('useRealBackend')) {

      // Supprimer la Session 3
      cy.get(':nth-child(3) > .mat-card-actions > [data-test="detail-action"]').click();
      cy.url().should('include', '/detail/3');
      cy.get('[data-test="delete-action"]').click();
      if (!Cypress.env('useRealBackend')) {
        cy.wait('@deleteSession');
      }
      cy.url().should('include', '/sessions');
      cy.wait(1000);
    });

    it('Vérifier que 2 sessions restantes sont affichées et avec le bon contenu', () => {

      cy.get('.list .items mat-card').should('have.length', 2);

      cy.get('.list .items mat-card')
        .eq(0) // La première session
        .within(() => {
          cy.get('mat-card-title').should('contain', 'Session 1 matin');
          cy.get('mat-card-subtitle').should('contain', 'Session on February 19, 2025');
          cy.get('p').should('contain', 'Session yoga du matin');
        });

      cy.get('.list .items mat-card')
        .eq(1) // La deuxième session
        .within(() => {
          cy.get('mat-card-title').should('contain', 'Session 2 soir');
          cy.get('mat-card-subtitle').should('contain', 'Session on February 19, 2025');
          cy.get('p').should('contain', 'Session yoga du soir');
        });

    });

    it('Tenter de saisir une Session avec une description de plus de 2000 car', () => {
      if (!Cypress.env('useRealBackend')) {
        cy.intercept('POST', '/api/session', {
          statusCode: 500,
        }).as('postRequest');
      }
      else {
        //request réelle
        cy.intercept('POST', '/api/session').as('postRequest');
      }

      cy.get('[data-test="create-action"]').click();//clic sur bouton Create

      cy.get('input[formControlName=name]').type('Session avec description de plus de 2000 car.');
      cy.get('input[formControlName=date]').type('2025-02-19');

      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').contains('Margot DELAHAYE').click();
      //cy.get('mat-option').eq(1).click();//pour sélectionner 2eme option

      let texte: string =
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ac libero in ex dapibus posuere.
        Duis laoreet id dolor sed malesuada. Donec eget orci rutrum, lobortis turpis nec, bibendum dui. Curabitur
        vulputate purus lectus, condimentum eleifend massa malesuada et. Aenean accumsan vitae purus non tempor.
        Proin sed libero tortor. Pellentesque bibendum, orci vitae feugiat consectetur, odio nibh posuere magna, sed
        blandit ligula dolor at mauris. Morbi et semper tellus. Class aptent taciti sociosqu ad litora torquent per
        conubia nostra, per inceptos himenaeos. Nam dui mauris, blandit quis felis in, bibendum semper velit.
        Sed eget eros nec lorem tristique venenatis. Sed mollis sapien sed quam porttitor cursus.
        Proin facilisis aliquam sagittis. Nunc at sapien congue, pretium enim vel, venenatis dui.
        Nam et blandit metus. Fusce feugiat condimentum mauris, sed lobortis ante luctus eget.
        Sed fringilla, ligula et posuere imperdiet, leo ligula facilisis felis, non consequat eros felis auctor est.
        Nulla vehicula mi eget porta ullamcorper. Vestibulum suscipit venenatis leo nec ultricies.
        Aliquam dictum lacus id ex rhoncus egestas in ut erat. Etiam et efficitur nibh. Nulla tincidunt mi vel
        gravida blandit. Donec non diam nibh. Cras nec mollis eros, in pellentesque lacus. Aliquam et arcu nec risus
        suscipit mollis.
        Quisque imperdiet quam eu nibh mollis, et cursus lacus sagittis. Quisque id mi quis justo mollis pellentesque
        ut quis enim. Proin nibh ante, consequat vel lectus rutrum, condimentum laoreet ipsum. Nunc eleifend, massa
        eget feugiat hendrerit, elit erat imperdiet justo, in semper dui eros vel tortor. Ut vestibulum turpis dolor,
        id rutrum elit convallis quis. Ut vestibulum turpis dolor, id rutrum elit convallis quis.
         Nunc eleifend, massa
        eget feugiat hendrerit, elit erat imperdiet justo, in semper dui eros vel tortor. Ut vestibulum turpis dolor,
        id rutrum elit convallis quis. Ut vestibulum turpis dolor, id rutrum elit convallis quis.`;

      cy.log('Longueur description: ' + texte.length);

      cy.get('textarea[formControlName=description]').type(texte,{delay: 0});

      cy.get('[data-test="save-action"]').click();
      //cy.wait('@getPostSession');
      //cy.wait('@getSessionsUpdated');//pour voir la liste

      cy.wait('@postRequest').then((interception) => {
        expect(interception.response!.statusCode).to.eq(500); // Vérifie le code d'erreur
        //expect(interception.response!.body.error).to.eq('Bad Request'); // Vérifie le message d'erreur (si spécifié)
      });

      cy.url().should('include', '/sessions/create');//on ne bouge pas car save échoue

      cy.get('[data-test="back-action"]').click();

    });

    it('Logout', () => {
      cy.get('[data-test="Logout"]').click();
    });

  });//context admin

  context('Actions pour le profil non-administrateur', () => {
    beforeEach(() => {
      if (!Cypress.env('useRealBackend')) {
        // Login utilisateur client
        cy.intercept('POST', '/api/auth/login', {
          body: {
            id: 2,
            username: 'user@test.com',
            firstName: 'Prenom',
            lastName: 'Nom',
            admin: false
          }
        }).as('userLogin');

        cy.intercept('GET', '/api/session', (req) => {
          //req.headers.Authorization = 'Bearer fake-jwt-token';
          req.reply({statusCode: 200, body: updatedSessions});
        }).as('getSessionsUpdated');

        // ****************
        cy.intercept('GET', '/api/session/1', (req) => {
          const session: Session | undefined = updatedSessions.find(s => s.id === 1);
          req.reply(
            {
              statusCode: 200,
              headers: {
                Authorization: 'Bearer fake-jwt-token',
                'Content-Type': 'application/json'
              },
              body: session ? session : {"message": "Session not found"}
            }
          );
        }).as('session1');

        cy.intercept('GET', '/api/teacher', {fixture: 'teacher.json'}).as('getTeachers');

        cy.intercept('GET', '/api/teacher/1', (req) => {
          req.reply({
            statusCode: 200,
            headers: {
              Authorization: 'Bearer fake-jwt-token',
              'Content-Type': 'application/json'
            },
            body: {
              id: 1,
              ...require('../fixtures/teacher.json').find((teacher: Teacher) => teacher.id === 1)
            }
          });
        }).as('getTeacherById');

        cy.intercept('POST', '/api/session/1/participate/2', (req) => {
          const sessionAddUser: Session = {
            id: 1,
            name: 'Session 1 matin',
            date: new Date('2025-02-19'),
            description: 'Session yoga du matin',
            teacher_id: 1,
            users: [2],
            createdAt: new Date('2025-02-19T12:00:00.000Z'),
            updatedAt: new Date('2025-02-19T12:00:00.000Z')
          };
          console.log(
            'Request body received by the server:',
            sessionAddUser)

          //mettre à jour la session dans la variable globale updatedSessions
          const sessionIndex = updatedSessions.findIndex(s => s.id === 1);
          if (sessionIndex !== -1) {
            updatedSessions[sessionIndex] = {...updatedSessions[sessionIndex], ...sessionAddUser};
          }

          req.reply({
            statusCode: 200,
            headers: {
              Authorization: 'Bearer fake-jwt-token',
              'Content-Type': 'application/json'
            },
            body: sessionAddUser
          });
        }).as('participate');

        cy.intercept('DELETE', '/api/session/1/participate/2', (req) => {
          const sessionRemoveUser: Session =
            {
              id: 1,
              name: 'Session 1 matin',
              date: new Date('2025-02-19'),
              description: 'Session yoga du matin',
              teacher_id: 1,
              users: [],//retrait de l'utilisateur
              createdAt: new Date('2025-02-19'),
              updatedAt: new Date('2025-02-19')
            };

          //mettre à jour la session dans la variable globale updatedSessions
          const sessionIndex = updatedSessions.findIndex(s => s.id === 1);
          if (sessionIndex !== -1) {
            updatedSessions[sessionIndex] = {...updatedSessions[sessionIndex], ...sessionRemoveUser};
          }
          req.reply({
            statusCode: 200,
            headers: {
              Authorization: 'Bearer fake-jwt-token',
              'Content-Type': 'application/json'
            },
            body: sessionRemoveUser
          });
        }).as('unparticipate');
      }//if (!Cypress.env('useRealBackend')) {

      cy.loginAs('client');

      cy.url().should('include', '/sessions');
    });

    it('S\'inscrire à la session 1 et vérifier les changements', () => {
      if (!Cypress.env('useRealBackend')) {
      }

      cy.get(':nth-child(1) > .mat-card-actions > [data-test="detail-action"]').click();
      cy.url().should('include', '/sessions/detail/1');
      if (!Cypress.env('useRealBackend')) {
        cy.wait('@session1');
      }

      cy.get('[data-test="participate-action"]').click();
      if (!Cypress.env('useRealBackend')) {
        cy.wait('@participate');
      }
      cy.get('[data-test="attendees-count"]').should('contain', '1 attendees');
      cy.get('[data-test="unparticipate-action"]').should('be.visible'); // Bouton changé
    });

    it('Se désinscrire de la session 1 et vérifier le compteur', () => {

      cy.get(':nth-child(1) > .mat-card-actions > [data-test="detail-action"]').click();
      cy.url().should('include', '/sessions/detail/1');
      cy.get('[data-test="unparticipate-action"]').click();
      if (!Cypress.env('useRealBackend')) {
        cy.wait('@unparticipate');
      }
      cy.get('[data-test="attendees-count"]').should('contain', '0 attendees');
    });
  });

});//describe global
