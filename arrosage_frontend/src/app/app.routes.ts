import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { AssignRfidComponent } from './assign-rfid/assign-rfid.component';
import { DashboardAdminComponent } from './demo/dashboard/dashboard-admin/dashboard-admin.component';
import { DashboardUtilisateurComponent } from './demo/dashboard/dashboard-utilisateur/dashboard-utilisateur.component';

export const routes: Routes = [
    { path: '', component: AuthComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'register', component: UserRegistrationComponent },
    { path: 'users', component: UserListComponent },
    { path: 'users/assign-rfid/:id', component: AssignRfidComponent },
    { path: 'users/edit/:id', component: UserEditComponent },
    { path: 'demo/dashboard/dashboard-admin', component: DashboardAdminComponent },
    { path: 'demo/dashboard/dashboard-utilisateur', component: DashboardUtilisateurComponent },
    { path: '**', redirectTo: '' } // Redirection pour les routes inconnues
];
