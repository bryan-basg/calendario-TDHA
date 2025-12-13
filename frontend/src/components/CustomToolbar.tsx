import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, NavigateAction } from 'react-big-calendar';

interface CustomToolbarProps {
    label: string;
    onNavigate: (action: NavigateAction) => void;
    onView: (view: View) => void;
    view: View;
    localizer?: any; // Required by RBC types but often injected
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ label, onNavigate, onView, view }) => {
    const { t } = useTranslation();

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
                <button type="button" onClick={goToCurrent} className="rbc-today">{t('calendar.today')}</button>
                <button type="button" onClick={goToBack}>{t('calendar.previous')}</button>
                <button type="button" onClick={goToNext}>{t('calendar.next')}</button>
            </span>

            <span className="rbc-toolbar-label">{label}</span>

            <span className="rbc-btn-group">
                <button
                    type="button"
                    onClick={goToMonth}
                    className={view === 'month' ? 'rbc-active' : ''}
                >
                    {t('calendar.month')}
                </button>
                <button
                    type="button"
                    onClick={goToWeek}
                    className={view === 'week' ? 'rbc-active' : ''}
                >
                    {t('calendar.week')}
                </button>
                <button
                    type="button"
                    onClick={goToDay}
                    className={view === 'day' ? 'rbc-active' : ''}
                >
                    {t('calendar.day')}
                </button>
                <button
                    type="button"
                    onClick={goToAgenda}
                    className={view === 'agenda' ? 'rbc-active' : ''}
                >
                    {t('calendar.agenda')}
                </button>
            </span>
        </div>
    );
};

export default CustomToolbar;
