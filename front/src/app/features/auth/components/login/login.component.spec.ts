import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {expect} from '@jest/globals';
import {SessionService} from 'src/app/services/session.service';

import {LoginComponent} from './login.component';
import {of} from "rxjs";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

describe('LoginComponent - Tests unitaires et d\'intégration', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let sessionServiceMock: any;
  const routerSpy = {navigate: jest.fn()};//suffit plutôt qu'un vrai spy sur l'objet réel

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn().mockReturnValue(of({id: 1})), // Simule une réponse de succès
    };
    sessionServiceMock = {
      logIn: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        {provide: AuthService, useValue: authServiceMock},
        {provide: SessionService, useValue: sessionServiceMock},
        {provide: Router, useValue: routerSpy}, // Remplace Router par un spy simplifié
      ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('LoginComponent - Tests unitaires', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('doit avoir les valeurs par défaut initialisées', () => {
      expect(component.hide).toBe(true); // "hide" est par défaut vrai
      expect(component.onError).toBe(false); // Aucune erreur au début
    });

    it('doit créer un formulaire avec les contrôles email et password', () => {
      expect(component.form.contains('email')).toBeTruthy();
      expect(component.form.contains('password')).toBeTruthy();
    });

    it('doit invalider le formulaire si les champs sont vides', () => {
      component.form.setValue({
        email: '',
        password: ''
      });
      expect(component.form.invalid).toBeTruthy();
    });

    it('email doit être invalide si le format est incorrect', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('toto@@toto.com');
      expect(emailControl?.invalid).toBeTruthy();
    });

    it('doit rediriger l\'utilisateur sur /sessions en cas de succès', () => {
      component.form.setValue({ email: 'user@example.com', password: 'password' });
      component.submit();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/sessions']);
    });
  });

  describe('LoginComponent - Tests d’intégration', () => {
    it('doit afficher un message d’erreur si onError est vrai', () => {
      component.onError = true;
      fixture.detectChanges(); // Met à jour le DOM
      const errorMessage = fixture.nativeElement.querySelector('.error');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('An error occurred');
    });

    it('devrait appeler la méthode submit() lors de la soumission du formulaire', () => {
      jest.spyOn(component, 'submit');
      const form = fixture.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit')); // Simule un événement de soumission
      expect(component.submit).toHaveBeenCalledTimes(1);
    });

    it('doit appeler login et naviguer en cas de succès de submit()', () => {
      const routerSpy = jest.spyOn(TestBed.inject(Router), 'navigate');

      component.form.setValue({
        email: 'test@test.com',
        password: 'passwordZZZ',
      });

      component.submit();

      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'passwordZZZ',
      });
      expect(sessionServiceMock.logIn).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['/sessions']); // Chemin simulé après login
    });
  });
});
