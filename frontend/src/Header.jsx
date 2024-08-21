import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import styles from './Header.module.css'
import { useEffect, useState } from "react";

export default function Header() {
  const { user: userAuth, login, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userAuth) {
      const fetchUserData = async () => {
        setLoading(true); // Start loading
        try {
          const response = await fetch(`http://localhost:3000/api/users/${userAuth.id}`);
          if (!response.ok) {
            console.log('Failed to fetch user data');
            return;
          }
          const data = await response.json();
          setUser(data.user);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false); // End loading
        }
      };

      fetchUserData();
    }
  }, [userAuth]);

  return (
    <header className={styles.header}>
      {userAuth ? (
        <div className={styles.profileHeader}>
          {loading ? (
            <div>Loading...</div> // Show loading state
          ) : (
            user && (
              <>
                <div>
                  <Link to={`/profile`}>
                    {user.firstName} {user.lastName}
                  </Link>
                </div>
                <div className={styles.userAvatar}></div>
                <button onClick={logout}>Logout</button>
              </>
            )
          )}
        </div>
      ) : (
        <>
          <Link to={'/login'}>Login</Link>
          <Link to={'/register'}>Register</Link>
        </>
      )}
    </header>
  );
}