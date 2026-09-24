import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  dietaryPreferences?: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; confirmPassword?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<IUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('recipemaster_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('recipemaster_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data?.success && res.data.data) {
            setUser(res.data.data);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user: loggedInUser, token: authToken } = res.data.data;
        setUser(loggedInUser);
        setToken(authToken);
        localStorage.setItem('recipemaster_token', authToken);
        localStorage.setItem('recipemaster_user', JSON.stringify(loggedInUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login error occurred',
      };
    }
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword?: string }) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data?.success) {
        const { user: registeredUser, token: authToken } = res.data.data;
        setUser(registeredUser);
        setToken(authToken);
        localStorage.setItem('recipemaster_token', authToken);
        localStorage.setItem('recipemaster_user', JSON.stringify(registeredUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration error occurred',
      };
    }
  };



  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('recipemaster_token');
    localStorage.removeItem('recipemaster_user');
  };

  const updateUser = (updatedData: Partial<IUser>) => {
    if (user) {
      const merged = { ...user, ...updatedData };
      setUser(merged);
      localStorage.setItem('recipemaster_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
