import React, { createContext, useContext, useState } from "react";
import { setToken, getToken, clearToken } from "./api";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  fullName: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (token: string, remember: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getToken();
    return token ? decodeToken(token) : null;
  });

  const login = (token: string, remember: boolean) => {
    setToken(token, remember);
    setUser(decodeToken(token));
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName ?? "",
      ...payload,
    };
  } catch {
    return null;
  }
}
