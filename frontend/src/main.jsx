import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from './ErrorPage.jsx'
import AuthProvider from './AuthContext.jsx'
import Home from './Home.jsx'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import AuthRedirect from './AuthRedirect.jsx'
import Profile from './Profile.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthProvider><App /></AuthProvider>,
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
            index: true,
            element: <ProtectedRoute element={<Profile/>}></ProtectedRoute>
            // element: <Profile />
          },
          {
            path: ':id',
            element: <ProtectedRoute element={<Profile/>}></ProtectedRoute>
            // element: <Profile />
          }
        ]
      },
      {
        path: "/login",
        element: <AuthRedirect><LoginPage /></AuthRedirect>,
      },
      {
        path: "/register",
        element: <AuthRedirect><RegisterPage /></AuthRedirect>,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />, // 404 route
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);