import {TestBed} from '@angular/core/testing';
import {expect} from '@jest/globals';
import {HttpHandler, HttpRequest} from '@angular/common/http';
import {JwtInterceptor} from './jwt.interceptor';
import {SessionService} from '../services/session.service';

describe('JwtInterceptor (Intercepteur JWT)', () => {
  let interceptor: JwtInterceptor;
  let sessionService: SessionService;
  let httpHandlerMock: HttpHandler;

  beforeEach(() => {
    const sessionServiceMock = {
      isLogged: false,
      sessionInformation: undefined, // Par défaut, sessionInformation est undefined
    };

    httpHandlerMock = {
      handle: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        JwtInterceptor,
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: HttpHandler, useValue: httpHandlerMock },
      ],
    });

    interceptor = TestBed.inject(JwtInterceptor);
    sessionService = TestBed.inject(SessionService);
  });

  it("doit passer la requête d'origine si le client n'est pas connecté", () => {
    const requestMock = new HttpRequest('GET', '/api/resource');

    interceptor.intercept(requestMock, httpHandlerMock);

    expect(httpHandlerMock.handle).toHaveBeenCalledWith(requestMock);
  });

  it("doit ajouter un en-tête 'Authorization' si le client est connecté avec un token valide", () => {
    sessionService.isLogged = true;
    sessionService.sessionInformation = {
      token: 'fake-jwt-token',
      type: '',
      id: 1,
      username: '',
      lastName: '',
      firstName: '',
      admin: true,
    };

    const requestMock = new HttpRequest('GET', '/api/resource');
    const cloneSpy = jest.spyOn(requestMock, 'clone');

    interceptor.intercept(requestMock, httpHandlerMock);

    expect(cloneSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        setHeaders: {
          Authorization: 'Bearer fake-jwt-token',
        },
      })
    );
    expect(httpHandlerMock.handle).toHaveBeenCalledWith(expect.any(HttpRequest));
  });

});

