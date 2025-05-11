import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit, HabitCreatingDTO, HabitUpdatingDTO, HabitPreview } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = 'http://localhost:5112/DailyFlow/api/Habits';

  constructor(private http: HttpClient) { }

  // Create a new habit
  createHabit(habit: HabitCreatingDTO): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}/NewHabit`, habit);
  }

  // Get habits of the day preview
  getHabitsOfTheDayPreview(): Observable<HabitPreview[]> {
    return this.http.get<HabitPreview[]>(`${this.apiUrl}/GetHabitsOfTheDayPreview`);
  }

  // Get a specific habit
  getHabit(id: number): Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/GetAHabit/${id}`);
  }

  // Search habits by keyword
  searchHabits(search: string): Observable<HabitPreview[]> {
    return this.http.get<HabitPreview[]>(`${this.apiUrl}/Search/${search}`);
  }

  // Update a habit
  updateHabit(id: number, habit: HabitUpdatingDTO): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/UpdateHabit/${id}`, habit);
  }
}