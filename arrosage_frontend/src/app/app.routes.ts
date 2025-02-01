import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { AssignRfidComponent } from './assign-rfid/assign-rfid.component';

export const routes: Routes = [
  { path: 'register', component: UserRegistrationComponent },
  { path: 'users', component: UserListComponent },
  { path: 'users/:id', component: UserDetailsComponent },
  { path: 'users/assign-rfid/:id', component: AssignRfidComponent },
  { path: 'users/edit/:id', component: UserEditComponent },
  { path: '', redirectTo: '/users', pathMatch: 'full' }
];
