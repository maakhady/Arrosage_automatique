import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { routes } from './app/app.routes';

// import { importProvidersFrom } from '@angular/core';
// import { provideRouter } from '@angular/router';
import { DashboardAdminComponent } from './app/demo/dashboard/dashboard-admin/dashboard-admin.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(BrowserModule, FormsModule),
  ]
}).catch(err => console.error(err));


// bootstrapApplication(AppComponent, {
//   ...appConfig,
//   providers: [
//     ...(appConfig.providers || []),
//     importProvidersFrom(DashboardAdminComponent),
//     provideRouter([{ path: '', component: DashboardAdminComponent }])
//   ]
// }).catch((err) => console.error(err));
