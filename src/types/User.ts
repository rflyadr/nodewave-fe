export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  fullName: string;
  [key: string]: unknown;
}
