import {TestBed} from '@angular/core/testing';
import {expect} from '@jest/globals';
import {Routes, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Location} from '@angular/common';
import {MeComponent} from './components/me/me.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {AuthGuard} from './guards/auth.guard';
import {UnauthGuard} from './guards/unauth.guard';

// Mock pour AuthGuard
class MockAuthGuard {
  canActivate(): boolean {
    return true; // Ajoute une autorisation pour toutes les navigations
  }
}

describe('AppRoutingModule', () => {
  let router: Router;
  let location: Location;

  const routes: Routes = [
    {path: '', redirectTo: '/', pathMatch: 'full'},
    {
      path: 'sessions',
      loadChildren: () =>
        import('./features/sessions/sessions.module').then((m) => m.SessionsModule),
      canActivate: [AuthGuard],
    },
    {path: 'me', component: MeComponent, canActivate: [AuthGuard]},
    {path: '404', component: NotFoundComponent},
    {path: '**', redirectTo: '/404'},
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [
        {provide: AuthGuard, useClass: MockAuthGuard}, // Fournit le mock
        UnauthGuard,
      ],
      declarations: [MeComponent, NotFoundComponent],
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    router.initialNavigation();
  });

  it('doit rediriger vers /404 pour des chemins inconnus', async () => {
    await router.navigate(['/chemin-inexistant']);
    expect(location.path()).toBe('/404'); // Vérifie que la redirection fonctionne
  });

  it('devrait rediriger de "/" vers la route racine configurée', async () => {
    await router.navigate(['/']);
    expect(location.path()).toBe('/'); // Vérifie que la redirection fonctionne comme prévu
  });

  it('doit charger le module SessionsModule pour /sessions quand AuthGuard est activé', async () => {
    await router.navigate(['/sessions']);
    expect(location.path()).toBe('/sessions'); // Vérifie la navigation
  });

  it('doit charger MeComponent pour la route /me quand AuthGuard est activé', async () => {
    await router.navigate(['/me']);
    expect(location.path()).toBe('/me');
  });

  it('doit afficher NotFoundComponent pour la route /404', async () => {
    await router.navigate(['/404']);
    expect(location.path()).toBe('/404');
  });


});
