import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  constructor(private http: HttpClient) {}

  // Add task creation method here
  createTask(task: any): Observable<any> {
    return this.http.post('/api/tasks', task);
  }
}
