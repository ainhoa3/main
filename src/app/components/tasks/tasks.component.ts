import { Component, OnInit } from '@angular/core';
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
export class TasksComponent implements OnInit {
  loading: boolean = true;
  activeTab: 'today' | 'extra' = 'today';

  constructor(
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Cargar datos iniciales si es necesario
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/create-task']);
  }

  setActiveTab(tab: 'today' | 'extra'): void {
    this.activeTab = tab;
  }
}
