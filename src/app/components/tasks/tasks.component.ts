import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { TodayTasksComponent } from './today-tasks/today-tasks.component';
import { ExtraTasksComponent } from './extra-tasks/extra-tasks.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TodayTasksComponent,
    ExtraTasksComponent
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  loading: boolean = true;

  constructor(
    private router: Router,
    private taskService: TaskService
  ) {}

  navigateToCreateTask(): void {
    this.router.navigate(['/create-task']);
  }
}
