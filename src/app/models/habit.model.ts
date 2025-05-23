import { Environment } from './task.model';
export { Environment };

export interface Habit {
  id: number;
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  lastDay: Date;
  environment: Environment;
}

export interface HabitCreatingDTO {
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  startingDay: Date;
  environment: Environment;
}

export interface HabitUpdatingDTO {
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  lastDay: Date;
  environment: Environment;
}

export interface HabitPreview {
  id: number;
  title: string;
  description: string;
  environment: Environment;
}