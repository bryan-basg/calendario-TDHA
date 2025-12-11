// src/pages/Events.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent } from '../api';

const Events = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            const data = await getEvents();
            setEvents(data);
        } catch (err) {
            console.error('Error fetching events', err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este evento?')) return;
        try {
            await deleteEvent(id);
            setEvents(events.filter((e) => e.id !== id));
        } catch (err) {
            console.error('Error deleting event', err);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Lista de Eventos</h2>
            <button onClick={() => navigate('/events/new')}>Crear Nuevo Evento</button>
            <ul>
                {events.map((event) => (
                    <li key={event.id} style={{ marginBottom: '0.5rem' }}>
                        {event.title} ({new Date(event.start_time).toLocaleString()})
                        {' '}
                        <button onClick={() => navigate(`/events/${event.id}/edit`)}>Editar</button>
                        {' '}
                        <button onClick={() => handleDelete(event.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Events;
