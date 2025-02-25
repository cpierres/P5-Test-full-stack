import {TestBed} from '@angular/core/testing';
import {expect} from '@jest/globals';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';
import {UserService} from './user.service';
import {User} from '../interfaces/user.interface';

describe('UserService', () => {
  describe('Tests Unitaires', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [UserService],
      });

      service = TestBed.inject(UserService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify(); // Vérifie qu'il n'y a aucune requête HTTP restante
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('devrait récupérer un utilisateur par ID (méthode getById)', () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        lastName: 'Pierres',
        firstName: 'Jean',
        admin: false,
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.getById('1').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('devrait supprimer un utilisateur par ID (méthode delete)', () => {
      const mockResponse = {success: true};

      service.delete('1').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  // describe('Tests d\'Intégration', () => {
  //   jest.setTimeout(10000);
  //
  //   let service: UserService;
  //
  //   beforeEach(() => {
  //     TestBed.configureTestingModule({
  //       imports: [HttpClientModule],
  //       providers: [UserService],
  //     });
  //
  //     service = TestBed.inject(UserService);
  //   });
  //
  //   it('devrait récupérer un utilisateur par ID depuis l\'API (test simulé)', (done) => {
  //     const idTest = '1';
  //
  //     service.getById(idTest).subscribe({
  //       next: (user) => {
  //         expect(user).toBeTruthy();
  //         expect(user.id).toEqual(Number(idTest));
  //         done();
  //       }
  //     });
  //   });
  //
  //   it('devrait supprimer un utilisateur par ID via l\'API', (done) => {
  //     const idTest = '1';
  //
  //     service.delete(idTest).subscribe({
  //       next: (response) => {
  //         expect(response).toBeTruthy();
  //         done();
  //       },
  //       // error: (err) => {
  //       //   throw new Error
  //       //   ('Le test a échoué à cause d\'une erreur inattendue : ' + err.message);
  //       // },
  //     });
  //   });
 // });
});
