import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import styles from './Header.module.css'

export default function Header() {
  const { user, login, logout } = useAuth();

  return (
    <header className={styles.header}>
      {user ? (

        <div className={styles.profileHeader}>
          <div> Bruce Lee </div>
          <div className={styles.userAvatar}></div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <>
          <Link to={'/login'}>Login</Link>
          <Link to={'/register'}>Register</Link>
        </>
      )

      }

      <div className={styles.spacer}></div>
    </header >
  );
}