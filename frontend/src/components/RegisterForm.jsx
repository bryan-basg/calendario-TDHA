// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api';
import './Auth.css';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            await register(email, password);
            const data = await login(email, password);
            localStorage.setItem('access_token', data.access_token);
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Error al registrar usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>Crear Cuenta</h2>
                <p>Únete para organizar tu tiempo</p>
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
                        autoComplete="email"
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
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="input-field"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loading}
                >
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>
            </form>
            <div className="auth-footer">
                ¿Ya tienes cuenta? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }} ><a href="/login" onClick={(e) => e.preventDefault()}>Inicia sesión</a></span>
            </div>
        </div>
    );
};

export default RegisterForm;
