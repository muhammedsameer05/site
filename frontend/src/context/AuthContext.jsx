import React, { createContext, useContext, useState, useEffect } from 'react';

const AUTH_VERSION = 'v3_force_logout_clean';

// Automatically clear any old leftover admin sessions stored in browser cache from earlier versions
if (typeof window !== 'undefined' && localStorage.getItem('milad_auth_version') !== AUTH_VERSION) {
  localStorage.removeItem('milad_user');
  localStorage.removeItem('milad_token');
  localStorage.setItem('milad_auth_version', AUTH_VERSION);
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('milad_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('milad_token') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('milad_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('milad_user');
    }
  }, [user]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('milad_token', userToken || 'jwt-auth-token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('milad_token');
    localStorage.removeItem('milad_user');
  };

  // Switch Role for demonstration
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
