import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskPreview } from '../models/task.model';
import { Habit, HabitPreview } from '../models/habit.model';
import { User } from '../models/user.model';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  expiration: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cacheSubject = new BehaviorSubject<CacheItem<any>[]>([]);
  public cacheTTL = 3600000; // 1 hour in milliseconds

  constructor() {
    // Load cache from localStorage on initialization
    const savedCache = localStorage.getItem('dailyflow_cache');
    if (savedCache) {
      try {
        const cacheData = JSON.parse(savedCache);
        this.cacheSubject.next(cacheData);
      } catch (error) {
        console.error('Error loading cache:', error);
      }
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('dailyflow_cache', JSON.stringify(this.cacheSubject.value));
  }

  public isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiration;
  }

  // Cache methods for tasks
  getTasksOfTheDay(): TaskPreview[] | null {
    const cached = localStorage.getItem('tasksOfTheDay');
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<TaskPreview[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setTasksOfTheDay(tasks: TaskPreview[]): void {
    const cacheItem: CacheItem<TaskPreview[]> = {
      data: tasks,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem('tasksOfTheDay', JSON.stringify(cacheItem));
  }

  getTasksByDate(date: string): TaskPreview[] | null {
    const key = `tasks_by_date_${date}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<TaskPreview[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setTasksByDate(date: string, tasks: TaskPreview[]): void {
    const key = `tasks_by_date_${date}`;
    const cacheItem: CacheItem<TaskPreview[]> = {
      data: tasks,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
  }

  getTask(id: number): Task | null {
    const cached = localStorage.getItem(`task_${id}`);
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<Task>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setTask(id: number, task: Task): void {
    const cacheItem: CacheItem<Task> = {
      data: task,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem(`task_${id}`, JSON.stringify(cacheItem));
  }

  // Cache methods for habits
  getHabitsOfTheDay(): HabitPreview[] | null {
    const cached = localStorage.getItem('habitsOfTheDay');
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<HabitPreview[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setHabitsOfTheDay(habits: HabitPreview[]): void {
    const cacheItem: CacheItem<HabitPreview[]> = {
      data: habits,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem('habitsOfTheDay', JSON.stringify(cacheItem));
  }

  getHabit(id: number): Habit | null {
    const cached = localStorage.getItem(`habit_${id}`);
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<Habit>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setHabit(id: number, habit: Habit): void {
    const cacheItem: CacheItem<Habit> = {
      data: habit,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem(`habit_${id}`, JSON.stringify(cacheItem));
  }

  // Cache methods for user
  getUser(): User | null {
    const cached = localStorage.getItem('user');
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<User>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setUser(user: User): void {
    const cacheItem: CacheItem<User> = {
      data: user,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem('user', JSON.stringify(cacheItem));
  }

  getUserStreak(): number | null {
    const cached = localStorage.getItem('userStreak');
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<number>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setUserStreak(streak: number): void {
    const cacheItem: CacheItem<number> = {
      data: streak,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem('userStreak', JSON.stringify(cacheItem));
  }

  // Cache methods for extra tasks
  getExtraTasks(): TaskPreview[] | null {
    const cached = localStorage.getItem('extraTasks');
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<TaskPreview[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setExtraTasks(tasks: TaskPreview[]): void {
    const cacheItem: CacheItem<TaskPreview[]> = {
      data: tasks,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem('extraTasks', JSON.stringify(cacheItem));
  }

  // Cache methods for search
  getTasksBySearch(search: string): TaskPreview[] | null {
    const key = `tasks_search_${search}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<TaskPreview[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setTasksBySearch(search: string, tasks: TaskPreview[]): void {
    const key = `tasks_search_${search}`;
    const cacheItem: CacheItem<TaskPreview[]> = {
      data: tasks,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
  }

  // Clear cache
  clearCache(): void {
    // Clear all localStorage items
    localStorage.clear();
    
    // Clear cache subject
    this.cacheSubject.next([]);
  }

  get cache$() {
    return this.cacheSubject.asObservable();
  }
}
