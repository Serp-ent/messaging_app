import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    // Here you would typically send `formData` to the server to register the user.
    try {
      // Simulate a successful registration (you would replace this with an actual API call)
      const fakeToken = 'fake-jwt-token';
      login(fakeToken); // Login after registration
      navigate('/'); // Redirect to home page after successful registration
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div>

      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don&apos;t have account? Join now!
        <Link to={'/register'}>Register</Link>
      </p>
    </div>
  );
}