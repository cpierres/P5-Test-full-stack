import {TestBed} from '@angular/core/testing';
import {expect} from '@jest/globals';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {SessionApiService} from './session-api.service';
import {Session} from '../interfaces/session.interface';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService],
    });

    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('devrait récupérer toutes les sessions', () => {
    const mockSessions: Session[] = [
      {id: 1, name: 'Session 1', teacher_id: 1, users: [], description: '', date: new Date()},
      {id: 2, name: 'Session 2', teacher_id: 1, users: [], description: '', date: new Date()},
    ];

    service.all().subscribe((sessions) => {
      expect(sessions).toEqual(mockSessions);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  it('devrait récupérer les détails d\'une session', () => {
    const mockSession: Session = {
      id: 1,
      name: 'Session 1',
      teacher_id: 1,
      users: [],
      description: '',
      date: new Date()
    };

    service.detail('1').subscribe((session) => {
      expect(session).toEqual(mockSession);
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSession);
  });

  it('devrait supprimer une session', () => {
    service.delete('1').subscribe((result) => {
      expect(result).toBeTruthy();
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('devrait créer une session', () => {
    const newSession: Session = {id: 1, name: 'Session 1', teacher_id: 1, users: [], description: '', date: new Date()};
    const createdSession: Session = {
      id: 1,
      name: 'Session 1',
      teacher_id: 1,
      users: [],
      description: '',
      date: new Date()
    };

    service.create(newSession).subscribe((session) => {
      expect(session).toEqual(createdSession);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newSession);
    req.flush(createdSession);
  });

  it('devrait mettre à jour une session', () => {
    const updatedSession: Session = {
      id: 1,
      name: 'Session 1',
      teacher_id: 1,
      users: [],
      description: '',
      date: new Date()
    };

    service.update('3', updatedSession).subscribe((session) => {
      expect(session).toEqual(updatedSession);
    });

    const req = httpMock.expectOne('api/session/3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedSession);
    req.flush(updatedSession);
  });

  it('devrait participer à une session', () => {
    service.participate('1', 'user1').subscribe(() => {
      expect(true).toBeTruthy(); // Validation si le service répond sans erreur
    });

    const req = httpMock.expectOne('api/session/1/participate/user1');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({});
  });

  it('devrait se désinscrire d\'une session', () => {
    service.unParticipate('1', 'user1').subscribe(() => {
      expect(true).toBeTruthy(); // Validation si le service répond sans erreur
    });

    const req = httpMock.expectOne('api/session/1/participate/user1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
