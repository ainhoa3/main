import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Task, TaskCreatingDTO, TaskUpdatingDTO, TaskPreview } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5112/DailyFlow/api/Tasks';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Create a new task
  createTask(task: TaskCreatingDTO): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.post<Task>(`${this.apiUrl}/NewTask`, task, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Get tasks of the day preview
  getTasksOfTheDayPreview(): Observable<TaskPreview[]> {
    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksOfTheDayPreview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Get a specific task
  getTask(id: number): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.get<Task>(`${this.apiUrl}/GetAtask/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Mark a task as done
  markTaskAsDone(id: number): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.get<Task>(`${this.apiUrl}/Donetask/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
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
    const token = this.authService.getToken();
    // Ensure date is in local timezone and formatted as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksByDatePreview/${formattedDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Get extra tasks
  getExtraTasks(): Observable<TaskPreview[]> {
    const token = this.authService.getToken();
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/ExtraTasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Update a task
  updateTask(id: number, task: TaskUpdatingDTO): Observable<Task> {
    const token = this.authService.getToken();
    return this.http.put<Task>(`${this.apiUrl}/UpdateTask/${id}`, task, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}