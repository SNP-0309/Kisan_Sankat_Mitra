import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = {
  farmer: {
    _id: 'usr_farmer_001',
    name: 'Ramesh Patil (रमेश पाटील)',
    phone: '9822011223',
    role: 'farmer',
    location: 'Niphad, Nashik, Maharashtra',
    holdingAcreage: '6.5 Acres',
    primaryCrops: ['Tomato', 'Onion', 'Grapes'],
  },
  buyer: {
    _id: 'usr_buyer_001',
    name: 'Sahyadri Agro Mega Foods Ltd.',
    phone: '9822099887',
    role: 'buyer',
    location: 'Dindori Agro Park, Nashik',
    dailyIntakeCapacity: '40 Metric Tons',
    licenseNumber: 'MH-AGRO-78192',
  },
  admin: {
    _id: 'usr_admin_001',
    name: 'Dilip Rao (District APMC Regulator)',
    phone: '9822000001',
    role: 'admin',
    location: 'Nashik Central APMC Directorate',
    jurisdiction: 'North Maharashtra Agricultural Belt',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fasal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fasal_token') || null);
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('fasal_user');
    return saved ? JSON.parse(saved).role : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fasal_user', JSON.stringify(user));
      setRole(user.role);
    } else {
      localStorage.removeItem('fasal_user');
      setRole(null);
    }
  }, [user]);

  const switchDemoRole = (targetRole) => {
    const demoProfile = DEMO_USERS[targetRole] || DEMO_USERS.farmer;
    setUser(demoProfile);
    setRole(targetRole);
    setToken(`demo_token_${targetRole}`);
    localStorage.setItem('fasal_token', `demo_token_${targetRole}`);
    localStorage.setItem('fasal_user', JSON.stringify(demoProfile));
  };

  const login = async (phone, password) => {
    const res = await api.login({ phone, password });
    if (res?.data?.user) {
      setUser(res.data.user);
      setToken(res.data.token);
      setRole(res.data.user.role);
      localStorage.setItem('fasal_token', res.data.token);
      localStorage.setItem('fasal_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res?.data?.user) {
      setUser(res.data.user);
      setToken(res.data.token);
      setRole(res.data.user.role);
      localStorage.setItem('fasal_token', res.data.token);
      localStorage.setItem('fasal_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('fasal_token');
    localStorage.removeItem('fasal_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        login,
        register,
        logout,
        switchDemoRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
