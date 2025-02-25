import { TestBed } from '@angular/core/testing';
import {expect} from '@jest/globals';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService - Tests Unitaires', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService]
    });

    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('devrait récupérer tous les enseignants (méthode all)', () => {
    const mockTeachers: Teacher[] = [
      { id: 1, lastName: 'Dupont', firstName: 'Jean', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, lastName: 'Durand', firstName: 'Alice', createdAt: new Date(), updatedAt: new Date() },
    ];

    service.all().subscribe((teachers) => {
      expect(teachers).toEqual(mockTeachers);
    });

    const req = httpMock.expectOne('api/teacher');
    expect(req.request.method).toBe('GET');
    req.flush(mockTeachers);
  });

  it('devrait récupérer les détails d\'un enseignant (méthode detail)', () => {
    const mockTeacher: Teacher = {
      id: 1, lastName: 'Dupont', firstName: 'Jean', createdAt: new Date(), updatedAt: new Date()
    };

    service.detail('1').subscribe((teacher) => {
      expect(teacher).toEqual(mockTeacher);
    });

    const req = httpMock.expectOne('api/teacher/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockTeacher);
  });
});
