// src/components/EnergyWidget.tsx
import React, { useState } from 'react';
import { getTaskSuggestions } from '../api';
import { useTranslation } from 'react-i18next';
import './EnergyWidget.css';
import { Task } from '../types';

const EnergyWidget: React.FC = () => {
    const [energy, setEnergy] = useState<string>('');
    const [suggestions, setSuggestions] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    const handleEnergySelect = async (level: string) => {
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
        <div className="energy-widget">
            <h3 className="energy-title">
                {t('widgets.energy_title', '🔋 Nivel de Energía Actual')}
            </h3>

            <div className="energy-options">
                <button
                    onClick={() => handleEnergySelect('high')}
                    className={`energy-btn high ${energy === 'high' ? 'selected' : ''}`}
                >
                    <span className="energy-icon">🔥</span>
                    <span>{t('widgets.high', 'Alta')}</span>
                </button>

                <button
                    onClick={() => handleEnergySelect('medium')}
                    className={`energy-btn medium ${energy === 'medium' ? 'selected' : ''}`}
                >
                    <span className="energy-icon">😐</span>
                    <span>{t('widgets.medium', 'Media')}</span>
                </button>

                <button
                    onClick={() => handleEnergySelect('low')}
                    className={`energy-btn low ${energy === 'low' ? 'selected' : ''}`}
                >
                    <span className="energy-icon">😴</span>
                    <span>{t('widgets.low', 'Baja')}</span>
                </button>
            </div>

            {loading && (
                <div className="text-center text-secondary py-4">
                    {t('widgets.searching', 'Buscando tareas compatibles...')}
                </div>
            )}

            {!loading && suggestions.length > 0 && (
                <div className="suggestions-container">
                    <h4 className="suggestions-title">{t('widgets.suggested_tasks', 'Tareas Sugeridas')}</h4>
                    <ul className="suggestion-list">
                        {suggestions.map(task => (
                            <li key={task.id} className="suggestion-item">
                                <span className="suggestion-title">{task.title}</span>
                                <span className="suggestion-badge">{task.priority || 'Normal'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!loading && energy && suggestions.length === 0 && (
                <div className="text-center text-secondary py-4 fade-in">
                    <p>{t('widgets.no_tasks_msg', 'No hay tareas específicas para este nivel.')}</p>
                    <p style={{ fontSize: '0.9em', marginTop: '0.5rem' }}>{t('widgets.enjoy_msg', '¡Disfruta tu tiempo libre! ✨')}</p>
                </div>
            )}
        </div>
    );
};

export default EnergyWidget;
