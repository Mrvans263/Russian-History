// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // Get user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          if (mounted) setLoading(false);
          return;
        }

        setUser(currentUser);

        // Get profile - USING array method NOT single()
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id);

        console.log('Profile query result:', profileData, error);

        if (error) {
          console.error('Profile error:', error);
        } else if (profileData && profileData.length > 0) {
          // IMPORTANT: profileData is an array, take the first element
          const userProfile = profileData[0];
          setProfile(userProfile);
          setIsTeacher(userProfile.role === 'teacher');
          setIsStudent(userProfile.role === 'student');
          console.log('Profile set:', userProfile);
        } else {
          console.log('No profile found for user');
        }
        
        if (mounted) setLoading(false);
        
      } catch (err) {
        console.error('Error:', err);
        if (mounted) setLoading(false);
      }
    };

    loadData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id);
          
          if (profileData && profileData.length > 0) {
            const userProfile = profileData[0];
            setProfile(userProfile);
            setIsTeacher(userProfile.role === 'teacher');
            setIsStudent(userProfile.role === 'student');
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsTeacher(false);
          setIsStudent(false);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, fullName, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const joinClass = async (classCode) => {
    if (!user) return { error: { message: 'Not logged in' } };

    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('join_code', classCode.toUpperCase())
      .maybeSingle();

    if (classError || !classData) {
      return { error: { message: 'Invalid class code' } };
    }

    const { error: joinError } = await supabase
      .from('class_members')
      .insert({ class_id: classData.id, student_id: user.id });

    if (joinError) return { error: joinError };
    return { success: true };
  };

  const value = {
    user,
    profile,
    loading,
    isTeacher,
    isStudent,
    signIn,
    signUp,
    logout,
    joinClass,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};