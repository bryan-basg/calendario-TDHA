// src/components/Navbar.jsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('access_token');
            navigate('/login');
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">
                    <img src="/logo.png" alt="MindConnect" className="nav-logo" />
                </Link>
            </div>
            <div className="nav-links">
                <NavLink
                    to="/"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                    end
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/tasks"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Tareas
                </NavLink>
                <NavLink
                    to="/events"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Eventos
                </NavLink>
                <NavLink
                    to="/categories"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    Categorías
                </NavLink>
                <NavLink
                    to="/focus"
                    className={({ isActive }) => isActive ? "nav-link focus-mode active" : "nav-link focus-mode"}
                >
                    <span>🎯</span> Focus
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                    ⚙ Config
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="btn-logout"
                    title="Cerrar Sesión"
                >
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
