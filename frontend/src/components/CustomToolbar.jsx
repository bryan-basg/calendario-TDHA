
const CustomToolbar = ({ label, onNavigate, onView, view }) => {
    // Funciones de navegación
    const goToBack = () => {
        onNavigate('PREV');
    };

    const goToNext = () => {
        onNavigate('NEXT');
    };

    const goToCurrent = () => {
        onNavigate('TODAY');
    };

    // Funciones de vista
    const goToMonth = () => {
        onView('month');
    };

    const goToWeek = () => {
        onView('week');
    };

    const goToDay = () => {
        onView('day');
    };

    const goToAgenda = () => {
        onView('agenda');
    };

    return (
        <div className="rbc-toolbar">
            <span className="rbc-btn-group">
                <button type="button" onClick={goToCurrent} className="rbc-today">Hoy</button>
                <button type="button" onClick={goToBack}>Anterior</button>
                <button type="button" onClick={goToNext}>Siguiente</button>
            </span>

            <span className="rbc-toolbar-label">{label}</span>

            <span className="rbc-btn-group">
                <button
                    type="button"
                    onClick={goToMonth}
                    className={view === 'month' ? 'rbc-active' : ''}
                >
                    Mes
                </button>
                <button
                    type="button"
                    onClick={goToWeek}
                    className={view === 'week' ? 'rbc-active' : ''}
                >
                    Semana
                </button>
                <button
                    type="button"
                    onClick={goToDay}
                    className={view === 'day' ? 'rbc-active' : ''}
                >
                    Día
                </button>
                <button
                    type="button"
                    onClick={goToAgenda}
                    className={view === 'agenda' ? 'rbc-active' : ''}
                >
                    Agenda
                </button>
            </span>
        </div>
    );
};

export default CustomToolbar;
