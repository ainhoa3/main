export interface Habit {
  id: number;
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  lastDay: Date;
  _Environment: string;
}

export interface HabitCreatingDTO {
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  startingDay: Date;
  environment: number;
}

export interface HabitUpdatingDTO {
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  lastDay: Date;
  environment: number;
}

export interface HabitPreview {
  id: number;
  title: string;
  description: string;
  _Environment: string;
  done: boolean;
  programmDays: number;
  lastDay: Date;
}
