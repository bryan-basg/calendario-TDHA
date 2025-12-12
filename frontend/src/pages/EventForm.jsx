// src/pages/EventForm.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createEvent, getEvent, updateEvent, getCategories } from '../api';

const EventForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // undefined for create, defined for edit
    const isEdit = id && !isNaN(Number(id));
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

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
                    setError(t('events.fetch_error', 'No se pudo cargar el evento'));
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
                toast.success(t('events.updated_success', 'Evento actualizado correctamente'));
            } else {
                await createEvent(payload);
                toast.success(t('events.created_success', 'Evento creado correctamente'));
            }
            navigate('/events');
        } catch (err) {
            console.error('Error saving event', err);
            // Error toast handled by api interceptor
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '2rem 0' }}>
            <h2 className="mb-4">{isEdit ? t('events.edit_title', 'Editar Evento') : t('events.create_title', 'Crear Evento')}</h2>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#c53030', marginBottom: '1rem', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="title">{t('events.title_label', 'Título:')}</label>
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

                    <div className="flex gap-4 mb-4">
                        <div className="form-group flex-1">
                            <label className="form-label" htmlFor="startTime">{t('events.start_label', 'Inicio:')}</label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                name="startTime"
                                autoComplete="off"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="input-field"
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label className="form-label" htmlFor="endTime">{t('events.end_label', 'Fin:')}</label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                name="endTime"
                                autoComplete="off"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="categoryId">{t('events.category_label', 'Categoría:')}</label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            className="input-field"
                        >
                            <option value="">{t('events.select_category', 'Selecciona una categoría')}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/events')}
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

export default EventForm;
