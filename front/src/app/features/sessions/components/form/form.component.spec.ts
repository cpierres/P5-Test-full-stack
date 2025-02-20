import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {expect} from '@jest/globals';
import {SessionService} from 'src/app/services/session.service';
import {SessionApiService} from '../../services/session-api.service';

import {FormComponent} from './form.component';
import {of} from "rxjs";
import {TeacherService} from "../../../../services/teacher.service";
import {ActivatedRoute, Router} from "@angular/router";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let mockSessionApiService: any;
  let mockTeacherService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockSessionService = {
    sessionInformation: {
      admin: true
    }
  }

  beforeEach(async () => {
    mockSessionApiService = {
      create: jest.fn().mockReturnValue(of({})),
      update: jest.fn().mockReturnValue(of({})),
      detail: jest.fn().mockReturnValue(of({
        id: '1',
        name: 'Session 1',
        date: '2025-02-20',
        teacher_id: '123',
        description: 'Test description'
      })),
    };
    mockTeacherService = {
      all: jest.fn().mockReturnValue(of([{id: '123', firstName: 'Jean', lastName: 'Leprof'}])),
    };
    mockRouter = {
      url: '/sessions/create',
      navigate: jest.fn(),
    };
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1'),
        },
      },
    };

    await TestBed.configureTestingModule({

      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        BrowserAnimationsModule,
        NoopAnimationsModule
      ],
      providers: [
        {provide: SessionService, useValue: mockSessionService},
        {provide: Router, useValue: mockRouter},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: TeacherService, useValue: mockTeacherService},
        {provide: SessionApiService, useValue: mockSessionApiService},
      ],
      declarations: [FormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('devrait initialiser le formulaire à la création', () => {
    expect(component.sessionForm).toBeDefined();
    expect(component.sessionForm?.controls['name']).toBeDefined();
    expect(component.sessionForm?.controls['date']).toBeDefined();
    expect(component.sessionForm?.controls['teacher_id']).toBeDefined();
    expect(component.sessionForm?.controls['description']).toBeDefined();
  });

  it('devrait charger les enseignants depuis TeacherService', (done) => {
    component.teachers$.subscribe((teachers) => {
      expect(teachers.length).toBe(1);
      expect(teachers[0].id).toBe('123');
      expect(teachers[0].firstName).toBe('Jean');
      expect(teachers[0].lastName).toBe('Leprof');
      done();
    });
  });

  it('devrait appeler create lors de la soumission d\'une nouvelle session', () => {
    const sessionData = {
      name: 'New Session',
      date: '2025-02-20',
      teacher_id: '123',
      description: 'Test Description',
    };

    component.sessionForm?.setValue(sessionData);
    component.onUpdate = false; // Simuler un scénario de création
    component.submit();

    expect(mockSessionApiService.create).toHaveBeenCalledWith(sessionData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('devrait appeler update lors de la soumission d\'une session mise à jour', () => {
    const sessionData = {
      name: 'Updated Session',
      date: '2025-02-20',
      teacher_id: '123',
      description: 'Updated Description',
    };

    component.sessionForm?.setValue(sessionData);
    component.onUpdate = true; // Simuler un scénario de mise à jour
    component.setId('1'); // Simuler le paramètre de route
    component.submit();

    expect(mockSessionApiService.update).toHaveBeenCalledWith('1', sessionData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('devrait rediriger vers /sessions si l\'utilisateur n\'est pas administrateur', () => {
    //TestBed.inject(SessionService).sessionInformation.admin = false;
    (TestBed.inject(SessionService).sessionInformation as any).admin = false;
    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('devrait charger les détails de la session en mode mise à jour', () => {
    mockRouter.url = '/sessions/update/1';
    component.ngOnInit();
    expect(component.onUpdate).toBe(true);

    // Vérifie que les détails de la session sont chargés dans le formulaire
    expect(component.sessionForm?.value.name).toBe('Session 1');
    expect(component.sessionForm?.value.date).toBe('2025-02-20');
    expect(component.sessionForm?.value.teacher_id).toBe('123');
    expect(component.sessionForm?.value.description).toBe('Test description');
  });

});
