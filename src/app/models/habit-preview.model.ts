export interface HabitPreview {
  id: number;
  title: string;
  description?: string;
  environment: number; // 0 for personal, 1 for work
  programmDays: number;
  lastDay: string;
  done: boolean;
}
