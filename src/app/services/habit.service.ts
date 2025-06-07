import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, map, tap } from 'rxjs';
import { Habit, HabitCreatingDTO, HabitUpdatingDTO, HabitPreview } from '../models/habit.model';
import { AnimationService } from './animation.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private apiUrl = 'http://localhost:5112/DailyFlow/api/Habits';

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private animationService: AnimationService,
    private cacheService: CacheService
  ) { }

  // Create a new habit
  createHabit(habit: HabitCreatingDTO): Observable<Habit> {
    const token = this.authService.getToken();
    return this.http.post<Habit>(`${this.apiUrl}/NewHabit`, habit, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Get habits of the day preview
  getHabitsOfTheDayPreview(): Observable<HabitPreview[]> {
    const cachedHabits = this.cacheService.getHabitsOfTheDay();
    if (cachedHabits) {
      return new Observable<HabitPreview[]>(observer => {
        observer.next(cachedHabits);
        observer.complete();
      });
    }

    const token = this.authService.getToken();
    return this.http.get<any[]>(`${this.apiUrl}/GetHabitsOfTheDayPreview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(habits => habits.map(habit => ({
        ...habit,
        environment: habit._Environment === 'work' ? 1 : 0
      }))
    ),
    tap(habits => {
      // Cache each habit individually using API values
      habits.forEach(habit => {
        this.cacheService.setHabit(habit.id, habit);
      });
      this.cacheService.setHabitsOfTheDay(habits);
    })
    );
  }

  // Get a specific habit
  getHabit(id: number): Observable<Habit> {
    const cachedHabit = this.cacheService.getHabit(id);
    if (cachedHabit) {
      return new Observable<Habit>(observer => {
        observer.next(cachedHabit);
        observer.complete();
      });
    }

    const token = this.authService.getToken();
    return this.http.get<any>(`${this.apiUrl}/GetAHabit/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map(habit => ({
        ...habit,
        environment: habit._Environment === 'work' ? 1 : 0
      })),
      tap(habit => {
        this.cacheService.setHabit(id, habit);
      })
    );
  }

  // Mark a habit as done
  markHabitAsDone(habitId: number): Observable<HabitPreview> {
    const token = this.authService.getToken();
    return this.http.put<HabitPreview>(`${this.apiUrl}/MarkHabitAsDone/${habitId}`, null, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap((habit: HabitPreview) => {
        if (habit.date && habit.streak) {
          this.animationService.showFire({ date: habit.date, streak: habit.streak });
        }
      })
    );
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
      }))
    ),
    tap(habits => {
      // Cache each habit individually
      habits.forEach(habit => {
        this.cacheService.setHabit(habit.id, habit);
      });
    })
    );
  }

  // Update a habit
  updateHabit(id: number, habit: HabitUpdatingDTO): Observable<Habit> {
    const token = this.authService.getToken();
    return this.http.put<Habit>(`${this.apiUrl}/UpdateHabit/${id}`, habit, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Delete a habit
  deleteHabit(id: number): Observable<void> {
    const token = this.authService.getToken();
    return this.http.delete<void>(`${this.apiUrl}/DeleteHabit/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
