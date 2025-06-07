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
  getTasksOfTheDay(): Task[] | null {
    const cached = localStorage.getItem('tasksOfTheDay');
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<Task[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  removeTask(id: number): void {
    localStorage.removeItem(`task_${id}`);
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
  }

  setTasksOfTheDay(tasks: Task[]): void {
    const cacheItem: CacheItem<Task[]> = {
      data: tasks,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem('tasksOfTheDay', JSON.stringify(cacheItem));
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
  }

  getTasksByDate(date: string): Task[] | null {
    const key = `tasks_by_date_${date}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<Task[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setTasksByDate(date: string, tasks: Task[]): void {
    const key = `tasks_by_date_${date}`;
    const cacheItem: CacheItem<Task[]> = {
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

  getExtraTasks(): Task[] | null {
    const cached = localStorage.getItem('extra_tasks');
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<Task[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setExtraTasks(tasks: Task[]): void {
    const cacheItem: CacheItem<Task[]> = {
      data: tasks,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem('extra_tasks', JSON.stringify(cacheItem));
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
  }

  setTask(id: number, task: Task): void {
    const cacheItem: CacheItem<Task> = {
      data: task,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
      expiration: Date.now() + this.cacheTTL
    };
    localStorage.setItem(`task_${id}`, JSON.stringify(cacheItem));
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
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
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
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
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
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
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
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
    this.saveToLocalStorage();
    this.cacheSubject.next([...this.cacheSubject.value]);
  }

  // Cache methods for search
  getTasksBySearch(search: string): Task[] | null {
    const key = `tasks_search_${search}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached) as CacheItem<Task[]>;
      if (!this.isExpired(parsed)) {
        return parsed.data;
      }
    }
    return null;
  }

  setTasksBySearch(search: string, tasks: Task[]): void {
    const key = `tasks_search_${search}`;
    const cacheItem: CacheItem<Task[]> = {
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
