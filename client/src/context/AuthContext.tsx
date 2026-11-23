import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserDto, LoginRequest } from '../types';
import { adminApi } from '../services/adminApi';

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<UserDto>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await adminApi.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (req: LoginRequest): Promise<UserDto> => {
    const loggedInUser = await adminApi.login(req);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await adminApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
