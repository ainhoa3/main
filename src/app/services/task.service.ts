import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { tap, switchMap, catchError, map } from 'rxjs/operators';
import { Task, TaskCreatingDTO, TaskUpdatingDTO, TaskPreview } from '../models/task.model';
import { AuthService } from './auth.service';
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

  // Transforma un TaskPreview en un Task completo
  private transformTaskPreview(taskPreview: TaskPreview): Task {
    // Si dueDate es null o undefined, usamos la fecha actual
    const dueDate = taskPreview.dueDate ? new Date(taskPreview.dueDate) : new Date();
    const dateStr = dueDate.toISOString().split('T')[0];

    return {
      id: taskPreview.id,
      title: taskPreview.title,
      description: taskPreview.description,
      environment: taskPreview.environment,
      dueDate: dueDate,
      importance: taskPreview.importance,
      done: taskPreview.done,
      priority: taskPreview.priority,
      scheduled: true, // Siempre true ya que siempre tenemos una fecha
      date: dateStr,
      streak: taskPreview.streak || 0
    };
  }

  // Create a new task with cache update
  createTask(task: TaskCreatingDTO): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.post<TaskPreview>(`${this.apiUrl}/NewTask`, task, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(taskPreview => this.transformTaskPreview(taskPreview)),
      tap(newTask => {
        // Actualizar la caché con la nueva tarea
        this.cacheService.setTask(newTask.id, newTask);
        
        const cachedTasks = this.cacheService.getTasksOfTheDay();
        if (cachedTasks) {
          this.cacheService.setTasksOfTheDay([...cachedTasks, newTask]);
        } else {
          this.cacheService.setTasksOfTheDay([newTask]);
        }
      })
    );
  }

  // Get tasks of the day preview
  getTasksOfTheDayPreview(): Observable<Task[]> {
    const cachedTasks = this.cacheService.getTasksOfTheDay();
    if (cachedTasks) {
      return of(cachedTasks);
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksOfTheDayPreview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(tasks => tasks.map(taskPreview => this.transformTaskPreview(taskPreview))),
      tap(tasks => {
        // Cache each task
        tasks.forEach(task => {
          this.cacheService.setTask(task.id, task);
        });
        this.cacheService.setTasksOfTheDay(tasks);
      })
    );
  }

  // Get a single task by ID with cache support
  getTaskById(id: number): Observable<Task> {
    const cachedTask = this.cacheService.getTask(id);
    if (cachedTask) {
      return of(cachedTask);
    }
    
    const token = this.authService.getToken();
    return this.http.get<TaskPreview>(`${this.apiUrl}/GetATask/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(taskPreview => this.transformTaskPreview(taskPreview)),
      tap(task => {
        // Guardar en caché
        this.cacheService.setTask(id, task);
      })
    );
  }

  // Get tasks by date
  getTasksByDate(date: string): Observable<Task[]> {
    const cachedTasks = this.cacheService.getTasksByDate(date);
    if (cachedTasks) {
      return of(cachedTasks);
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksByDatePreview/${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(tasks => tasks.map(taskPreview => this.transformTaskPreview(taskPreview))),
      tap(tasks => {
        // Cache each task
        tasks.forEach(task => {
          this.cacheService.setTask(task.id, task);
        });
        this.cacheService.setTasksByDate(date, tasks);
      })
    );
  }

  // Get extra tasks
  getExtraTasks(): Observable<Task[]> {
    const cachedTasks = this.cacheService.getExtraTasks();
    if (cachedTasks) {
      return of(cachedTasks);
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetExtraTasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(tasks => tasks.map(taskPreview => this.transformTaskPreview(taskPreview))),
      tap(tasks => {
        // Cache each task
        tasks.forEach(task => {
          this.cacheService.setTask(task.id, task);
        });
        this.cacheService.setExtraTasks(tasks);
      })
    );
  }

  // Get all tasks with cache support
  getTasks(forceRefresh = false): Observable<Task[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(currentUser => {
        if (!currentUser || !currentUser.id) {
          return this.http.get<TaskPreview[]>(`${this.apiUrl}`, {
            headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
          }).pipe(
            map(tasks => tasks.map(taskPreview => this.transformTaskPreview(taskPreview)))
          );
        }

        // Si no se fuerza la actualización y hay datos en caché, devolverlos
        if (!forceRefresh) {
          const cachedTasks = this.cacheService.getTasksOfTheDay();
          if (cachedTasks) {
            return of(cachedTasks);
          }
        }

        // Si no hay caché o se fuerza la actualización, hacer la petición
        const token = this.authService.getToken();
        return this.http.get<TaskPreview[]>(`${this.apiUrl}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).pipe(
          map(tasks => tasks.map(taskPreview => this.transformTaskPreview(taskPreview))),
          tap(tasks => {
            // Cache each task
            tasks.forEach(task => {
              this.cacheService.setTask(task.id, task);
            });
            this.cacheService.setTasksOfTheDay(tasks);
          }),
          catchError(() => of([]))
        );
      })
    );
  }

  // Get a specific task
  getTask(id: number): Observable<Task> {
    const cachedTask = this.cacheService.getTask(id);
    if (cachedTask) {
      return of(cachedTask);
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview>(`${this.apiUrl}/GetATask/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(taskPreview => this.transformTaskPreview(taskPreview)),
      tap(task => {
        // Update cache
        this.cacheService.setTask(id, task);
      })
    );
  }

  // Toggle task completion status with cache update
  toggleTaskCompletion(id: number, completed: boolean): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.get<TaskPreview>(`${this.apiUrl}/ToggleTaskCompletion/${id}?completed=${completed}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(taskPreview => this.transformTaskPreview(taskPreview)),
      tap(task => {
        // Update cache
        this.cacheService.setTask(id, task);
        
        // Update tasks list cache
        const cachedTasks = this.cacheService.getTasksOfTheDay();
        if (cachedTasks) {
          const updatedTasks = cachedTasks.map(t => t.id === id ? task : t);
          this.cacheService.setTasksOfTheDay(updatedTasks);
        }
      })
    );
  }

  // Mark a task as done
  markTaskAsDone(id: number): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.get<TaskPreview>(`${this.apiUrl}/MarkAsDone/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(taskPreview => this.transformTaskPreview(taskPreview)),
      tap(task => {
        // Update cache
        this.cacheService.setTask(id, task);
        
        // Update tasks list cache
        const cachedTasks = this.cacheService.getTasksOfTheDay();
        if (cachedTasks) {
          const updatedTasks = cachedTasks.map(t => t.id === id ? task : t);
          this.cacheService.setTasksOfTheDay(updatedTasks);
        }
        
        // Show fire animation if task has date and streak
        if (task.date && task.streak) {
          this.animationService.showFire({ date: task.date, streak: task.streak });
        }
      })
    );
  }

  // Update a task with cache update
  updateTask(id: number, task: TaskUpdatingDTO): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.put<Task>(`${this.apiUrl}/UpdateTask/${id}`, task, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(updatedTask => {
        // Update cache
        this.cacheService.setTask(id, updatedTask);
        
        // Update tasks list cache
        const cachedTasks = this.cacheService.getTasksOfTheDay();
        if (cachedTasks) {
          const updatedTasks = cachedTasks.map(t => t.id === id ? updatedTask : t);
          this.cacheService.setTasksOfTheDay(updatedTasks);
        }
      })
    );
  }

  // Delete a task with cache update
  deleteTask(id: number): Observable<void> {
    const token = this.authService.getToken();
    return this.http.delete<void>(`${this.apiUrl}/DeleteTask/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(() => {
        // Remove from cache
        this.cacheService.removeTask(id);
        
        // Update tasks list cache
        const cachedTasks = this.cacheService.getTasksOfTheDay();
        if (cachedTasks) {
          const updatedTasks = cachedTasks.filter(t => t.id !== id);
          this.cacheService.setTasksOfTheDay(updatedTasks);
        }
      })
    );
  }

  // Search tasks by keyword
  searchTasks(search: string): Observable<Task[]> {
    // Verificar en caché
    const cachedTasks = this.cacheService.getTasksBySearch(search);
    if (cachedTasks) {
      return of(cachedTasks);
    }

    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/Search/${search}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(tasks => tasks.map(taskPreview => this.transformTaskPreview(taskPreview))),
      tap(tasks => {
        // Guardar en caché
        this.cacheService.setTasksBySearch(search, tasks);
      })
    );
  }
}