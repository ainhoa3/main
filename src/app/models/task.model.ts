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
  importance: number;
  priority: number;
  done: boolean;
}

export interface TaskCreatingDTO {
  title: string;
  description: string;
  environment: Environment;
  dueDate: string;
  importance: number;
  priority: number;
}

export interface TaskUpdatingDTO {
  title: string;
  description: string;
  environment: Environment;
  dueDate: string;
  importance: number;
  priority: number;
  done: boolean;
}

export interface TaskPreview {
  id: number;
  title: string;
  environment: Environment;
  priority: number;
  done: boolean;
}