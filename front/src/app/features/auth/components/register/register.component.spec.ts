import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

import { RegisterComponent } from './register.component';
import {By} from "@angular/platform-browser";

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
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

  it('devrait désactiver le bouton de soumission si le formulaire est invalide', () => {
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeTruthy();
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

});
