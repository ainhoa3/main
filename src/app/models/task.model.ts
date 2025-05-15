export enum Environment {
  WORK = 'work',
  PERSONAL = 'personal'
}

export function numberToEnvironment(value: number): Environment {
  switch(value) {
    case 0: return Environment.WORK;
    case 1: return Environment.PERSONAL;
    default: return Environment.PERSONAL;
  }
}

export function environmentToNumber(env: Environment): number {
  switch(env) {
    case Environment.WORK: return 0;
    case Environment.PERSONAL: return 1;
    default: return 1;
  }
}

export function getEnvironmentString(env: Environment): string {
  switch(env) {
    case Environment.WORK: return 'Trabajo';
    case Environment.PERSONAL: return 'Personal';
    default: return 'Personal';
  }
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