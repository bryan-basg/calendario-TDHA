// src/pages/Tasks.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTasks, deleteTask, completeTask } from '../api';
import './Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (err) {
            console.error('Error fetching tasks', err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm(t('tasks.confirm_delete', '¿Eliminar esta tarea?'))) return;
        try {
            await deleteTask(id);
            setTasks(tasks.filter((t) => t.id !== id));
        } catch (err) {
            console.error('Error deleting task', err);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            const updatedTask = await completeTask(task.id);
            setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
        } catch (err) {
            console.error('Error toggling completion', err);
        }
    };

    if (loading) {
        return <div className="loading-state">{t('common.loading', 'Cargando...')}</div>;
    }

    return (
        <div className="tasks-container">
            <header className="tasks-header">
                <h2>{t('tasks.header', 'Mis Tareas')}</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/tasks/new')}
                >
                    {t('tasks.new_task', '+ Nueva Tarea')}
                </button>
            </header>

            {tasks.length === 0 ? (
                <div className="text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p>{t('tasks.empty_state', 'No tienes tareas pendientes. ¡Buen trabajo!')}</p>
                </div>
            ) : (
                <ul className="tasks-list">
                    {tasks.map((task) => (
                        <li key={task.id} className={`task-item ${task.is_completed ? 'completed' : ''}`}>
                            <div className="task-content">
                                <div
                                    className={`task-checkbox ${task.is_completed ? 'completed' : ''}`}
                                    onClick={() => handleToggleComplete(task)}
                                    title="Marcar como completada"
                                >
                                    {task.is_completed ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                                    )}
                                </div>
                                <div className="task-details">
                                    <span className="task-title">{task.title}</span>
                                    {task.planned_start && (
                                        <div className="task-meta">
                                            <span className="task-date">
                                                📅 {new Date(task.planned_start).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginRight: '0.5rem' }}
                                    onClick={() => navigate('/focus', { state: { taskId: task.id } })}
                                    title={t('tasks.start_focus', 'Iniciar Modo Enfoque')}
                                >
                                    🎯
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                                >
                                    {t('common.edit', 'Editar')}
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                    onClick={() => handleDelete(task.id)}
                                >
                                    {t('common.delete', 'Eliminar')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Tasks;
