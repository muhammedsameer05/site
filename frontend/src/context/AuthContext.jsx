import React, { createContext, useContext, useState, useEffect } from 'react';

const AUTH_VERSION = 'v4_bulletproof_auth';

// Safe localStorage getter
const safeGetItem = (key) => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  } catch (e) {
    return null;
  }
};

const safeSetItem = (key, val) => {
  try {
    if (typeof window !== 'undefined') localStorage.setItem(key, val);
  } catch (e) {}
};

const safeRemoveItem = (key) => {
  try {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  } catch (e) {}
};

// Clear stale keys safely
if (safeGetItem('milad_auth_version') !== AUTH_VERSION) {
  safeRemoveItem('milad_user');
  safeRemoveItem('milad_token');
  safeSetItem('milad_auth_version', AUTH_VERSION);
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = safeGetItem('milad_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      safeRemoveItem('milad_user');
      return null;
    }
  });

  const [token, setToken] = useState(() => safeGetItem('milad_token') || null);

  useEffect(() => {
    if (user) {
      safeSetItem('milad_user', JSON.stringify(user));
    } else {
      safeRemoveItem('milad_user');
    }
  }, [user]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    safeSetItem('milad_token', userToken || 'jwt-auth-token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    safeRemoveItem('milad_token');
    safeRemoveItem('milad_user');
  };

  const switchRole = (newRole) => {
    if (!newRole || newRole === 'public') {
      logout();
      return;
    }

    const roleNames = {
      super_admin: 'Usthad Sayyid Muhammed (Super Admin)',
      admin: 'Usthad Abdul Rahman (Admin)',
      judge: 'Qari Zakariya Al-Hafiz (Judge)',
      stage_coordinator: 'Umer Farooq (Stage Coordinator)',
      student: 'Muhammed Danish (Student)',
      public: 'Guest Visitor (Public)'
    };
    
    const newUser = {
      id: newRole === 'judge' ? 3 : 1,
      name: roleNames[newRole] || 'User',
      role: newRole,
      email: `${newRole}@madrasa.org`,
      judgeId: newRole === 'judge' ? 1 : null
    };

    setUser(newUser);
    setToken('jwt-auth-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
