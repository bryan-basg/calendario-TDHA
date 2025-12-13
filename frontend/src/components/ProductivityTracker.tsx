import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTaskStats } from '../api';
import './ProductivityTracker.css';
import { useTranslation } from 'react-i18next';
import { FocusStats } from '../types';

const ProductivityTracker: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState<number>(0);
    const [stats, setStats] = useState<FocusStats>({ completed: 0, incomplete: 0 }); // Reusing FocusStats interface if matches {completed, incomplete} or generic stats
    // The previously defined FocusStats has total_sessions, total_duration, completed_tasks.
    // Let's create a local interface if API returns slightly different structure or reuse.
    // Looking at api.js previously, getTaskStats returns { completed: number, incomplete: number }.
    // Let's define it locally or update types.ts. For now local.

    // Actually, let's just use flexible type or update types.
    // For now:
    // interface TaskStats { completed: number; incomplete: number; }

    const [advice, setAdvice] = useState<string>('');

    const advices = [
        "Divide y vencerás: rompe esa tarea grande en pasos diminutos.",
        "La regla de los 2 minutos: si toma menos de 2 minutos, hazlo ya.",
        "Usa la técnica Pomodoro: 25 minutos de enfoque, 5 de descanso.",
        "No busques la perfección, busca el progreso.",
        "Empieza por lo más difícil y el resto será bajada.",
        "Si te sientes bloqueado, solo da el primer paso, aunque sea pequeño.",
        "El descanso es parte de la productividad. ¡Tómate un respiro!",
        "Visualiza cómo te sentirás al terminar la tarea.",
        "Elimina las distracciones: pon el celular en otro cuarto.",
        "Haz una lista de solo 3 cosas importantes para hoy."
    ];

    useEffect(() => {
        // Timer logic
        const timer = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);

        // Initial fetch
        fetchStats();

        // Random advice
        setAdvice(advices[Math.floor(Math.random() * advices.length)]);

        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getTaskStats();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="productivity-tracker">
            <div className="tracker-section">
                <h3>{t('tracker.time_in_app', 'Tiempo en sesión')}</h3>
                <div className="timer-display">{formatTime(seconds)}</div>
            </div>

            <div className="tracker-section">
                <h3>{t('tracker.tasks', 'Tareas')}</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-value completed">{stats.completed}</span>
                        <span className="stat-label">{t('tracker.completed', 'Completadas')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value incomplete">{stats.incomplete}</span>
                        {/* Assuming incomplete is mapped to pending logic in backend or just count */}
                        {/* Note: The interface for stats needs 'incomplete' property */}
                        <span className="stat-label">{t('tracker.pending', 'Pendientes')}</span>
                    </div>
                </div>
            </div>

            <div className="tracker-section">
                <h3>{t('tracker.advice', 'Consejo Anti-Procastinación')}</h3>
                <div className="advice-text">"{advice}"</div>
            </div>

            <button className="focus-mode-btn" onClick={() => navigate('/focus')}>
                🧠 Entrar en Modo Enfoque
            </button>
        </div>
    );
};

export default ProductivityTracker;
