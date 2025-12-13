// src/components/TimelineView.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTimeline } from '../api';
import './TimelineView.css';
import { TimelineItem } from '../types';

const TimelineView: React.FC = () => {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nowPosition, setNowPosition] = useState<number>(0);
    const { t } = useTranslation();

    // Configuración de la grilla
    const startHour = 6; // 6 AM
    const endHour = 22;  // 10 PM
    const pixelsPerHour = 60; // 1 pixel por minuto (60px por hora)
    const totalHeight = (endHour - startHour) * pixelsPerHour;

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const data = await getTimeline();
                setItems(data);
            } catch (err) {
                console.error("Error fetching timeline:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeline();

        // Actualizar línea de "Ahora" cada minuto
        const updateNow = () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            if (hour >= startHour && hour < endHour) {
                const minutesFromStart = (hour - startHour) * 60 + minute;
                setNowPosition(minutesFromStart); // Si 1px = 1min, direct mapping
            }
        };

        updateNow();
        const interval = setInterval(updateNow, 60000);
        return () => clearInterval(interval);
    }, []);

    const calculatePosition = (dateString: string) => {
        const date = new Date(dateString);
        const hour = date.getHours();
        const minute = date.getMinutes();

        // Calcular minutos desde el inicio del día configurado (ej. 6AM)
        const minutesFromStart = (hour - startHour) * 60 + minute;
        return minutesFromStart; // Top position en pixeles (si 1px/min)
    };

    const calculateHeight = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const diffMs = end.getTime() - start.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        return Math.max(diffMinutes, 30); // Altura mínima 30px (30 min) para visibilidad
    };

    if (loading) return <div className="timeline-loading">{t('widgets.loading_day', 'Cargando tu día...')}</div>;

    // Generar marcadores de hora
    const hourMarkers = [];
    for (let i = startHour; i <= endHour; i++) {
        hourMarkers.push(i);
    }

    return (
        <div className="timeline-container">
            <h3>{t('widgets.timeline_title', '📅 Tu Día Visual')}</h3>
            <div className="timeline-grid" style={{ height: totalHeight + 20 }}> {/* +padding */}

                {/* Marcadores de hora y Grid Lines */}
                {hourMarkers.map(hour => (
                    <div
                        key={hour}
                        className="timeline-hour-marker"
                        style={{ top: (hour - startHour) * pixelsPerHour }}
                    >
                        <span className="hour-label">{hour}:00</span>
                        <div className="hour-line"></div>
                    </div>
                ))}

                {/* Línea de Ahora */}
                {nowPosition > 0 && (
                    <div
                        className="now-indicator"
                        style={{ top: nowPosition }}
                        title="Ahora"
                    ></div>
                )}

                {/* Eventos y Tareas */}
                {items.map(item => {
                    const top = calculatePosition(item.start);
                    // Solo renderizar si está dentro del rango visible (aprox)
                    if (top < 0 || top > totalHeight) return null;

                    const height = calculateHeight(item.start, item.end);

                    return (
                        <div
                            key={`${item.type}-${item.id}`}
                            className={`timeline-item item-${item.type}`}
                            style={{
                                top: top,
                                height: height,
                                backgroundColor: item.color || (item.type === 'event' ? '#2196f3' : '#ff9800')
                            }}
                        >
                            <div className="item-content">
                                <strong>{item.title}</strong>
                                <span className="item-time">
                                    {new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineView;
