import {expect} from '@jest/globals';
import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SessionService} from 'src/app/services/session.service';

import {MeComponent} from './me.component';
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";
import {Observable, of} from "rxjs";
import {User} from "../../interfaces/user.interface";
// import {SessionInformation} from "../../interfaces/sessionInformation.interface";
import {RouterTestingModule} from "@angular/router/testing";
import {materialModule} from "../../app.module";

describe('MeComponent', () => {

  const mockUserNonAdmin: User = {
    id: 1,
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'prenom.nom@test.com',
    admin: false,
    password: 'test!1234',
    createdAt: new Date('2025-02-25'),
  };

  const mockUserAdmin: User = {
    ...mockUserNonAdmin,
    admin: true,
  };

  describe('MeComponent - Tests Unitaires', () => {
    let component: MeComponent;
    let sessionServiceMock: Partial<SessionService>;
    let userServiceMock: Partial<UserService>;
    let snackBarMock: Partial<MatSnackBar>;
    let routerMock: Partial<Router>;

    beforeEach(() => {
      sessionServiceMock = {
        sessionInformation: {
          id: 1,
        } as any,
        logOut: jest.fn(),
      };

      userServiceMock = {
        getById: jest.fn((): Observable<User> => of(mockUserNonAdmin)),
        delete: jest.fn(() => of({})),
      };

      snackBarMock = {
        open: jest.fn(),
      };

      routerMock = {
        navigate: jest.fn(),
      };

      TestBed.configureTestingModule({
        declarations: [MeComponent],
        imports: [
          materialModule
        ],
        providers: [
          {provide: SessionService, useValue: sessionServiceMock},
          {provide: UserService, useValue: userServiceMock},
          {provide: MatSnackBar, useValue: snackBarMock},
          {provide: Router, useValue: routerMock},
        ],
      });

      const fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
    });

    it('devrait initialiser le composant et récupérer les informations de l\'utilisateur', () => {
      component.ngOnInit();
      expect(userServiceMock.getById).toHaveBeenCalledWith('1');
      expect(component.user).toEqual(mockUserNonAdmin);
    });

    it('devrait retourner à la page précédente en appelant back()', () => {
      const windowHistorySpy = jest.spyOn(window.history, 'back');
      component.back();
      expect(windowHistorySpy).toHaveBeenCalled();
    });

    it('devrait supprimer le compte utilisateur et rediriger vers la page d\'accueil', () => {
      /**
       * L’objectif est juste de vérifier que la logique interne de la méthode `delete`
       * appelle correctement les services mockés avec les bons arguments et dans
       * le bon ordre (suppression, affichage de notification, déconnexion, redirection).
       * Les dépendances (comme userService, matSnackBar, sessionService, et router` sont
       * moquées grâce à des stubs.
       *Aucune interaction avec l’interface utilisateur n'est testée.
       */
      component.delete();

      expect(userServiceMock.delete).toHaveBeenCalledWith('1');
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        {duration: 3000}
      );
      expect(sessionServiceMock.logOut).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('MeComponent - Tests d\'intégration', () => {
    let component: MeComponent;
    let fixture: ComponentFixture<MeComponent>;
    let userServiceMock: Partial<UserService>;
    let sessionServiceMock: Partial<SessionService>;
    let router: Router ;

    beforeEach(() => {
      sessionServiceMock = {
        sessionInformation: {
          id: 1,
        } as any,
      };

      userServiceMock = {
        getById: jest.fn(),
        delete: jest.fn(),
      };

      TestBed.configureTestingModule({
        declarations: [MeComponent],
        imports: [
          HttpClientModule,
          RouterTestingModule,
          materialModule
        ],
        providers: [
          {provide: UserService, useValue: userServiceMock},
          {provide: SessionService, useValue: sessionServiceMock},
        ],
      });
      router = TestBed.inject(Router);
      fixture = TestBed.createComponent(MeComponent);
      component = fixture.componentInstance;
    });

    it('devrait afficher les informations pour un utilisateur non-admin', () => {
      userServiceMock.getById = jest.fn(() => of(mockUserNonAdmin));

      fixture.detectChanges(); // Lance le cycle de vie Angular

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('[cy-data="user-name"]')?.textContent)
        .toContain('Name: ' + mockUserNonAdmin.firstName + ' ' + mockUserNonAdmin.lastName.toUpperCase());
      expect(compiled.querySelector('[cy-data="user-email"]')?.textContent)
        .toContain('Email: ' + mockUserNonAdmin.email);
      expect(compiled.textContent).toContain('Delete my account:');
      expect(compiled.querySelector('button[cy-data="delete-action"]')).toBeTruthy();
    });

    it('devrait afficher les informations pour un utilisateur admin', () => {
      userServiceMock.getById = jest.fn(() => of(mockUserAdmin));

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('[cy-data="user-name"]')?.textContent)
        .toContain('Name: ' + mockUserAdmin.firstName + ' ' + mockUserAdmin.lastName.toUpperCase());
      expect(compiled.querySelector('[cy-data="user-email"]')?.textContent)
        .toContain('Email: ' + mockUserAdmin.email);
      expect(compiled.querySelector('p.my2').textContent).toContain('You are admin');
      expect(compiled.querySelector('button[cy-data="delete-action"]')).toBeFalsy();
    });

    // it('devrait permettre à un utilisateur non-admin de supprimer leur compte', async () => {
    //   /**
    //    * L’objectif est de vérifier le comportement global lorsqu'un utilisateur non-administrateur
    //    * tente de supprimer son compte, y compris les interactions via l'interface utilisateur
    //    * (bouton lié au DOM).
    //    * Valide que l'intégration des différents services et comportements dans le contexte réel du
    //    * composant fonctionne correctement (cycle de vie Angular, liaison avec le DOM, etc.).
    //    * Néanmoins, on ne veut pas supprimer l'utilisateur mais juste valider le fait
    //    * qu'on est redirigé vers l'écran d'accueil (présente des boutons Login et Register)
    //    */
    //   userServiceMock.getById = jest.fn(() => of(mockUserNonAdmin));
    //   userServiceMock.delete = jest.fn(() => of({}));
    //
    //   fixture.detectChanges();
    //
    //   const deleteSpy = jest.spyOn(component, 'delete');
    //   const navigateSpy = jest.spyOn(router, 'navigate');
    //
    //   // deleteSpy.mockImplementation(() => {
    //   //   // Utilise uniquement l'action du routeur, pas la suppression
    //   //   router.navigate(['/']);
    //   // });
    //
    //   const deleteButton = fixture.nativeElement.querySelector('button[cy-data="delete-action"]');
    //   expect(deleteButton).toBeTruthy();
    //   deleteButton.click();
    //
    //   expect(component.delete).toHaveBeenCalled();
    //   expect(userServiceMock.delete).toHaveBeenCalledWith('1');
    //   //expect(navigateSpy).toHaveBeenCalledWith(['/']);
    //
    //   //attendre que la navigation après la route soit terminée
    //   // Attendez que la navigation soit stable
    //   await fixture.whenStable();
    //
    //   // Définissez manuellement le nouvel état de la vue simulée
    //   await router.navigate(['/']); // Naviguer vers la page d'accueil
    //   await fixture.whenStable();
    //   fixture.detectChanges(); // Met à jour le DOM du test
    //
    //   // Vérifiez le contenu de la page après le routage
    //   const compiled = fixture.nativeElement;
    //
    //   // Vérification : éléments HTML Login et Register présents
    //   const loginElt = compiled.querySelector('[cy-data="Login"]');
    //   const registerElt = compiled.querySelector('[cy-data="Register"]');
    //
    //   expect(loginElt).toBeTruthy();
    //   expect(registerElt).toBeTruthy();
    //
    // });
  });
});
