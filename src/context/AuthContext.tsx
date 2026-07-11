import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  signup: (token: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cubora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        // Token is invalid/expired
        logout();
      }
    } catch (err) {
      console.error('Failed to authenticate active session profile:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('cubora_token', newToken);
    setToken(newToken);
    setIsLoading(true);
    await fetchUser(newToken);
  };

  const signup = async (newToken: string) => {
    localStorage.setItem('cubora_token', newToken);
    setToken(newToken);
    setIsLoading(true);
    await fetchUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('cubora_token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const refetchUser = async () => {
    if (token) {
      await fetchUser(token);
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
        signup,
        logout,
        getAuthHeaders,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be called inside an AuthProvider wrapper.');
  }
  return context;
};
