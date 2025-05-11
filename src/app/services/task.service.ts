import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskCreatingDTO, TaskUpdatingDTO, TaskPreview } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5112/DailyFlow/api/Tasks';

  constructor(private http: HttpClient) { }

  // Create a new task
  createTask(task: TaskCreatingDTO): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/NewTask`, task);
  }

  // Get tasks of the day preview
  getTasksOfTheDayPreview(): Observable<TaskPreview[]> {
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksOfTheDayPreview`);
  }

  // Get a specific task
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/GetAtask/${id}`);
  }

  // Mark a task as done
  markTaskAsDone(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/Donetask/${id}`);
  }

  // Search tasks by keyword
  searchTasks(search: string): Observable<TaskPreview[]> {
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/Search/${search}`);
  }

  // Get tasks by date
  getTasksByDate(date: Date): Observable<TaskPreview[]> {
    const formattedDate = date.toISOString().split('T')[0];
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/GetTasksByDatePreview/${formattedDate}`);
  }

  // Get extra tasks
  getExtraTasks(): Observable<TaskPreview[]> {
    return this.http.get<TaskPreview[]>(`${this.apiUrl}/ExtraTasks`);
  }

  // Update a task
  updateTask(id: number, task: TaskUpdatingDTO): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/UpdateTask/${id}`, task);
  }
}