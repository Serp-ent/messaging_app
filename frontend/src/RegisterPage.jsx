import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/login')}>Login</button>
      <div>Register page</div>
    </>
  );
}