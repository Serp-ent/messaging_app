import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>
  }

  return user ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;