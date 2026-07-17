import { User } from './user.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface JwtPayload {
  exp: number;
  sub?: string;
  email?: string;
  name?: string;
}