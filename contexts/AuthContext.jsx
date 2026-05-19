import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

// Hardcoded accounts
const ACCOUNTS = {
  student: { email: 'student@school.com', password: 'student123', name: 'Student User', role: 'student' },
  teacher: { email: 'teacher@school.com', password: 'teacher123', name: 'Teacher User', role: 'teacher' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === ACCOUNTS.student.email && password === ACCOUNTS.student.password) {
      setUser(ACCOUNTS.student);
      setLoading(false);
      return { data: { user: ACCOUNTS.student }, error: null };
    }
    
    if (email === ACCOUNTS.teacher.email && password === ACCOUNTS.teacher.password) {
      setUser(ACCOUNTS.teacher);
      setLoading(false);
      return { data: { user: ACCOUNTS.teacher }, error: null };
    }
    
    setLoading(false);
    return { data: null, error: { message: 'Invalid email or password' } };
  };

  const logout = async () => {
    setUser(null);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isStudent: user?.role === 'student',
      isTeacher: user?.role === 'teacher',
      signIn,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};