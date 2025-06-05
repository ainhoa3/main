import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, map, tap } from 'rxjs';
import { Task, TaskCreatingDTO, TaskUpdatingDTO, TaskPreview } from '../models/task.model';
import { AnimationService } from './animation.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5112/DailyFlow/api/Tasks';
  
  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private animationService: AnimationService,
    private cacheService: CacheService
  ) { }

  // Create a new task
  createTask(task: TaskCreatingDTO): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.post<Task>(`${this.apiUrl}/NewTask`, task, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Get tasks of the day preview
  getTasksOfTheDayPreview(): Observable<TaskPreview[]> {
    const cachedTasks = this.cacheService.getTasksOfTheDay();
    if (cachedTasks) {
      return new Observable<TaskPreview[]>(observer => {
        observer.next(cachedTasks);
        observer.complete();
      });
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksOfTheDayPreview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(tasks => {
        // Cache each task preview
        tasks.forEach(taskPreview => {
          this.cacheService.setTask(taskPreview.id, {
            id: taskPreview.id,
            title: taskPreview.title,
            description: taskPreview.description,
            environment: taskPreview.environment,
            dueDate: taskPreview.dueDate,
            importance: taskPreview.importance,
            done: false,
            priority: 0,
            scheduled: taskPreview.dueDate !== null,
            date: taskPreview.dueDate ? taskPreview.dueDate.toISOString().split('T')[0] : null,
            streak: 0
          });
        });
        this.cacheService.setTasksOfTheDay(tasks);
      })
    );
  }

  // Get a specific task
  getTask(id: number): Observable<Task> {
    const cachedTask = this.cacheService.getTask(id);
    if (cachedTask) {
      return new Observable<Task>(observer => {
        observer.next(cachedTask);
        observer.complete();
      });
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview>(`${this.apiUrl}/GetATask/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(taskPreview => ({
        id: taskPreview.id,
        title: taskPreview.title,
        description: taskPreview.description,
        environment: taskPreview.environment,
        dueDate: taskPreview.dueDate,
        importance: taskPreview.importance,
        done: false,
        priority: 0,
        scheduled: taskPreview.dueDate !== null,
        date: taskPreview.dueDate ? taskPreview.dueDate.toISOString().split('T')[0] : null,
        streak: 0
      })),
      tap(task => {
        this.cacheService.setTask(id, task);
      })
    );
  }

  // Mark a task as done
  markTaskAsDone(id: number): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.get<Task>(`${this.apiUrl}/MarkAsDone/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap((task: Task) => {
        // Update cache
        this.cacheService.setTask(id, task);
        
        // Show fire animation if task has date and streak
        if (task.date && task.streak) {
          this.animationService.showFire({ date: task.date, streak: task.streak });
        }
      })
    );
  }

  // Search tasks by keyword
  searchTasks(search: string): Observable<TaskPreview[]> {
    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/Search/${search}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Get tasks by date
  getTasksByDate(date: Date): Observable<TaskPreview[]> {
    const formattedDate = new Date(date).toLocaleDateString('en-CA');
    const cachedTasks = this.cacheService.getTasksByDate(formattedDate);
    
    if (cachedTasks) {
      return new Observable<TaskPreview[]>(observer => {
        observer.next(cachedTasks);
        observer.complete();
      });
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksByDatePreview/${formattedDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(tasks => {
        this.cacheService.setTasksOfTheDay(tasks);
      })
    );
  }

  // Get extra tasks
  getExtraTasks(): Observable<TaskPreview[]> {
    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetExtraTasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Update a task
  updateTask(id: number, task: TaskUpdatingDTO): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.put<Task>(`${this.apiUrl}/UpdateTask/${id}`, task, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(updatedTask => {
        // Update cache
        this.cacheService.setTask(id, {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          environment: updatedTask.environment,
          dueDate: new Date(updatedTask.dueDate),
          importance: updatedTask.importance,
          done: updatedTask.done,
          priority: 0,
          scheduled: updatedTask.dueDate !== null,
          date: updatedTask.dueDate ? updatedTask.dueDate.toISOString().split('T')[0] : null,
          streak: 0
        });
      })
    );
  }

  // Delete a task
  deleteTask(id: number): Observable<void> {
    const token = this.authService.getToken();
    return this.http.delete<void>(`${this.apiUrl}/DeleteTask/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(() => {
        // Remove task from cache
        this.cacheService.clearCache();
      })
    );
  }
}