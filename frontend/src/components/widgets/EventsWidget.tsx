import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TimelineItem } from '../../types';

interface EventsWidgetProps {
    events: any[]; // Using any to pass CalendarEvent (Date objects) or TimelineItem
    onNavigate: (path: string) => void;
    onSelect: (event: any) => void;
}

export const EventsWidget: React.FC<EventsWidgetProps> = ({ events, onNavigate, onSelect }) => {
    const { t } = useTranslation();

    return (
        <div className="dashboard-list-card">
            <div className="list-header">
                <h3>{t('events.header', 'Eventos')}</h3>
                <button className="btn-icon" onClick={() => onNavigate('/events/new')}>+</button>
            </div>
            <ul className="mini-list">
                {events
                    .filter(e => (e.type === 'event' || !e.type) && new Date(e.start) >= new Date()) // Simple filtering
                    .slice(0, 5)
                    .map(event => (
                        <li key={event.id} onClick={() => onSelect(event)}>
                            <span className="calendar-dot" style={{ backgroundColor: event.color }}></span>
                            <span className="list-item-title">{event.title}</span>
                            <span className="list-item-date">{moment(event.start).format('DD/MM')}</span>
                        </li>
                    ))}
                {events.filter(e => (e.type === 'event' || !e.type) && new Date(e.start) >= new Date()).length === 0 && <li className="empty-msg">{t('events.empty', 'Sin eventos próximos')}</li>}
            </ul>
            <button className="btn-text" onClick={() => onNavigate('/events')}>{t('common.see_all', 'Ver todos')}</button>
        </div>
    );
};
