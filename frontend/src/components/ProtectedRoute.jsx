// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import GlobalSidebar from './GlobalSidebar';

// This component protects routes that require authentication.
// If a valid JWT token exists in localStorage, it renders the child component.
// Otherwise, it redirects the user to the login page.

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <GlobalSidebar />
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {children}
            </div>
        </div>
    );
};

export default ProtectedRoute;
