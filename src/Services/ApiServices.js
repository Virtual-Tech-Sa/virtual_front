<<<<<<< HEAD
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from './AuthService';

// Protected Route component to guard routes that require authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
=======
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from './AuthService';

// Protected Route component to guard routes that require authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
>>>>>>> 816d6ffa1a783ece0b06046096cbf7d360e3991d
};