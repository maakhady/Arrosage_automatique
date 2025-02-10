import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { routes } from './app/app.routes';
import { ApplicationConfig } from '@angular/core';
import 'jquery';
import 'bootstrap';

const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      BrowserModule,
      FormsModule
    )
  ]
};

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
