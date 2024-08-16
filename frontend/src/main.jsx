import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './Root.jsx'
import ErrorPage from './ErrorPage.jsx'
import AuthProvider from './AuthContext.jsx'
import Profile from './Profile.jsx'
import Home from './Home.jsx'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Root />
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ProtectedRoute element={<Home />} />,
      },
      {
        path: 'profile',
        children: [
          {
            path: ':id',
            element: <ProtectedRoute element={<Profile />} />,
          },
          {
            path: '',
            element: <ProtectedRoute element={<Profile />} />,
          }
        ]
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />, // Public route for login
  },
  {
    path: "/register",
    element: <RegisterPage />, // Public route for registration
  },
  {
    path: "*",
    element: <ErrorPage />, // 404 route
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
