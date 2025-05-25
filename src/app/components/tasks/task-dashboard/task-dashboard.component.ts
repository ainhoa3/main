import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { TaskPreview } from '../../../models/task.model';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.css']
})
export class TaskDashboardComponent implements OnInit {
  todayTasksCount: number = 0;
  todayHabitsCount: number = 0;
  loading: boolean = true;

  constructor(
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadTodayTasks();
  }

  loadTodayTasks(): void {
    this.loading = true;
    this.taskService.getTasksOfTheDayPreview().subscribe({
      next: (tasks: TaskPreview[]) => {
        this.todayTasksCount = tasks.filter(task => !task.done).length;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  navigateToHabits(): void {
    this.router.navigate(['/habits']);
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/tasks/new']);
  }
}
