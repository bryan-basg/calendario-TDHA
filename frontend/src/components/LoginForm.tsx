// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../api';
import './Auth.css';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await login(email, password);
            localStorage.setItem('access_token', data.access_token);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(t('auth.login_error', 'Credenciales incorrectas o error del servidor'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>{t('auth.welcome_back', 'Bienvenido de nuevo')}</h2>
                <p>{t('auth.enter_credentials', 'Ingresa tus credenciales para continuar')}</p>
            </div>

            {error && (
                <div className="auth-error">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email" className="form-label">{t('auth.email', 'Correo electrónico')}</label>
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
                    <label htmlFor="password" className="form-label">{t('auth.password', 'Contraseña')}</label>
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
                    {loading ? t('auth.logging_in', 'Iniciando sesión...') : t('auth.login_button', 'Iniciar Sesión')}
                </button>
            </form>
            <div className="auth-footer">
                {t('auth.no_account', '¿No tienes cuenta?')} <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }} ><a href="/register" onClick={(e) => e.preventDefault()}>{t('auth.register_here', 'Regístrate aquí')}</a></span>
            </div>
        </div>
    );
};

export default LoginForm;
