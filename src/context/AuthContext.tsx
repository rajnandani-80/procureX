import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/index.js';
import { authService } from '../services/procurementService.js';
import { getAccessToken, setAccessToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchDemoUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo Accounts Mapping for Quick Switcher
const DEMO_ACCOUNTS: Record<UserRole, { email: string; pass: string }> = {
  SUPER_ADMIN: { email: 'superadmin@procurex.io', pass: 'password123' },
  ORGANIZATION_ADMIN: { email: 'admin@apexcorp.com', pass: 'password123' },
  PROCUREMENT_MANAGER: { email: 'pm@apexcorp.com', pass: 'password123' },
  EMPLOYEE: { email: 'employee@apexcorp.com', pass: 'password123' },
  WAREHOUSE_STAFF: { email: 'warehouse@apexcorp.com', pass: 'password123' },
  FINANCE: { email: 'finance@apexcorp.com', pass: 'password123' },
  VENDOR: { email: 'vendor@techsupply.com', pass: 'password123' }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoUser = async (role: UserRole) => {
    const creds = DEMO_ACCOUNTS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
        switchDemoUser
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
