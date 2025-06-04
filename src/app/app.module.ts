import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { SpinnerComponent } from './components/shared/spinner/spinner.component';

import { TaskService } from './services/task.service';
import { AuthService } from './services/auth.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SpinnerComponent
  ],
  providers: [
    TaskService,
    AuthService
  ]
})
export class AppModule { }
