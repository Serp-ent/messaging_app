import { useContext, useState, useEffect, createContext } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('authToken');
        setUser(null);
        navigate('/login');
      }
    }

    setLoading(false);
  }, [navigate]);

  const login = (token) => {
    localStorage.setItem('authToken', token);
    const decodedToken = jwtDecode(token);
    setUser(decodedToken);
    setLoading(false);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setLoading(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}