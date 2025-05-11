export interface User {
  id: number;
  username: string;
  email: string;
  streak: number;
}

export interface CredencialesUserDTO {
  username?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}