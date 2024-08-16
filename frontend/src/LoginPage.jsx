import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/register')}>Register</button>
      <div>Login page</div>
    </>
  );
}