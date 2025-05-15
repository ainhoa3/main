export enum Environment {
  WORK = 'work',
  PERSONAL = 'personal'
}

export interface Task {
  id: number;
  title: string;
  description: string;
  environment: Environment;
  dueDate: Date;
  importance: number; // 1-5 star rating
  done: boolean;
  priority: number;
}

export interface TaskCreatingDTO {
  title: string;
  description?: string;
  environment: Environment;
  dueDate?: Date; // Optional for API compatibility
  importance: number; // 1-5 star rating
}

export interface TaskUpdatingDTO {
  title: string;
  description: string;
  environment: Environment;
  dueDate: string;
  importance: number; // 1-5 star rating
  done: boolean;
  priority: number;
}

export interface TaskPreview {
  id: number;
  title: string;
  environment: Environment;
  importance: number; // 1-5 star rating
  done: boolean;
  dueDate: Date;
  priority: number;
}