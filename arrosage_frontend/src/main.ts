import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi() // Recommandé pour la gestion des intercepteurs HTTP
    ),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule // Ajout du ReactiveFormsModule si nécessaire
    )
  ]
}).catch(err => console.error(err));
