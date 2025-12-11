// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

// This component protects routes that require authentication.
// If a valid JWT token exists in localStorage, it renders the child component.
// Otherwise, it redirects the user to the login page.

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return (
        <>
            <Navbar />
            <div style={{ padding: '0' }}>
                {children}
            </div>
        </>
    );
};

export default ProtectedRoute;
