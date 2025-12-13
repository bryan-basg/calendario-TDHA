// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import GlobalSidebar from './GlobalSidebar';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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
