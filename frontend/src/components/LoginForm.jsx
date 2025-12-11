// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import './Auth.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await login(email, password);
            localStorage.setItem('access_token', data.access_token);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError('Credenciales incorrectas o error del servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>Bienvenido de nuevo</h2>
                <p>Ingresa tus credenciales para continuar</p>
            </div>

            {error && (
                <div className="auth-error">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        className="input-field"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="tu@email.com"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        className="input-field"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loading}
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>
            <div className="auth-footer">
                ¿No tienes cuenta? <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }} ><a href="/register" onClick={(e) => e.preventDefault()}>Regístrate aquí</a></span>
            </div>
        </div>
    );
};

export default LoginForm;
