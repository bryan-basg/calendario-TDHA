// src/pages/TaskForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTask, getTask, updateTask } from '../api';

const TaskForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // undefined for create, defined for edit
    const isEdit = Boolean(id);

    const [title, setTitle] = useState('');
    const [energy, setEnergy] = useState('low');
    const [deadline, setDeadline] = useState('');
    const [plannedStart, setPlannedStart] = useState('');
    const [plannedEnd, setPlannedEnd] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEdit) {
            // fetch existing task data
            (async () => {
                try {
                    const task = await getTask(id);
                    setTitle(task.title || '');
                    setEnergy(task.energy_required || 'low');
                    setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
                    setPlannedStart(task.planned_start ? new Date(task.planned_start).toISOString().slice(0, 16) : '');
                    setPlannedEnd(task.planned_end ? new Date(task.planned_end).toISOString().slice(0, 16) : '');
                } catch (err) {
                    console.error('Error loading task', err);
                    setError('No se pudo cargar la tarea');
                }
            })();
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
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
            if (isEdit) {
                await updateTask(id, payload);
            } else {
                await createTask(payload);
            }
            navigate('/tasks');
        } catch (err) {
            console.error('Error saving task', err);
            setError('Error al guardar la tarea');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>{isEdit ? 'Editar Tarea' : 'Crear Tarea'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="title">Título:</label><br />
                    <label htmlFor="title">Título:</label><br />
                    <input type="text" id="title" name="title" autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="energy">Energía requerida:</label><br />
                    <select id="energy" name="energy" value={energy} onChange={(e) => setEnergy(e.target.value)}>
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                    </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="deadline">Deadline (opcional):</label><br />
                    <label htmlFor="deadline">Deadline (opcional):</label><br />
                    <input type="datetime-local" id="deadline" name="deadline" autoComplete="off" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>

                <h3 style={{ fontSize: '1rem', marginTop: '1.5rem' }}>📅 Time Blocking (Agendar en Calendario)</h3>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                    <div>
                        <label htmlFor="plannedStart">Inicio Planificado:</label><br />
                        <label htmlFor="plannedStart">Inicio Planificado:</label><br />
                        <input type="datetime-local" id="plannedStart" name="plannedStart" autoComplete="off" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="plannedEnd">Fin Planificado:</label><br />
                        <label htmlFor="plannedEnd">Fin Planificado:</label><br />
                        <input type="datetime-local" id="plannedEnd" name="plannedEnd" autoComplete="off" value={plannedEnd} onChange={(e) => setPlannedEnd(e.target.value)} />
                    </div>
                </div>
                <button type="submit">{isEdit ? 'Actualizar' : 'Crear'}</button>
            </form>
        </div>
    );
};

export default TaskForm;
