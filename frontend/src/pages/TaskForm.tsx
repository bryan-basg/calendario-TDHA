// src/pages/TaskForm.tsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createTask, getTask, updateTask } from '../api';
import { Task } from '../types';

const TaskForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // undefined for create, defined for edit
    const isEdit = Boolean(id);
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [energy, setEnergy] = useState('low');
    const [deadline, setDeadline] = useState('');
    const [plannedStart, setPlannedStart] = useState('');
    const [plannedEnd, setPlannedEnd] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            // fetch existing task data
            (async () => {
                try {
                    const task: Task = await getTask(Number(id));
                    setTitle(task.title || '');
                    setEnergy(task.energy_required || 'low');
                    setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
                    setPlannedStart(task.planned_start ? new Date(task.planned_start).toISOString().slice(0, 16) : '');
                    setPlannedEnd(task.planned_end ? new Date(task.planned_end).toISOString().slice(0, 16) : '');
                } catch (err) {
                    console.error('Error loading task', err);
                    setError(t('tasks.fetch_error', 'No se pudo cargar la tarea'));
                }
            })();
        }
    }, [id, isEdit, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const payload = {
            title,
            energy_required: energy,
            deadline: deadline ? new Date(deadline).toISOString() : undefined,
            planned_start: plannedStart ? new Date(plannedStart).toISOString() : undefined,
            planned_end: plannedEnd ? new Date(plannedEnd).toISOString() : undefined,
        };
        try {
            if (isEdit && id) {
                await updateTask(Number(id), payload);
                toast.success(t('tasks.updated_success', 'Tarea actualizada correctamente'));
            } else {
                await createTask(payload);
                toast.success(t('tasks.created_success', 'Tarea creada correctamente'));
            }
            navigate('/tasks');
        } catch (err) {
            console.error('Error saving task', err);
            // Error toast handled by api interceptor
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '2rem 0' }}>
            <h2 className="mb-4">{isEdit ? t('tasks.edit_title', 'Editar Tarea') : t('tasks.create_title', 'Crear Tarea')}</h2>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#c53030', marginBottom: '1rem', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="title">{t('tasks.title_label', 'Título:')}</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            autoComplete="off"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="energy">{t('tasks.energy_label', 'Energía requerida:')}</label>
                        <select
                            id="energy"
                            name="energy"
                            value={energy}
                            onChange={(e) => setEnergy(e.target.value)}
                            className="input-field"
                        >
                            <option value="low">{t('widgets.low', 'Baja')}</option>
                            <option value="medium">{t('widgets.medium', 'Media')}</option>
                            <option value="high">{t('widgets.high', 'Alta')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="deadline">{t('tasks.deadline_label', 'Deadline (opcional):')}</label>
                        <input
                            type="datetime-local"
                            id="deadline"
                            name="deadline"
                            autoComplete="off"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--neutral-200)' }}>
                        <h3 className="text-lg font-bold mb-4">{t('tasks.time_blocking_title', '📅 Time Blocking (Agendar en Calendario)')}</h3>
                        <div className="flex gap-4 mb-4">
                            <div className="form-group flex-1">
                                <label className="form-label" htmlFor="plannedStart">{t('tasks.planned_start_label', 'Inicio Planificado:')}</label>
                                <input
                                    type="datetime-local"
                                    id="plannedStart"
                                    name="plannedStart"
                                    autoComplete="off"
                                    value={plannedStart}
                                    onChange={(e) => setPlannedStart(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label" htmlFor="plannedEnd">{t('tasks.planned_end_label', 'Fin Planificado:')}</label>
                                <input
                                    type="datetime-local"
                                    id="plannedEnd"
                                    name="plannedEnd"
                                    autoComplete="off"
                                    value={plannedEnd}
                                    onChange={(e) => setPlannedEnd(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/tasks')}
                            className="btn btn-outline"
                        >
                            {t('common.cancel', 'Cancelar')}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEdit ? t('categories.update_btn', 'Actualizar') : t('common.save', 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;
