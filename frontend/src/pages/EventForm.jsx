// src/pages/EventForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createEvent, getEvent, updateEvent, getCategories } from '../api';

const EventForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // undefined for create, defined for edit
    const isEdit = id && !isNaN(Number(id));
    const [searchParams] = useSearchParams();

    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load categories for select
        (async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (err) {
                console.error('Error loading categories', err);
            }
        })();

        if (isEdit) {
            (async () => {
                try {
                    const ev = await getEvent(id);
                    setTitle(ev.title || '');
                    setStartTime(ev.start_time ? new Date(ev.start_time).toISOString().slice(0, 16) : '');
                    setEndTime(ev.end_time ? new Date(ev.end_time).toISOString().slice(0, 16) : '');
                    setCategoryId(ev.category_id || '');
                } catch (err) {
                    console.error('Error loading event', err);
                    setError('No se pudo cargar el evento');
                }
            })();
        } else {
            // Check for query params if creating new
            const startParam = searchParams.get('start');
            const endParam = searchParams.get('end');
            if (startParam) {
                setStartTime(new Date(startParam).toISOString().slice(0, 16));
            }
            if (endParam) {
                setEndTime(new Date(endParam).toISOString().slice(0, 16));
            }
        }
    }, [id, isEdit, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const payload = {
            title,
            start_time: startTime ? new Date(startTime).toISOString() : undefined,
            end_time: endTime ? new Date(endTime).toISOString() : undefined,
            category_id: categoryId ? Number(categoryId) : undefined,
        };
        try {
            if (isEdit) {
                await updateEvent(id, payload);
            } else {
                await createEvent(payload);
            }
            navigate('/events');
        } catch (err) {
            console.error('Error saving event', err);
            setError('Error al guardar el evento');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>{isEdit ? 'Editar Evento' : 'Crear Evento'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="title">Título:</label><br />
                    <label htmlFor="title">Título:</label><br />
                    <input type="text" id="title" name="title" autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="startTime">Inicio:</label><br />
                    <label htmlFor="startTime">Inicio:</label><br />
                    <input type="datetime-local" id="startTime" name="startTime" autoComplete="off" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="endTime">Fin:</label><br />
                    <label htmlFor="endTime">Fin:</label><br />
                    <input type="datetime-local" id="endTime" name="endTime" autoComplete="off" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="categoryId">Categoría:</label><br />
                    <select id="categoryId" name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                        <option value="">Selecciona una categoría</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit">{isEdit ? 'Actualizar' : 'Crear'}</button>
            </form>
        </div>
    );
};

export default EventForm;
