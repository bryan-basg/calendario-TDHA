// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

const Settings = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [country, setCountry] = useState('US');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // List of common Latin American countries + US/ES
    const countries = [
        { code: 'AR', name: 'Argentina' },
        { code: 'BO', name: 'Bolivia' },
        { code: 'BR', name: 'Brasil' },
        { code: 'CL', name: 'Chile' },
        { code: 'CO', name: 'Colombia' },
        { code: 'CR', name: 'Costa Rica' },
        { code: 'CU', name: 'Cuba' },
        { code: 'DO', name: 'República Dominicana' },
        { code: 'EC', name: 'Ecuador' },
        { code: 'SV', name: 'El Salvador' },
        { code: 'GT', name: 'Guatemala' },
        { code: 'HN', name: 'Honduras' },
        { code: 'MX', name: 'México' },
        { code: 'NI', name: 'Nicaragua' },
        { code: 'PA', name: 'Panamá' },
        { code: 'PY', name: 'Paraguay' },
        { code: 'PE', name: 'Perú' },
        { code: 'PR', name: 'Puerto Rico' },
        { code: 'UY', name: 'Uruguay' },
        { code: 'VE', name: 'Venezuela' },
        { code: 'US', name: 'Estados Unidos' },
        { code: 'ES', name: 'España' },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get('/users/me');
                setCountry(data.country || 'US');
            } catch (err) {
                console.error("Error fetching user settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/me', { country });
            setMessage(t('settings.save_success'));
        } catch (err) {
            console.error("Error updating settings", err);
            setMessage(t('settings.save_error'));
        }
    };

    if (loading) return <div className="container mt-4">{t('common.loading')}</div>;

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '2rem 0' }}>
            <h2 className="mb-4">⚙ {t('settings.title')}</h2>
            {message && (
                <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', marginBottom: '1rem', borderRadius: '4px' }}>
                    {message}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="form-label">{t('settings.holiday_country')}</label>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            {t('settings.holiday_country_desc')}
                        </p>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="input-field"
                        >
                            {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn btn-outline"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
