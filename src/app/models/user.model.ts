export interface User {
  id: number;
  username: string;
  email: string;
  userEmail: string;
  streak: number;
  preference: number;
}

export interface CredencialesUserDTO {
  username?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenExpiration: string;
}

export interface UserUpdatingDTO {
  id: number;
  preference?: number;
  username?: string;
  email?: string;
  userEmail?: string;
  streak?: number;
}