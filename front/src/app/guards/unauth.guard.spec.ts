import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Router } from '@angular/router';
import { UnauthGuard } from './unauth.guard';
import { SessionService } from '../services/session.service';

describe('UnauthGuard', () => {
  let guard: UnauthGuard;
  let router: Router;
  let sessionService: SessionService;

  beforeEach(() => {
    const routerMock = {
      navigate: jest.fn(),
    };

    const sessionServiceMock = {};
    Object.defineProperty(sessionServiceMock, 'isLogged', {
      get: jest.fn(),
    });

    TestBed.configureTestingModule({
      providers: [
        UnauthGuard,
        { provide: Router, useValue: routerMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    });

    guard = TestBed.inject(UnauthGuard);
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);
  });

  it('devrait autoriser l\'activation si \'utilisateur n\'est pas logué', () => {
    jest.spyOn(sessionService, 'isLogged', 'get').mockReturnValue(false);

    const canActivate = guard.canActivate();

    expect(canActivate).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('devrait bloquer l\'activation et naviguer vers "rentals" si l\'utilisateur est logué', () => {
    jest.spyOn(sessionService, 'isLogged', 'get').mockReturnValue(true);

    const canActivate = guard.canActivate();

    expect(canActivate).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['rentals']);
  });
});
