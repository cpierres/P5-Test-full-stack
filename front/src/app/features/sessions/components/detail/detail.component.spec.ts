import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {RouterTestingModule} from '@angular/router/testing';
import {expect} from '@jest/globals';
import {SessionService} from '../../../../services/session.service';

import {DetailComponent} from './detail.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {ActivatedRoute} from "@angular/router";
import {of} from "rxjs";

const mockSessionService = {
  sessionInformation: {
    admin: true,
    id: 1,
  },
};

const mockSessionApiService = {
  detail: jest.fn(),
  participate: jest.fn().mockReturnValue(of(undefined)), // Observable<void>
};

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let service: SessionService;

  beforeEach(async () => {
    const mockActivatedRoute = {
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
        MatSnackBarModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
      ],
      declarations: [DetailComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: SessionService, useValue: mockSessionService},
        {provide: 'SessionApiService', useValue: mockSessionApiService},
      ],
    }).compileComponents();

    service = TestBed.inject(SessionService);
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;

    component.session = {
      id: 1,
      name: 'Session Test',
      users: [],
      teacher_id: 123,
      date: new Date(),
      description: 'Description de test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fixture.detectChanges();
  });

  describe('Tests unitaires', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('devrait initialiser les propriétés isAdmin et userId à partir du service de session', () => {
      expect(component.isAdmin).toBe(mockSessionService.sessionInformation.admin);
      expect(component.userId).toBe(mockSessionService.sessionInformation.id.toString());
    });

    it('devrait appeler window.history.back() lorsqu\'on appelle la méthode back()', () => {
      const historySpy = jest.spyOn(window.history, 'back');
      component.back();
      expect(historySpy).toHaveBeenCalled();
    });

    it('devrait récupérer sessionId depuis route.snapshot', () => {
      const routeSpy = jest.spyOn(component['route'].snapshot.paramMap, 'get');
      expect(component.sessionId).toBe(routeSpy.mock.results[0].value);
    });

  });

  describe('Tests d\'intégration', () => {
    it('devrait afficher la session si les données de session existent', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('h1')?.textContent).toContain('Session Test');
    });

    it('devrait afficher bouton Delete pour un administrateur', () => {
      component.isAdmin = true;
      fixture.detectChanges();
      const compiled: HTMLElement = fixture.nativeElement;
      //console.log('HTMLElement:', compiled.innerHTML);

      //Il pourrait y avoir plusieurs boutons avec ce sélecteur
      //NOTE : attention de bien importer MatCardModule (sinon le querySelector échouera) !
      //const buttons = compiled.querySelectorAll('button[mat-raised-button][color="warn"] span.ml1');

      //Vérifier si au moins un contient "Delete"
      //const hasDeleteButton = Array.from(buttons).some(button => button.textContent?.includes('Delete'));
      //expect(hasDeleteButton).toBe(true);

      //ci-dessus ok mais j'ai ajouté data-test="delete-action" pour trouver facilement le bouton
      const deleteButton = compiled.querySelector('[data-test="delete-action"]');
      expect(deleteButton).toBeTruthy();

    });

    it('devrait appeler `delete()` lorsque le bouton supprimer est cliqué', () => {
      const deleteSpy = jest.spyOn(component, 'delete');
      component.isAdmin = true;
      fixture.detectChanges();
      const deleteButton = fixture.nativeElement.querySelector('[data-test="delete-action"]');
      deleteButton.click();
      expect(deleteSpy).toHaveBeenCalled();
    });

    it('devrait afficher bouton Participate pour un utilisateur non-administrateur et n\'ayant pas encore participé', () => {
      component.isAdmin = false;
      component.isParticipate = false;
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[mat-raised-button][color="primary"]') as NodeListOf<HTMLElement>;
      const participateButton = Array.from(buttons).find(
        (button) => button.textContent?.includes('Participate')
      );
      expect(participateButton).toBeTruthy();
    })


    it('devrait appeler la méthode participate() lorsque le bouton de participation est cliqué', () => {
      const participateSpy = jest.spyOn(component, 'participate');
      component.isAdmin = false;
      component.isParticipate = false;
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[mat-raised-button][color="primary"]') as NodeListOf<HTMLElement>;

      const participateButton = Array.from(buttons).find(
        (button) => button.textContent?.includes('Participate')
      );

      if (participateButton) {
        participateButton.click();
        expect(participateSpy).toHaveBeenCalled();
      }
    });

    it('devrait afficher bouton `Do not participate` pour un utilisateur non-administrateur inscrit', () => {
      component.isAdmin = false;
      component.isParticipate = true;
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[mat-raised-button][color="warn"]') as NodeListOf<HTMLElement>;
      const participateButton = Array.from(buttons).find(
        (button) => button.textContent?.includes('Do not participate')
      );
      expect(participateButton).toBeTruthy();
    })

    it('devrait appeler `unParticipate()` lorsque le bouton `Do not participate` est cliqué', () => {
      const unParticipateSpy = jest.spyOn(component, 'unParticipate');
      component.isAdmin = false;
      component.isParticipate = true;
      fixture.detectChanges();
      // const button = fixture.nativeElement.querySelector('button[mat-raised-button][color="warn"]');
      // button.click();

      const buttons = fixture.nativeElement.querySelectorAll('button[mat-raised-button][color="warn"]') as NodeListOf<HTMLElement>;
      const unparticipateButton = Array.from(buttons).find(
        (button) => button.textContent?.includes('Do not participate')
      );

      if (unparticipateButton) {
        unparticipateButton.click();
        expect(unParticipateSpy).toHaveBeenCalled();
      }

    });

    it('devrait mettre à jour le comptage des attendees à l\'écran après la participation', () => {
      component.isAdmin = false;
      component.isParticipate = false;

      // Initialisation : simule une session avec 1 seul participant
      component.session = {
        id: 1,
        name: 'Session Test',
        users: [1], // ID 1 déjà inscrit
        teacher_id: 123,
        date: new Date(),
        description: 'Description Session Yoga',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fixture.detectChanges();

      // Mock de `SessionApiService` utilisé : le nombre d'attendees passera à 2
      const newSessionData = {
        id: 1,
        name: 'Session Test',
        users: [1, 2], // Ajoute user 2
        teacher_id: 123,
        date: new Date(),
        description: 'Description Session Yoga',
        //createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Moquer la méthode `participate` du composant
      const participateSpy = jest.spyOn(component, 'participate').mockImplementation(() => {
        // Modifier directement component.session plutôt que passer par api
        component.session = newSessionData;
      });

      fixture.detectChanges();

      // Vérification initiale du DOM (avant participation)
      const attendeesElementBefore = fixture.nativeElement.querySelector('[data-test="attendees-count"]');
      expect(attendeesElementBefore.textContent).toContain('1 attendees');

      // Simuler un clic sur le bouton "Participer" recherché via `data-test`
      const participateButton = fixture.nativeElement.querySelector('[data-test="participate-action"]');
      participateButton.click();

      fixture.detectChanges();

      // Après participation : vérification des appels
      expect(participateSpy).toHaveBeenCalled();

      // Vérification du DOM après participation
      const attendeesElementAfter = fixture.nativeElement.querySelector('[data-test="attendees-count"]');
      expect(attendeesElementAfter.textContent).toContain('2 attendees'); // Le comptage des attendees doit être mis à jour
    });

   });
});
