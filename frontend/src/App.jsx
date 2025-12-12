// src/App.jsx
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/es'; // Ensure Spanish locale is loaded
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import { initPushNotifications } from './pushNotifications';

// Lazy Load Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const TaskForm = React.lazy(() => import('./pages/TaskForm'));
const Events = React.lazy(() => import('./pages/Events'));
const EventForm = React.lazy(() => import('./pages/EventForm'));
const Categories = React.lazy(() => import('./pages/Categories'));
const CategoryForm = React.lazy(() => import('./pages/CategoryForm'));
const FocusMode = React.lazy(() => import('./pages/FocusMode'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

const App = () => {
    const { i18n } = useTranslation();

    useEffect(() => {
        initPushNotifications();
    }, []);

    useEffect(() => {
        moment.locale(i18n.language);
    }, [i18n.language]);

    return (
        <Router>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path="/tasks/new" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
                    <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                    <Route path="/events/new" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
                    <Route path="/events/:id/edit" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
                    <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                    <Route path="/categories/new" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />
                    <Route path="/categories/:id/edit" element={<ProtectedRoute><CategoryForm /></ProtectedRoute>} />
                    <Route path="/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default App;
