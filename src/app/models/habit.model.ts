export interface Habit {
  id: number;
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  lastDay: string | Date;
  _Environment: string;
}

export interface HabitCreatingDTO {
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  startingDay: string | Date;
  environment: number;
}

export interface HabitUpdatingDTO {
  title: string;
  description: string;
  done: boolean;
  programmDays: number;
  lastDay: string;
  environment: number;
}

export interface HabitPreview {
  id: number;
  title: string;
  description: string;
  _Environment: string;
  done: boolean;
  programmDays: number;
  lastDay: string | Date;
}
