import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitsService {
  constructor(private http: HttpClient) {}

  // Add habit creation method here
  createHabit(habit: any): Observable<any> {
    return this.http.post('/api/habits', habit);
  }
}
