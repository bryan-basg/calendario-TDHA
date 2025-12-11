// src/components/EnergyWidget.jsx
import React, { useState } from 'react';
import { getTaskSuggestions } from '../api';

const EnergyWidget = () => {
    const [energy, setEnergy] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleEnergySelect = async (level) => {
        setEnergy(level);
        setLoading(true);
        try {
            const tasks = await getTaskSuggestions(level);
            setSuggestions(tasks);
        } catch (err) {
            console.error('Error fetching suggestions', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', marginTop: '2rem', backgroundColor: '#fff' }}>
            <h3>🔋 ¿Cómo está tu energía ahora?</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                    onClick={() => handleEnergySelect('high')}
                    style={{ padding: '0.5rem 1rem', background: '#ff5252', color: 'white', border: 'none', borderRadius: '4px', opacity: energy === 'high' ? 1 : 0.7 }}
                >
                    Alta 🔥
                </button>
                <button
                    onClick={() => handleEnergySelect('medium')}
                    style={{ padding: '0.5rem 1rem', background: '#ffa726', color: 'white', border: 'none', borderRadius: '4px', opacity: energy === 'medium' ? 1 : 0.7 }}
                >
                    Media 😐
                </button>
                <button
                    onClick={() => handleEnergySelect('low')}
                    style={{ padding: '0.5rem 1rem', background: '#66bb6a', color: 'white', border: 'none', borderRadius: '4px', opacity: energy === 'low' ? 1 : 0.7 }}
                >
                    Baja 😴
                </button>
            </div>

            {loading && <p>Buscando tareas adecuadas...</p>}

            {suggestions.length > 0 && (
                <div>
                    <h4>Tareas Sugeridas:</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {suggestions.map(task => (
                            <li key={task.id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{task.title}</span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{task.priority || 'Normal'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {!loading && energy && suggestions.length === 0 && (
                <p>No se encontraron tareas específicas para este nivel de energía. ¡Eres libre!</p>
            )}
        </div>
    );
};

export default EnergyWidget;
