import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {expect} from '@jest/globals';
import {SessionService} from 'src/app/services/session.service';

import {ListComponent} from './list.component';
import {SessionApiService} from "../../services/session-api.service";
import {of} from "rxjs";
import {SessionInformation} from "../../../../interfaces/sessionInformation.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {MatButtonModule} from "@angular/material/button";

let component: ListComponent;
let fixture: ComponentFixture<ListComponent>;
//let mockSessionService: { sessionInformation: SessionInformation };
let mockSessionService: Partial<SessionService>;
let mockSessionApiService: Partial<SessionApiService>;

let sessionUserAdmin: SessionInformation = {
  token: 'my-token',
  type: 'admin',
  id: 1,
  username: 'admin@test.com',
  firstName: 'Christophe',
  lastName: 'Pierrès',
  admin: true,
};

let sessionUserNotAdmin: SessionInformation = {
  token: 'user-token',
  type: 'user',
  id: 2,
  username: 'user@test.com',
  firstName: 'Jules',
  lastName: 'Client',
  admin: false
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (_key: string) => null // Pas de paramètre dans l'URL initiale
    },
    url: [{path: 'sessions'}] // Définit l'URL courante comme 'sessions'
  },
  params: of({}) // Observable avec des paramètres vides, car aucun paramètre n'est attendu ici
};

beforeEach(async () => {
  mockSessionService = {
    sessionInformation: sessionUserAdmin
  };

  mockSessionApiService = {
    all: jest.fn(() =>
      of([
        {
          id: 1,
          name: 'Yoga Session 1',
          description: 'Yoga matin',
          date: new Date('2025-02-21'),
          teacher_id: 101,
          users: [],
        },
        {
          id: 2,
          name: 'Yoga Session 2',
          description: 'Yoga après-midi',
          date: new Date('2025-02-21'),
          teacher_id: 102,
          users: [],
        },
        {
          id: 3,
          name: 'Yoga Session 3',
          description: 'Yoga soir',
          date: new Date('2025-02-21'),
          teacher_id: 102,
          users: [],
        },
      ])
    ),
  };

  await TestBed.configureTestingModule({
    declarations: [ListComponent],
    imports: [HttpClientModule, MatCardModule, MatIconModule, RouterTestingModule, MatButtonModule],
    providers: [
      {provide: SessionService, useValue: mockSessionService},
      {provide: SessionApiService, useValue: mockSessionApiService},
      {provide: ActivatedRoute, useValue: mockActivatedRoute}
    ]
  })
    .compileComponents();

  fixture = TestBed.createComponent(ListComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();

});

describe('ListComponent Unit Tests', () => {

  // beforeEach(() => {
  //   const fixture = TestBed.createComponent(ListComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('devrait retrouver l\'utilisateur courant de la session', () => {
    expect(component.user).toEqual(sessionUserAdmin);
  });

  it('devrait appeler session-api service pour fetcher les sessions de yoga', () => {
    const spy = jest.spyOn(mockSessionApiService, 'all');
    component.sessions$.subscribe();
    expect(spy).toHaveBeenCalled();
  });
});

describe('ListComponent Integration Tests', () => {

  it('ne devrait pas afficher le bouton "Create" pour un utilisateur client', () => {
    // utilisateur non admin
    mockSessionService.sessionInformation = sessionUserNotAdmin;

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const createButton = compiled.querySelector('.btn-create');
    expect(createButton).toBeNull(); // Le bouton ne doit pas être présent
  });


  it('devrait afficher le bouton "Create" pour un utilisateur administrateur', () => {
    mockSessionService.sessionInformation = sessionUserAdmin;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const createButton = compiled.querySelector('button[routerLink="create"]');
    expect(createButton).not.toBeNull();
    expect(createButton?.textContent).toContain('Create');
  });

  // it('devrait rediriger vers la page de création en cliquant sur "Create"', async () => {
  //   // Configure un utilisateur administrateur
  //   mockSessionService.sessionInformation = sessionUserAdmin;
  //   fixture.detectChanges();
  //
  //   // Injectez le routeur simulé
  //   const router = TestBed.inject(Router);
  //   const navigateSpy = jest.spyOn(router, 'navigate');
  //
  //   const compiled = fixture.nativeElement as HTMLElement;
  //
  //   const createButton = compiled.querySelector('button[routerLink="create"]') as HTMLButtonElement;
  //   expect(createButton).not.toBeNull();
  //   //expect(createButton?.textContent).toContain('Create');
  //   createButton.click();
  //
  //   //fixture.detectChanges();
  //   await fixture.whenStable();
  //
  //   // Vérifier que le bouton a demandé une redirection vers "/sessions/create"
  //   // const expectedRoute = '/create'
  //   // expect(navigateSpy).toHaveBeenCalledWith(expectedRoute); // Vérifiez la bonne destination
  //   expect(navigateSpy).toHaveBeenCalledWith(['create'], expect.anything());
  // });

  it('devrait afficher un bouton "Detail" pour chaque session (visible pour tous les utilisateurs)', () => {
    //it('devrait afficher un bouton "Detail" pour chaque session (visible pour tous les utilisateurs)', async () => {
    //it('devrait afficher un bouton "Detail" pour chaque session (visible pour tous les utilisateurs)',  (done) => {
    // Utilisateur non admin
    mockSessionService.sessionInformation = sessionUserNotAdmin;

    // Simule l'observation et attend la mise à jour
    component.sessions$.subscribe((sessions) => {
      expect(sessions.length).toBe(3);

      // Attend la stabilité
      //await fixture.whenStable();

      fixture.detectChanges(); // Force la mise à jour du DOM après avoir récupéré les sessions

      const compiled = fixture.nativeElement as HTMLElement;
      //ATTENTION: MatButtonModule doit être chargé pour faire référence au style mat-raised-button (sinon ne trouve pas)
      const detailButtons = compiled.querySelectorAll('button[mat-raised-button][routerLink^="detail"]');

      // Vérifie que chaque session a un bouton "Detail" (3 sessions mockées dans les tests)
      expect(detailButtons.length).toBe(3);

      detailButtons.forEach(button => {
        expect(button.textContent).toContain('Detail');
      });

      //done(); // Marque le test asynchrone comme terminé
    });
  });

  it('ne devrait pas afficher le bouton "Edit" pour un utilisateur client', () => {
    // Simule un utilisateur non administrateur
    mockSessionService.sessionInformation = sessionUserNotAdmin;
    component.sessions$.subscribe((sessions) => {
      expect(sessions.length).toBe(3);
      fixture.detectChanges(); // Met à jour la vue pour refléter le nouvel utilisateur

      const compiled = fixture.nativeElement as HTMLElement;
      const editButtons = compiled.querySelectorAll('button[routerLink^="update"]');

      // Vérifie qu'aucun bouton "Edit" n'est affiché
      expect(editButtons.length).toBe(0);
    });
  });

  it('devrait afficher un bouton "Edit" pour chaque session pour un utilisateur administrateur', () => {
    // Simule un utilisateur administrateur
    mockSessionService.sessionInformation = sessionUserAdmin;
    component.sessions$.subscribe((sessions) => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const editButtons = compiled.querySelectorAll('button[routerLink^="update"]');

      // Vérifie qu'il y a un bouton "Edit" pour chaque session (3 dans les données mockées)
      expect(editButtons.length).toBe(3);
      editButtons.forEach((button, index) => {
        expect(button.textContent).toContain('Edit');
        expect(button.getAttribute('routerLink')).toBe(`update/${index + 1}`); // Vérifie les attributs routerLink
      });
    });
  });

});



