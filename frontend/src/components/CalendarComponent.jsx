// src/components/CalendarComponent.jsx

import { useTranslation } from 'react-i18next';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarComponent.css'; // Custom styles
import CustomToolbar from './CustomToolbar';

// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment);

const CalendarComponent = ({ events, onSelectEvent, onSelectSlot, date, view, onNavigate, onView }) => {
    const { t } = useTranslation();

    const messages = {
        allDay: t('calendar.allDay'),
        previous: t('calendar.previous'),
        next: t('calendar.next'),
        today: t('calendar.today'),
        month: t('calendar.month'),
        week: t('calendar.week'),
        day: t('calendar.day'),
        agenda: t('calendar.agenda'),
        date: t('calendar.date'),
        time: t('calendar.time'),
        event: t('calendar.event'),
        noEventsInRange: t('calendar.noEventsInRange'),
        showMore: total => `+ ${t('calendar.showMore')} (${total})`
    };

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
