// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import Events from './pages/Events';
import EventForm from './pages/EventForm';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import FocusMode from './pages/FocusMode';
import Settings from './pages/Settings';

const App = () => {
    return (
        <Router>
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
                {/* Add more protected routes here, e.g., /tasks, /events */}
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
        </Router>
    );
};

export default App;
