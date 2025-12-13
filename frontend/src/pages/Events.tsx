// src/pages/Events.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getEvents, deleteEvent } from '../api';
import { Event } from '../types';

const Events: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const fetchEvents = async () => {
        try {
            const data = await getEvents();
            setEvents(data);
        } catch (err: any) {
            console.error('Error fetching events', err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('events.confirm_delete', '¿Eliminar este evento?'))) return;
        try {
            await deleteEvent(id);
            setEvents(events.filter((e) => e.id !== id));
        } catch (err) {
            console.error('Error deleting event', err);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString(i18n.language);
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="flex justify-between items-center mb-4">
                <h2>{t('events.list_title', 'Lista de Eventos')}</h2>
                <button
                    onClick={() => navigate('/events/new')}
                    className="btn btn-primary"
                >
                    {t('events.new_event', '+ Crear Nuevo Evento')}
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {events.map((event) => (
                    <div key={event.id} className="card flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold">{event.title}</h3>
                            <p className="text-sm text-secondary">
                                {formatDate(event.start_time)}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/events/${event.id}/edit`)}
                                className="btn btn-outline"
                            >
                                {t('common.edit', 'Editar')}
                            </button>
                            <button
                                onClick={() => handleDelete(event.id)}
                                className="btn btn-danger"
                            >
                                {t('common.delete', 'Eliminar')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Events;
