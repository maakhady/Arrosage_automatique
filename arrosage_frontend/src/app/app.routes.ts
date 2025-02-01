import { Routes } from '@angular/router';
import { DashboardAdminComponent } from './demo/dashboard/dashboard-admin/dashboard-admin.component';
import { DashboardUtilisateurComponent } from './demo/dashboard/dashboard-utilisateur/dashboard-utilisateur.component';



export const routes: Routes = [
    { path: 'demo/dashboard/dashboard-admin', component: DashboardAdminComponent },
    { path: 'demo/dashboard/dashboard-utilisateur', component: DashboardUtilisateurComponent },


];
