// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getTimeline, getCategories, getTaskSuggestions } from '../api';
import { useNavigate } from 'react-router-dom';
import CalendarComponent from '../components/CalendarComponent';
import EnergyWidget from '../components/EnergyWidget';
import './Dashboard.css'; // New styles for dashboard layout

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Estados para el calendario controlado
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month'); // 'month', 'week', 'day', 'agenda'

    // Cargar datos unificados del Timeline cuando cambia la fecha o la vista
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Calcular start y end basado en la vista actual
                let start, end;
                const now = new Date(currentDate);

                if (currentView === 'day') {
                    start = new Date(now.setHours(0, 0, 0, 0));
                    end = new Date(now.setHours(23, 59, 59, 999));
                } else if (currentView === 'week') {
                    // Asumimos semana empieza domingo o lunes segun locale, pero simplifquemos: -7 +7 dias
                    // Mejor usar libreria fecha o logica simple.
                    // React-Big-Calendar usa su propia logica, pero para fetch, pidamos un rango amplio seguros.
                    // O mejor: Primer dia del mes actual a ultimo dia del mes actual (si es mes).
                    // Si es semana, rango de la semana.

                    // Estrategia simple: Pedir SIEMPRE el mes completo de la fecha actual
                    // mas un padding de 7 dias para cubrir semanas transicionales.
                    const y = now.getFullYear();
                    const m = now.getMonth();
                    start = new Date(y, m, 1);
                    end = new Date(y, m + 1, 0, 23, 59, 59); // Fin de mes
                    // Padding
                    start.setDate(start.getDate() - 7);
                    end.setDate(end.getDate() + 7);
                } else if (currentView === 'agenda') {
                    // Agenda suele mostrar 30 dias por defecto
                    start = new Date(now);
                    end = new Date(now);
                    end.setDate(end.getDate() + 30);
                } else {
                    // Month view (default)
                    const y = now.getFullYear();
                    const m = now.getMonth();
                    start = new Date(y, m, 1);
                    end = new Date(y, m + 1, 0, 23, 59, 59);
                    // Padding visual
                    start.setDate(start.getDate() - 7);
                    end.setDate(end.getDate() + 7);
                }

                const [timelineData, cats] = await Promise.all([
                    getTimeline(start.toISOString(), end.toISOString()),
                    getCategories()
                ]);

                const formattedEvents = timelineData.map(item => ({
                    ...item,
                    start: new Date(item.start),
                    end: new Date(item.end),
                    resource: item
                }));

                setEvents(formattedEvents);
                setCategories(cats);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    console.error("Error cargando dashboard:", err);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate, currentDate, currentView]);

    const handleNavigate = (date) => {
        setCurrentDate(date);
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleSelectEvent = (event) => {
        // TODO: Abrir modal de edición
        const typePath = event.type === 'task' ? 'tasks' : 'events';
        // Por ahora navegamos, luego haremos modal
        navigate(`/${typePath}/${event.id}/edit`);
    };

    const handleSelectSlot = ({ start, end }) => {
        // Redirigir al formulario de creación con parametros de fechas pre-rellenados
        const startStr = start.toISOString();
        const endStr = end.toISOString();
        navigate(`/events/new?start=${startStr}&end=${endStr}`);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>Mi Agenda</h2>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                {sidebarOpen && (
                    <div className="sidebar-content">
                        <section className="widget-section">
                            <EnergyWidget />
                        </section>

                        <section className="widget-section">
                            <h3>Categorías</h3>
                            <ul className="category-list">
                                {categories.map(cat => (
                                    <li key={cat.id} style={{ borderLeft: `4px solid ${cat.color_hex}` }}>
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/categories')} className="btn-small">Gestionar</button>
                        </section>

                        <section className="widget-section">
                            <button onClick={() => navigate('/tasks/new')} className="btn-main">Nueva Tarea</button>
                            <button onClick={() => navigate('/events/new')} className="btn-secondary">Nuevo Evento</button>
                        </section>
                    </div>
                )}
            </div>

            {/* Main Calendar Area */}
            <div className="dashboard-main">
                {/* Header móvil para abrir sidebar si está cerrado */}
                {!sidebarOpen && (
                    <button onClick={() => setSidebarOpen(true)} className="floating-toggle">
                        ⚙
                    </button>
                )}

                {loading ? (
                    <div className="loading-state">Cargando calendario...</div>
                ) : (
                    <CalendarComponent
                        events={events}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        date={currentDate}
                        view={currentView}
                        onNavigate={handleNavigate}
                        onView={handleViewChange}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
