// src/components/CalendarComponent.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, momentLocalizer, View, NavigateAction } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarComponent.css'; // Custom styles
// @ts-ignore
import CustomToolbar from './CustomToolbar';
import { TimelineItem } from '../types';

// Setup the localizer
const localizer = momentLocalizer(moment);

// Interface for Calendar events
// We need to extend TimelineItem but ensure start/end are Date objects for BigCalendar
interface CalendarEvent extends Omit<TimelineItem, 'start' | 'end'> {
    start: Date;
    end: Date;
    resource?: any;
    is_completed?: boolean;
    color?: string;
}

interface CalendarComponentProps {
    events: CalendarEvent[];
    onSelectEvent: (event: CalendarEvent) => void;
    onSelectSlot: (slotInfo: { start: Date; end: Date; slots: Date[]; action: 'select' | 'click' | 'doubleClick' }) => void;
    date: Date;
    view: string;
    onNavigate: (newDate: Date, view: View, action: NavigateAction) => void;
    onView: (view: View) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ events, onSelectEvent, onSelectSlot, date, view, onNavigate, onView }) => {
    const { t } = useTranslation();

    const messages: any = {
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
        showMore: (total: number) => `+ ${t('calendar.showMore')} (${total})`
    };

    // Custom Event Styling
    const eventStyleGetter = (event: CalendarEvent, _start: Date, _end: Date, _isSelected: boolean) => {
        let backgroundColor = event.color || '#3174ad';

        // Estilo diferente si es completada
        const opacity = event.is_completed ? 0.6 : 1;
        const textDecoration = event.is_completed ? 'line-through' : 'none';

        const style = {
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

    // Cast view to allowed types (helper if needed, but string works usually if matches View type)
    const currentView = view as View;

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
                view={currentView} // Use casted view
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
