import { useContext, useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedUser = { id: 1 };
      setUser(decodedUser);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('authToken', token);
    const decodedUser = { id: 1 };
    setUser(decodedUser);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}