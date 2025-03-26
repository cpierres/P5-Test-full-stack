import {TestBed} from '@angular/core/testing';
import {expect} from '@jest/globals';

import {SessionService} from './session.service';
import {SessionInformation} from '../interfaces/sessionInformation.interface';
import {take} from 'rxjs/operators';
import Ajv from 'ajv';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  describe('Tests Unitaires', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('devrait initialiser avec isLogged à false', () => {
      expect(service.isLogged).toBe(false);
    });

    it("devrait mettre à jour sessionInformation et définir isLogged sur true lors d'une connexion (logIn)", () => {
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'mockUser@test.com',
        firstName: 'Mock',
        lastName: 'User',
        admin: false,
      };

      service.logIn(mockUser);

      expect(service.sessionInformation).toEqual(mockUser);
      expect(service.isLogged).toBe(true);
    });

    it("devrait réinitialiser sessionInformation et définir isLogged sur false lors d'une déconnexion (logOut)", () => {
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'mockUser@test.com',
        firstName: 'Mock',
        lastName: 'User',
        admin: false,
      };

      service.logIn(mockUser); // Préparer une session valide avant de tester logOut
      service.logOut();

      expect(service.sessionInformation).toBeUndefined();
      expect(service.isLogged).toBe(false);
    });

    it("devrait émettre les mises à jour de l'état isLogged via l'observable $isLogged", (done) => {
      service.$isLogged().pipe(take(1)).subscribe((isLogged) => {
        expect(isLogged).toBe(false); // La valeur initiale
        done();
      });
    });

    it('devrait émettre true lors de la connexion (logIn) et false lors de la déconnexion (logOut)', (done) => {
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'mockUser@test.com',
        firstName: 'Mock',
        lastName: 'User',
        admin: false,
      };

      let appels = 0;
      service.$isLogged().subscribe((isLogged) => {
        appels++;
        if (appels === 1) {
          expect(isLogged).toBe(false); // La valeur initiale
        } else if (appels === 2) {
          expect(isLogged).toBe(true); // Après logIn
          service.logOut(); // Déclencher la déconnexion
        } else if (appels === 3) {
          expect(isLogged).toBe(false); // Après logOut
          done();
        }
      });

      service.logIn(mockUser);
    });
  });

  describe('Tests fonctionnels avancés', () => {
    const ajv = new Ajv({});
    const sessionSchema = {
      type: 'object',
      properties: {
        token: {type: 'string'},
        type: {type: 'string'},
        id: {type: 'number'},
        username: {type: 'string'},
        firstName: {type: 'string'},
        lastName: {type: 'string'},
        admin: {type: 'boolean'},
      },
      required: ['token', 'type', 'id', 'username', 'firstName', 'lastName', 'admin'],
      additionalProperties: false,
    };

    it('devrait respecter le schéma de session après une connexion', () => {
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'mockUser@test.com',
        firstName: 'Mock',
        lastName: 'User',
        admin: false,
      };

      service.logIn(mockUser);

      const validate = ajv.compile(sessionSchema);
      const isValid = validate(service.sessionInformation);

      expect(isValid).toBe(true);
      expect(validate.errors).toBeNull();
    });

    it('devrait valider la déconnexion en réinitialisant toutes les données', () => {
      const mockUser: SessionInformation = {
        token: 'mock-token',
        type: 'Bearer',
        id: 1,
        username: 'mockUser@test.com',
        firstName: 'Mock',
        lastName: 'User',
        admin: false,
      };

      service.logIn(mockUser); // Simule une connexion

      // Simule une déconnexion et vérifie que les données sont réinitialisées
      service.logOut();
      expect(service.sessionInformation).toBeUndefined();
      expect(service.isLogged).toBe(false);

      // Validation structurelle après la déconnexion
      const validate = ajv.compile(sessionSchema);
      const isValid = validate(service.sessionInformation);
      expect(isValid).toBe(false); // Les données sont réinitialisées après logOut
    });
  });
});
