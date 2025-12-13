// src/components/NowView.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getNowView, completeTask } from '../api';
import './NowView.css';

interface NowData {
    current_task: any; // Ideally typed as Task but api response might differ
    next_event: any; // Ideally typed as Event
    time_gap_minutes: number;
}

const NowView: React.FC = () => {
    const [nowData, setNowData] = useState<NowData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const fetchNowData = async () => {
        setLoading(true);
        try {
            const data = await getNowView();
            setNowData(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(t('common.error', 'Error al cargar la vista "Ahora"'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNowData();
    }, []);

    const handleCompleteTask = async (taskId: number) => {
        try {
            await completeTask(taskId);
            fetchNowData(); // Recargar la vista
        } catch (err) {
            console.error('Error al completar tarea', err);
        }
    };

    if (loading) return <div>{t('common.loading', 'Cargando tu enfoque actual...')}</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!nowData) return <div>{t('common.no_data', 'No hay datos disponibles')}</div>;

    const { current_task, next_event, time_gap_minutes } = nowData;

    return (
        <div className="now-view-container">
            <h2>{t('widgets.now_view_title', '🎯 Tu Enfoque Actual')}</h2>

            {/* Próximo Evento / Deadline */}
            <div className="next-event-section">
                {next_event ? (
                    <div className="event-card">
                        <h3>{t('widgets.next_event', '🗓️ Siguiente Evento:')} {next_event.title}</h3>
                        <p>{t('widgets.starts_at', 'Inicio:')} {new Date(next_event.date_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="time-gap">{t('widgets.missing_minutes', { minutes: time_gap_minutes, defaultValue: `Faltan ${time_gap_minutes} minutos` })}</p>
                    </div>
                ) : (
                    <p>{t('widgets.no_immediate_events', 'No tienes eventos próximos inmediatos.')}</p>
                )}
            </div>

            {/* Tarea Actual Sugerida */}
            <div className="current-task-section">
                {current_task ? (
                    <div className={`task-card-hero priority-${current_task.priority}`}>
                        <h3>{t('widgets.suggested_task_hero', '⚡ Tarea Sugerida:')}</h3>
                        <div className="task-title">{current_task.title}</div>
                        <p>{t('tasks.energy_label', 'Energía requerida:')} {current_task.energy_required}</p>
                        <p>{t('tasks.deadline_label', 'Deadline:')} {current_task.deadline ? new Date(current_task.deadline).toLocaleString() : t('common.none', 'Sin fecha límite')}</p>

                        <button
                            className="complete-btn-hero"
                            onClick={() => handleCompleteTask(current_task.id)}
                        >
                            {t('widgets.done_btn', '¡Hecho! ✅')}
                        </button>
                    </div>
                ) : (
                    <div className="free-time-card">
                        <h3>{t('widgets.free_time_title', '🎉 ¡Tiempo Libre!')}</h3>
                        <p>{t('widgets.free_time_desc', 'No tienes tareas críticas pendientes para este bloque. ¡Descansa o adelanta algo pequeño!')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NowView;
