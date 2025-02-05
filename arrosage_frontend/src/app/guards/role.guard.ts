import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Définir un type pour les rôles
type UserRole = 'super-admin' | 'utilisateur';

// Définir l'interface pour les routes
interface RoleRouteMap {
  'super-admin': string;
  'utilisateur': string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  // Définir les routes avec le bon type
  private readonly roleRoutes: RoleRouteMap = {
    'super-admin': '/demo/dashboard/dashboard-utilisateur',
    'utilisateur': '/demo/dashboard/dashboard-simple'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const user = this.authService.getCurrentUser();
    const requiredRole = route.data['role'] as UserRole;

    // Vérifier si l'utilisateur existe
    if (!user) {
      console.log('Redirection: utilisateur non trouvé');
      return this.router.createUrlTree(['/auth']);
    }

    // Vérifier si le rôle est valide
    if (!requiredRole || !this.isValidRole(requiredRole)) {
      console.log('Redirection: rôle invalide ou non défini');
      return this.router.createUrlTree(['/auth']);
    }

    // Vérifier si l'utilisateur a le bon rôle
    if (user.role !== requiredRole) {
      console.log(`Redirection: rôle incorrect (${user.role} vs ${requiredRole})`);
      const redirectRoute = this.getRoleRoute(user.role as UserRole);
      return this.router.createUrlTree([redirectRoute]);
    }

    return true;
  }

  // Méthode pour vérifier si un rôle est valide
  private isValidRole(role: string): role is UserRole {
    return role in this.roleRoutes;
  }

  // Méthode pour obtenir la route pour un rôle
  private getRoleRoute(role: UserRole): string {
    return this.roleRoutes[role] || '/auth';
  }
}
