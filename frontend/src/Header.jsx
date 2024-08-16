import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Header() {
  const { user, login, logout } = useAuth();

  return (
    <header>
      {user ? (

        <div>
          User logged in
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <>
          <Link to={'/login'}>Login</Link>
          <Link to={'/register'}>Register</Link>
        </>
      )
      }
    </header>
  );
}