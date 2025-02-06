// app.routes.ts
import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Redirection par défaut vers auth
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },

  // Route d'authentification
  {
    path: 'auth',
    component: AuthComponent
  },

  // Routes protégées du dashboard
  {
    path: 'demo/dashboard',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard-utilisateur',
        loadComponent: () => import('./demo/dashboard/dashboard-utilisateur/dashboard-utilisateur.component')
          .then(m => m.DashboardUtilisateurComponent),
        canActivate: [RoleGuard],
        data: { role: 'super-admin' }
      },
      {
        path: 'dashboard-simple',
        loadComponent: () => import('./demo/dashboard/dashboard-simple/dashboard-simple.component')
          .then(m => m.DashboardSimpleComponent),
        canActivate: [RoleGuard],
        data: { role: 'utilisateur' }
      },
      {
        path: 'historique',
        loadComponent: () => import('./demo/dashboard/historique/historique.component')
          .then(m => m.HistoriqueComponent),
        // canActivate: [RoleGuard],
        // data: { role: 'super-admin' , 'utilisateur'} // Même niveau d'accès que dashboard-utilisateur
      }
    ]
  },
  {
    path: 'user-list',
    loadComponent: () => import('./user-list/user-list.component')
      .then(m => m.UserListComponent),
    canActivate: [AuthGuard]  // Si vous voulez garder la protection AuthGuard
  },
  {
    path: 'users/edit/:id',
    loadComponent: () => import('./user-edit/user-edit.component')
      .then(m => m.UserEditComponent),
    canActivate: [AuthGuard]
},
  {
    path: 'user-details',
    loadComponent: () => import('./user-details/user-details.component')
      .then(m => m.UserDetailsComponent),
    canActivate: [AuthGuard]  // Si vous voulez garder la protection AuthGuard
  },
  {
    path: 'user-registration',
    loadComponent: () => import('./user-registration/user-registration.component')
      .then(m => m.UserRegistrationComponent),
    canActivate: [AuthGuard]
},
  {
    path: 'users/assign-rfid/:id',
    loadComponent: () => import('./assign-rfid/assign-rfid.component')
      .then(m => m.AssignRfidComponent),
    canActivate: [AuthGuard]
},
  {
    path: 'components',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'gestion-plantes',
        loadComponent: () => import('./components/gestion-plantes/gestion-plantes.component')
          .then(m => m.GestionPlantesComponent),
      },
      {
        path: 'user-profile',
        loadComponent: () => import('./components/user-profile/user-profile.component')
          .then(m => m.UserProfileComponent),
      }


    ]
  },

  // Route pour les chemins inconnus
  {
    path: '**',
    redirectTo: 'auth'
  }
];
