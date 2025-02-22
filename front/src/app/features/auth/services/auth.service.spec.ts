import {TestBed} from '@angular/core/testing';
import {expect} from '@jest/globals';

import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthService} from './auth.service';
import {RegisterRequest} from '../interfaces/registerRequest.interface';
import {LoginRequest} from '../interfaces/loginRequest.interface';
import {SessionInformation} from 'src/app/interfaces/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'aucune requête HTTP n'est restée en attente
  });

  describe('register', () => {
    it('devrait envoyer une requête POST vers le endpoint "register"', () => {
      const mockRequest: RegisterRequest = {
        email: 'test@example.com',
        lastName: 'test_user',
        firstName: 'test_user',
        password: 'password123'
      };

      service.register(mockRequest).subscribe();

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(mockRequest);

      req.flush(null); // Simuler une réponse vide pour un Observable<void>
    });
  });

  describe('login', () => {
    it('devrait envoyer une requête POST vers le endpoint "login" et retourner les informations de session', () => {
      const mockRequest: LoginRequest = {
        email: 'test@test.com',
        password: 'password123'
      };

      const mockResponse: SessionInformation = {
        token: 'some-token',
        type: 'string',
        id: 1,
        username: 'string',
        firstName: 'string',
        lastName: 'string',
        admin: false
      };

      service.login(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(mockRequest);

      req.flush(mockResponse); // Simuler une réponse avec des données JSON
    });
  });

  describe('gestion des erreurs', () => {
    it('devrait traiter les erreurs HTTP pour la méthode "register"', () => {
      const mockRequest: RegisterRequest = {
        lastName: 'lastName',
        firstName: 'firstName',
        email: 'test@@example.com',
        password: 'password123'
      };

      service.register(mockRequest).subscribe(
        () => fail('une erreur était attendue'),
        (error) => {
          expect(error.status).toEqual(400);
        }
      );

      const req = httpMock.expectOne('api/auth/register');
      req.flush('Corps de requête invalide', {status: 400, statusText: 'Bad Request'});
    });

    it('devrait traiter les erreurs HTTP pour la méthode "login"', () => {
      const mockRequest: LoginRequest = {
        email: 'test@test.com',
        password: 'password123'
      };

      service.login(mockRequest).subscribe(
        () => fail('une erreur était attendue'),
        (error) => {
          expect(error.status).toEqual(401);
        }
      );

      const req = httpMock.expectOne('api/auth/login');
      req.flush('Non autorisé', {status: 401, statusText: 'Unauthorized'});
    });
  });
});
