import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, map } from 'rxjs';
import { Habit, HabitCreatingDTO, HabitUpdatingDTO, HabitPreview } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = 'http://localhost:5112/DailyFlow/api/Habits';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Create a new habit
  createHabit(habit: HabitCreatingDTO): Observable<Habit> {
    const token = this.authService.getToken();
    return this.http.post<Habit>(`${this.apiUrl}/NewHabit`, habit, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Get habits of the day preview
  getHabitsOfTheDayPreview(): Observable<HabitPreview[]> {
    const token = this.authService.getToken();
    return this.http.get<any[]>(`${this.apiUrl}/GetHabitsOfTheDayPreview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(habits => habits.map(habit => ({
        ...habit,
        environment: habit._Environment === 'work' ? 1 : 0
      })))
    );
  }

  // Get a specific habit
  getHabit(id: number): Observable<Habit> {
    const token = this.authService.getToken();
    return this.http.get<any>(`${this.apiUrl}/GetAHabit/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(habit => ({
        ...habit,
        environment: habit._Environment === 'work' ? 1 : 0
      }))
    );
  }

  // Mark a habit as done
  markHabitAsDone(habitId: number): Observable<HabitPreview> {
    const token = this.authService.getToken();
    return this.http.put<HabitPreview>(`${this.apiUrl}/MarkHabitAsDone/${habitId}`, null, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Search habits by keyword
  searchHabits(search: string): Observable<HabitPreview[]> {
    const token = this.authService.getToken();
    return this.http.get<any[]>(`${this.apiUrl}/Search/${search}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(habits => habits.map(habit => ({
        ...habit,
        environment: habit._Environment === 'work' ? 1 : 0
      })))
    );
  }

  // Update a habit
  updateHabit(id: number, habit: HabitUpdatingDTO): Observable<Habit> {
    const token = this.authService.getToken();
    return this.http.put<Habit>(`${this.apiUrl}/UpdateHabit/${id}`, habit, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
