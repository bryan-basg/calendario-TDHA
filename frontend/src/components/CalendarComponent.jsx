// src/components/CalendarComponent.jsx

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarComponent.css'; // Custom styles
import CustomToolbar from './CustomToolbar';

// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment);

// Mapeo de mensajes al español
const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Sin eventos en este rango',
    showMore: total => `+ Ver más (${total})`
};

const CalendarComponent = ({ events, onSelectEvent, onSelectSlot, date, view, onNavigate, onView }) => {

    // Custom Event Styling
    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = event.color || '#3174ad';

        // Estilo diferente si es completada
        const opacity = event.is_completed ? 0.6 : 1;
        const textDecoration = event.is_completed ? 'line-through' : 'none';

        var style = {
            backgroundColor: backgroundColor,
            borderRadius: '5px',
            opacity: opacity,
            color: 'white',
            border: '0px',
            display: 'block',
            textDecoration: textDecoration
        };
        return {
            style: style
        };
    };

    return (
        <div className="calendar-container">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                messages={messages}
                onSelectEvent={onSelectEvent}
                onSelectSlot={onSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                // Controlled props
                date={date}
                view={view}
                onNavigate={onNavigate}
                onView={onView}
                // defaultView removed as it conflicts with controlled 'view'
                views={['month', 'week', 'day', 'agenda']}
                components={{
                    toolbar: CustomToolbar
                }}
            />
        </div>
    );
};

export default CalendarComponent;
