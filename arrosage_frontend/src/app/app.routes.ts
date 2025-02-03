import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { AssignRfidComponent } from './assign-rfid/assign-rfid.component';
import { DashboardUtilisateurComponent } from './demo/dashboard/dashboard-utilisateur/dashboard-utilisateur.component';
import { DashboardSimpleComponent } from './demo/dashboard/dashboard-simple/dashboard-simple.component';
import { HistoriqueElementComponent } from './demo/historique/historique-element/historique-element.component';
import { AuthGuard } from './guards/auth.guard';



export const routes: Routes = [
  // Route de login comme page d'accueil
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Routes protégées
  {
      path: 'register',
      component: UserRegistrationComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'users',
      component: UserListComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'users/assign-rfid/:id',
      component: AssignRfidComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'users/edit/:id',
      component: UserEditComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'demo/dashboard/dashboard-utilisateur',
      component: DashboardUtilisateurComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'demo/dashboard/dashboard-simple',
      component: DashboardSimpleComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'demo/historique/historique-element',
      component: HistoriqueElementComponent,
      canActivate: [AuthGuard]
  },
  {
      path: 'user-profile',
      component: UserProfileComponent,
      canActivate: [AuthGuard]
  },

  // Route wildcard en dernier
  { path: '**', redirectTo: 'login' }
];
