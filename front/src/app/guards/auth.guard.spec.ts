import { TestBed } from '@angular/core/testing';
import {expect} from '@jest/globals';
import { AuthGuard } from './auth.guard';
import {SessionService} from "../services/session.service";
import {Router} from "@angular/router";

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionService: SessionService;

  beforeEach(() => {
    const sessionServiceMock = {};
    Object.defineProperty(sessionServiceMock, 'isLogged', {
      get: jest.fn(), // Define as a mockable getter
    });

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    sessionService = TestBed.inject(SessionService);
  });

  it('devrait autoriser la navigation si authentifié', () => {
    jest.spyOn(sessionService, 'isLogged', 'get').mockReturnValue(true);

    const canActivate = guard.canActivate();
    expect(canActivate).toBeTruthy();
  });

  it('devrait bloquer la navigation si non authentifié', () => {
    jest.spyOn(sessionService, 'isLogged', 'get').mockReturnValue(false);

    const canActivate = guard.canActivate();
    expect(canActivate).toBeFalsy();
  });
});
