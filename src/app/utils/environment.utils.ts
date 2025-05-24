export const WORK_ENVIRONMENT = 1;
export const PERSONAL_ENVIRONMENT = 0;

export function getEnvironmentString(environment: number): string {
  return environment === WORK_ENVIRONMENT ? 'Trabajo' : 'Personal';
}
