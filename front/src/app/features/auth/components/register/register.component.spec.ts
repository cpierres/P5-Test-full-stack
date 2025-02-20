import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {expect} from '@jest/globals';

import {RegisterComponent} from './register.component';
import {By} from "@angular/platform-browser";
import {of, throwError} from "rxjs";
import {AuthService} from "../../services/auth.service";
import {RegisterRequest} from "../../interfaces/registerRequest.interface";
import {Router} from "@angular/router";

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  const routerMock = {
    navigate: jest.fn() // Création d'une méthode navigate espionnée
  };

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        {provide: AuthService, useValue: authServiceMock},
        {provide: Router, useValue: routerMock}
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('devrait initialiser le formulaire avec des champs vides', () => {
    const form = component.form;
    expect(form).toBeTruthy();
    expect(form.value).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
  });

  it('devrait valider le formulaire lorsque tous les champs sont remplis', () => {
    const form = component.form;

    form.controls['firstName'].setValue('Christophe');
    form.controls['lastName'].setValue('Pierrès');
    form.controls['email'].setValue('christophe.pierres@example.com');
    form.controls['password'].setValue('password123');

    expect(form.valid).toBe(true);
  });

  it('devrait afficher un message d\'erreur si onError est vrai', () => {
    component.onError = true;
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('.error'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain('An error occurred');
  });

  it('le bouton Submit doit être disabled si le formulaire est invalide/pas complet', () => {
    // Laisser le formulaire vide pour qu'il soit invalide
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;

    fixture.detectChanges();

    // Vérification que le bouton "Submit" est désactivé au départ
    expect(submitButton.disabled).toBeTruthy();

    // Remplir partiellement le formulaire pour qu'il reste invalide
    component.form.controls['firstName'].setValue('Christophe');
    component.form.controls['lastName'].setValue('');
    component.form.controls['email'].setValue('cpierres@test.com');
    component.form.controls['password'].setValue('');

    fixture.detectChanges();

    // Ré-vérification : le bouton "Submit" doit toujours être désactivé
    expect(submitButton.disabled).toBeTruthy();
  });

  it('devrait appeler la méthode submit() lorsqu\'on soumet le formulaire', () => {
    jest.spyOn(component, 'submit');

    component.form.controls['firstName'].setValue('Christophe');
    component.form.controls['lastName'].setValue('Pierrès');
    component.form.controls['email'].setValue('cpierres@example.com');
    component.form.controls['password'].setValue('password123');
    component.form.updateValueAndValidity();

    const formElement = fixture.debugElement.query(By.css('form')).nativeElement;
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(component.submit).toHaveBeenCalled();
  });

  it('devrait envoyer les données de formulaire via AuthService.register', () => {
    // Simulation d'une réponse positive de la méthode register
    authServiceMock.register.mockReturnValue(of(void 0));

    // Remplir le formulaire avec des données valides
    component.form.controls['firstName'].setValue('Christophe');
    component.form.controls['lastName'].setValue('Pierrès');
    component.form.controls['email'].setValue('cpierres@test.com');
    component.form.controls['password'].setValue('password123');

    const formElement = fixture.debugElement.query(By.css('form')).nativeElement;
    formElement.dispatchEvent(new Event('submit')); // Simule la soumission du formulaire

    fixture.detectChanges();

    // Vérification que AuthService.register a été appelé avec les bonnes données
    const expectedRequest: RegisterRequest = {
      firstName: 'Christophe',
      lastName: 'Pierrès',
      email: 'cpierres@test.com',
      password: 'password123'
    };
    expect(authServiceMock.register).toHaveBeenCalledWith(expectedRequest);

    expect(component.onError).toBe(false);
  });

  it('devrait rediriger vers /login après un succès d\'enregistrement', fakeAsync(() => {
    // Mock d'un succès de la méthode register
    authServiceMock.register.mockReturnValue(of(void 0));

    // Remplir le formulaire avec des données valides
    component.form.controls['firstName'].setValue('Christophe');
    component.form.controls['lastName'].setValue('Pierrès');
    component.form.controls['email'].setValue('cpierres@test.com');
    component.form.controls['password'].setValue('password123');
    component.form.updateValueAndValidity(); // Force Angular à valider correctement le formulaire

    // Appel explicite de la méthode submit
    component.submit();

    // Résolution des tâches asynchrones
    flush(); // Résout l'observable de register immédiatement

    // Vérifie que navigate est appelé
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  }));



  it('devrait afficher un message d\'erreur lorsque AuthService.register échoue', () => {
    // Simulation d'une erreur lors de l'appel de AuthService.register
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Erreur serveur')));

    // Remplir le formulaire avec des données valides
    component.form.controls['firstName'].setValue('Christophe');
    component.form.controls['lastName'].setValue('Pierrès');
    component.form.controls['email'].setValue('cpierres@test.com');
    component.form.controls['password'].setValue('password123');

    const formElement = fixture.debugElement.query(By.css('form')).nativeElement;
    formElement.dispatchEvent(new Event('submit')); // Simule la soumission du formulaire

    fixture.detectChanges();

    // Vérification que AuthService.register a bien été appelé
    const expectedRequest: RegisterRequest = {
      firstName: 'Christophe',
      lastName: 'Pierrès',
      email: 'cpierres@test.com',
      password: 'password123'
    };
    expect(authServiceMock.register).toHaveBeenCalledWith(expectedRequest);

    // Vérification que `onError` est passé à true en cas d'erreur
    expect(component.onError).toBe(true);
  });

});
