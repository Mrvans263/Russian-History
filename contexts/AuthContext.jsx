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

  // Fetch profile from database
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  // Create profile manually if it doesn't exist
  const createProfile = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userData.id,
          email: userData.email,
          full_name: userData.user_metadata?.full_name || userData.email?.split('@')[0],
          role: userData.user_metadata?.role || 'student',
        })
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Profile creation error:', error);
      return null;
    }
  };

  // Set user state with profile
  const setUserWithProfile = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      setProfile(null);
      setIsTeacher(false);
      setIsStudent(false);
      setLoading(false); // IMPORTANT: Set loading false even when no user
      return;
    }

    setUser(sessionUser);
    
    // Try to get profile
    let userProfile = await fetchProfile(sessionUser.id);
    
    // If no profile exists, create one
    if (!userProfile) {
      console.log('No profile found, creating one...');
      userProfile = await createProfile(sessionUser);
    }
    
    setProfile(userProfile);
    setIsTeacher(userProfile?.role === 'teacher');
    setIsStudent(userProfile?.role === 'student');
    setLoading(false); // IMPORTANT: Always set loading false
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          await setUserWithProfile(session?.user || null);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (isMounted) {
          await setUserWithProfile(session?.user || null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email, password, fullName, role) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      // Immediately create profile
      const profile = await createProfile(authData.user);
      
      return { data: { user: authData.user, profile }, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Fetch or create profile immediately
      let profile = await fetchProfile(data.user.id);
      if (!profile) {
        profile = await createProfile(data.user);
      }
      
      return { data: { user: data.user, profile }, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { data: null, error };
    }
  };

  // Sign out
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Join class
  const joinClass = async (classCode) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, join_code')
        .eq('join_code', classCode.toUpperCase())
        .maybeSingle();

      if (classError) throw classError;
      if (!classData) throw new Error('Invalid class code');

      const { data: existingMember } = await supabase
        .from('class_members')
        .select('id')
        .eq('class_id', classData.id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (existingMember) throw new Error('You are already a member of this class');

      const { error: joinError } = await supabase
        .from('class_members')
        .insert({
          class_id: classData.id,
          student_id: user.id,
        });

      if (joinError) throw joinError;

      await supabase
        .from('profiles')
        .update({ class_code: classCode.toUpperCase() })
        .eq('id', user.id);

      return { success: true, class: classData, error: null };
    } catch (error) {
      console.error('Join class error:', error);
      return { success: false, error };
    }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};