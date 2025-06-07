import { NgModule, Injectable, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { SpinnerComponent } from './components/shared/spinner/spinner.component';

import { TaskService } from './services/task.service';
import { AuthService } from './services/auth.service';
import { StreakCelebrationService } from './components/streak-celebration/streak-celebration.service';
import { StreakCelebrationComponent } from './components/streak-celebration/streak-celebration.component';
import { FireAnimationComponent } from './shared/components/fire-animation/fire-animation.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    SpinnerComponent,
    StreakCelebrationComponent,
    FireAnimationComponent
  ],
  providers: [
    TaskService,
    AuthService,
    StreakCelebrationService,
    { provide: ErrorHandler, useClass: ErrorHandler }
  ]
})
export class AppModule { }

