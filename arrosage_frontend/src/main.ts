import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DashboardAdminComponent } from './app/demo/dashboard/dashboard-admin/dashboard-admin.component';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(DashboardAdminComponent),
    provideRouter([{ path: '', component: DashboardAdminComponent }])
  ]
}).catch((err) => console.error(err));
