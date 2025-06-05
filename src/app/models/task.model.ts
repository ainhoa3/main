// Environment constants
export const WORK_ENVIRONMENT = 1;
export const PERSONAL_ENVIRONMENT = 0;

export function getEnvironmentString(env: number): string {
  switch(env) {
    case WORK_ENVIRONMENT: return 'Trabajo';
    case PERSONAL_ENVIRONMENT: return 'Personal';
    default: return 'Personal';
  }
}

export interface Task {
  id: number;
  title: string;
  description: string;
  environment: number;
  dueDate: Date;
  importance: number; // 1-5 star rating
  done: boolean;
  priority: number;
  scheduled: boolean;
  date: string;
  streak: number;
}

export interface TaskCreatingDTO {
  title: string;
  description?: string;
  environment: number;
  dueDate?: Date; // Optional for API compatibility
  importance: number; // 1-5 star rating
  scheduled: boolean;
}

export interface TaskUpdatingDTO {
  title: string;
  description: string;
  environment: number;
  dueDate: string;
  importance: number; // 1-5 star rating
  done: boolean;
  scheduled: boolean;
}

export interface TaskPreview {
  id: number;
  title: string;
  description: string;
  environment: number;
  importance: number;
  done: boolean;
  dueDate: Date;
  priority: number;
}