import { Environment } from './task.model';

export interface Habit {
  id: number;
  title: string;
  description: string;
  environment: Environment;
  importance: number;
  priority: number;
}

export interface HabitCreatingDTO {
  title: string;
  description: string;
  environment: Environment;
  importance: number;
  priority: number;
}

export interface HabitUpdatingDTO {
  title: string;
  description: string;
  environment: Environment;
  importance: number;
  priority: number;
}

export interface HabitPreview {
  id: number;
  title: string;
  environment: Environment;
  priority: number;
}