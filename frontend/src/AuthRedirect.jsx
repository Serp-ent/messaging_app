import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

export default function AuthRedirect({ children }) {
  const { user } = useAuth(); // Ensure user is destructured from context
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (user) {
      setRedirecting(true); // Set redirecting state to true before navigating
      navigate('/');
    }
  }, [user, navigate]);

  // Render nothing while redirecting, or display a loading indicator if needed
  return redirecting ? null : children;
}