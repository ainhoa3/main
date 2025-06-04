import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { Task, TaskPreview } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  todayTasks: Task[] = [];
  extraTasks: Task[] = [];
  loading = true;
  error = '';
  newTaskTitle = '';
  activeTab: 'today' | 'extra' = 'today';

  constructor(private taskService: TaskService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';
    
    // Cargar tareas de hoy
    this.taskService.getTasksOfTheDayPreview().subscribe({
      next: (tasks) => {
        this.todayTasks = tasks;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las tareas de hoy';
        this.loading = false;
        console.error('Error loading today\'s tasks:', error);
      }
    });

    // Cargar tareas extra
    this.taskService.searchTasks('').subscribe({
      next: (tasks: TaskPreview[]) => {
        this.extraTasks = tasks;
      },
      error: (error) => {
        console.error('Error loading extra tasks:', error);
      }
    });
  }


  addTask(): void {
    if (!this.newTaskTitle.trim()) return;
    
    const newTask: Partial<Task> = {
      title: this.newTaskTitle,
      dueDate: this.activeTab === 'today' ? new Date().toISOString() : undefined,
      done: false
    };
    
    this.taskService.createTask(newTask).subscribe({
      next: (task) => {
        if (this.activeTab === 'today') {
          this.todayTasks.unshift(task);
        } else {
          this.extraTasks.unshift(task);
        }
        this.newTaskTitle = '';
      },
      error: (error) => {
        this.error = 'Error al crear la tarea';
        console.error('Error creating task:', error);
      }
    });
  }


  toggleTaskDone(task: Task): void {
    if (task.done) {
      this.authService.addStrike().subscribe();
    }
    
    this.taskService.markTaskAsDone(task.id).subscribe({
      next: (updatedTask: Task) => {
        const index = this.todayTasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.todayTasks[index] = updatedTask;
        }
      },
      error: (error) => {
        console.error('Error marking task as done:', error);
      }
    });
  }


  deleteTask(taskId: number, taskType: 'today' | 'extra'): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          if (taskType === 'today') {
            this.todayTasks = this.todayTasks.filter(t => t.id !== taskId);
          } else {
            this.extraTasks = this.extraTasks.filter(t => t.id !== taskId);
          }
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }


  setActiveTab(tab: 'today' | 'extra'): void {
    this.activeTab = tab;
  }
}
