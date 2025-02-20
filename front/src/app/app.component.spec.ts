import {HttpClientModule} from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatToolbarModule} from '@angular/material/toolbar';
import {expect} from '@jest/globals';

import {AppComponent} from './app.component';
import {of} from "rxjs";
import {Router} from "@angular/router";
import {SessionService} from "./services/session.service";
import {UnauthGuard} from "./guards/unauth.guard";
import {AuthGuard} from "./guards/auth.guard";
import {Component, NgModule} from "@angular/core";
import {RouterTestingModule} from "@angular/router/testing";

// Composant factice pour simuler les composants réels
@Component({
  template: '<div>Dummy Component</div>'
})
class DummyComponent {
}

@NgModule({declarations: [DummyComponent], exports: [DummyComponent]})
class DummyModule {
}

class MockAuthGuard {
  canActivate() {
    return of(true);
  }
}

class MockUnauthGuard {
  canActivate() {
    return of(true);
  }
}

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerMock: any;
  let sessionServiceMock: any;

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn(),
      routerState: {root: {}},//pour éviter erreur Root !
    };
    sessionServiceMock = {
      $isLogged: jest.fn().mockReturnValue(of(true)),
      logOut: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([ // Ajout des 2 routes testées
          {
            path: '',
            canActivate: [MockUnauthGuard],
            component: DummyComponent
          },
          {
            path: 'sessions',
            canActivate: [MockAuthGuard],
            component: DummyComponent
          },
        ]),
        DummyModule,
        HttpClientModule,
        MatToolbarModule,
      ],
      declarations:
        [
          AppComponent,
          DummyComponent,
        ],
      providers:
        [
          {provide: Router, useValue: routerMock},
          {provide: SessionService, useValue: sessionServiceMock},
          {provide: AuthGuard, useClass: MockAuthGuard},
          {provide: UnauthGuard, useClass: MockUnauthGuard}
        ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('devrait appeler sessionService.$isLogged() pour vérifier si un utilisateur est connecté', (done) => {
    app.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(true);
      expect(sessionServiceMock.$isLogged).toHaveBeenCalled();
      done();
    });
  });

  it('devrait retourner false lorsque le service indique que l’utilisateur n\'est pas connecté', (done) => {
    sessionServiceMock.$isLogged.mockReturnValue(of(false));
    app.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(false);
      expect(sessionServiceMock.$isLogged).toHaveBeenCalled();
      done();
    });
  });

  it('devrait exécuter le logout correctement', () => {
    app.logout();
    expect(sessionServiceMock.logOut).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

});
