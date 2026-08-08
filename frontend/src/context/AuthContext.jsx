import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('milad_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: 'Usthad Sayyid Muhammed',
      role: 'super_admin',
      email: 'superadmin@madrasa.org'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('milad_token') || 'demo-jwt-token');

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
    localStorage.setItem('milad_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('milad_token');
    localStorage.removeItem('milad_user');
  };

  // Switch Role for demonstration
  const switchRole = (newRole) => {
    const roleNames = {
      super_admin: 'Usthad Sayyid Muhammed (Super Admin)',
      admin: 'Usthad Abdul Rahman (Admin)',
      judge: 'Qari Zakariya Al-Hafiz (Judge)',
      stage_coordinator: 'Umer Farooq (Stage Coordinator)',
      student: 'Muhammed Danish (Student)',
      public: 'Guest Visitor (Public)'
    };
    
    setUser({
      id: newRole === 'judge' ? 3 : 1,
      name: roleNames[newRole] || 'User',
      role: newRole,
      email: `${newRole}@madrasa.org`,
      judgeId: newRole === 'judge' ? 1 : null
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
