import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('healthtech_user');
    const storedToken = localStorage.getItem('healthtech_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const resp = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('healthtech_user', JSON.stringify(data.user));
        localStorage.setItem('healthtech_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch(err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const register = async (email, password, role) => {
    // Basic pre-validation on frontend
    if (!email.includes('.edu') && !email.includes('.ac.')) {
      return { success: false, message: 'Only institutional (.edu or .ac) emails are allowed.' };
    }
    
    try {
      const resp = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        return { success: true }; // Require login / verify separately
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch(err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthtech_user');
    localStorage.removeItem('healthtech_token');
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('healthtech_token');
      const resp = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(profileData)
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('healthtech_user', JSON.stringify(data.user));
        localStorage.setItem('healthtech_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Profile update failed' };
    } catch(err) {
      return { success: false, message: 'Server connection error.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
