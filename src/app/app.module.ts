import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { TaskDetailComponent } from './components/tasks/task-detail/task-detail.component';
import { TaskService } from './services/task.service';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    TaskDetailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    TaskService,
    AuthService
  ],
  bootstrap: [TaskDetailComponent]
})
export class AppModule { }
