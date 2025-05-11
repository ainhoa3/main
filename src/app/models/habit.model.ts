export interface Habit {
  id: number;
  title: string;
  description: string;
  environment: string;
  importance: number;
  priority: number;
}

export interface HabitCreatingDTO {
  title: string;
  description: string;
  environment: string;
  importance: number;
  priority: number;
}

export interface HabitUpdatingDTO {
  title: string;
  description: string;
  environment: string;
  importance: number;
  priority: number;
}

export interface HabitPreview {
  id: number;
  title: string;
  environment: string;
  priority: number;
}