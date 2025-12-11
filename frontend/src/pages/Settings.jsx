// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // We might need to add getUser/updateUser there

const Settings = () => {
    const navigate = useNavigate();
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
                // We need an endpoint to get current user info. 
                // Currently usually just /users/me or similar. 
                // Let's assume we implement getMe() in api.js
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
            // Update user endpoint
            await api.put('/users/me', { country });
            setMessage('Configuración guardada correctamente. 🎉');
        } catch (err) {
            console.error("Error updating settings", err);
            setMessage('Error al guardar.');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>⚙ Configuración</h2>
            {message && <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', marginBottom: '1rem', borderRadius: '4px' }}>{message}</div>}

            <form onSubmit={handleSave}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>País para Festivos:</label>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        Selecciona tu país para visualizar los días festivos en el calendario.
                    </p>
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '0.8rem 1.5rem',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Guardar Cambios
                </button>
            </form>

            <div style={{ marginTop: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Volver al Dashboard
                </button>
            </div>
        </div>
    );
};

export default Settings;
