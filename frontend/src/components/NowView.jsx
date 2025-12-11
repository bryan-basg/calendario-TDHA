// src/components/NowView.jsx
import React, { useEffect, useState } from 'react';
import { getNowView, completeTask } from '../api';
import './NowView.css';

const NowView = () => {
    const [nowData, setNowData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNowData = async () => {
        setLoading(true);
        try {
            const data = await getNowView();
            setNowData(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar la vista "Ahora"');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNowData();
    }, []);

    const handleCompleteTask = async (taskId) => {
        try {
            await completeTask(taskId);
            fetchNowData(); // Recargar la vista
        } catch (err) {
            console.error('Error al completar tarea', err);
        }
    };

    if (loading) return <div>Cargando tu enfoque actual...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!nowData) return <div>No hay datos disponibles</div>;

    const { current_task, next_event, time_gap_minutes } = nowData;

    return (
        <div className="now-view-container">
            <h2>🎯 Tu Enfoque Actual</h2>

            {/* Próximo Evento / Deadline */}
            <div className="next-event-section">
                {next_event ? (
                    <div className="event-card">
                        <h3>🗓️ Siguiente Evento: {next_event.title}</h3>
                        <p>Inicio: {new Date(next_event.date_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="time-gap">Faltan {time_gap_minutes} minutos</p>
                    </div>
                ) : (
                    <p>No tienes eventos próximos inmediatos.</p>
                )}
            </div>

            {/* Tarea Actual Sugerida */}
            <div className="current-task-section">
                {current_task ? (
                    <div className={`task-card-hero priority-${current_task.priority}`}>
                        <h3>⚡ Tarea Sugerida:</h3>
                        <div className="task-title">{current_task.title}</div>
                        <p>Energía requerida: {current_task.energy_required}</p>
                        <p>Deadline: {current_task.deadline ? new Date(current_task.deadline).toLocaleString() : 'Sin fecha límite'}</p>

                        <button
                            className="complete-btn-hero"
                            onClick={() => handleCompleteTask(current_task.id)}
                        >
                            ¡Hecho! ✅
                        </button>
                    </div>
                ) : (
                    <div className="free-time-card">
                        <h3>🎉 ¡Tiempo Libre!</h3>
                        <p>No tienes tareas críticas pendientes para este bloque. ¡Descansa o adelanta algo pequeño!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NowView;
