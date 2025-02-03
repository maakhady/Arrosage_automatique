import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Ajout de l'import manquant

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
    console.log('AuthGuard initialisé');
  }

  canActivate(): boolean {
    console.log('AuthGuard - Vérification en cours');
    console.log('Est authentifié:', this.authService.isAuthenticated);
    console.log('Token valide:', this.authService.verifierToken());
    console.log('Role:', this.authService.userRole);

    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated) {
      console.log('AuthGuard - Non authentifié');
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier si le token est valide
    if (!this.authService.verifierToken()) {
      console.log('AuthGuard - Token invalide');
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = this.authService.userRole;

    // Si déjà sur une page dashboard
    if (this.router.url.includes('dashboard')) {
      return true;
    }

    // Redirection selon le rôle
    if (userRole) {
      switch (userRole) {
        case 'super-admin':
          console.log('AuthGuard - Redirection super-admin');
          this.router.navigate(['/demo/dashboard/dashboard-utilisateur']);
          return true;

        case 'utilisateur':
          console.log('AuthGuard - Redirection utilisateur');
          this.router.navigate(['/demo/dashboard/dashboard-simple']);
          return true;

        default:
          console.log('AuthGuard - Rôle non reconnu');
          this.router.navigate(['/login']);
          return false;
      }
    }

    console.log('AuthGuard - Pas de rôle trouvé');
    this.router.navigate(['/login']);
    return false;
  }
}
