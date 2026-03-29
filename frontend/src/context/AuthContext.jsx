import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [usersDb, setUsersDb] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('healthtech_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    // existing users database
    const savedUsers = localStorage.getItem('healthtech_db_users');
    if (savedUsers) setUsersDb(JSON.parse(savedUsers));
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) return { success: false, message: 'Please enter credentials.' };
    
    const foundUser = usersDb.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password, ...safeUser } = foundUser;
      setUser(safeUser);
      localStorage.setItem('healthtech_user', JSON.stringify(safeUser));
      return { success: true };
    }
    
    return { success: false, message: 'Invalid email or password. Are you registered?' };
  };

  const register = async (email, password, role) => {
    if (!email.endsWith('.edu')) {
      return { success: false, message: 'Only institutional .edu emails are allowed.' };
    }
    if (usersDb.some(u => u.email === email)) {
      return { success: false, message: 'Email already registered. Please login.' };
    }
    
    // email admin içeriyorsa admin yap -> V1 test için, sonradan degistirlecek
    const finalRole = email.toLowerCase().includes('admin') ? 'Admin' : role;
    
    const newUser = { id: Date.now(), email, password, role: finalRole, name: email.split('@')[0] };
    const updatedDb = [...usersDb, newUser];
    
    setUsersDb(updatedDb);
    localStorage.setItem('healthtech_db_users', JSON.stringify(updatedDb));
    
    const { password: pwd, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem('healthtech_user', JSON.stringify(safeUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthtech_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
