// src/components/focus/FocusTimer.tsx
import React, { useEffect, useState } from 'react';
import './FocusTimer.css';

interface FocusTimerProps {
    startTime?: string | Date; // String from backend ISO, or Date object
    status: 'active' | 'paused' | 'stopped' | 'completed'; // Add other possible statuses from backend
    initialDuration?: number;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ startTime, status, initialDuration = 0 }) => {
    const [elapsed, setElapsed] = useState<number>(initialDuration);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (status === 'active' && startTime) {
            const startMs = new Date(startTime).getTime();

            const update = () => {
                const now = new Date().getTime();
                // Simple elapsed time from START
                const diffSeconds = Math.floor((now - startMs) / 1000);
                setElapsed(diffSeconds > 0 ? diffSeconds : 0);
            };

            update(); // immediate
            interval = setInterval(update, 1000);
        } else if (status === 'paused') {
            // Stop updating
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [startTime, status]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="focus-timer-container">
            <div className="focus-timer-display">
                {formatTime(elapsed)}
            </div>
            <div className="focus-timer-label">{status === 'paused' ? 'Pausado' : 'Enfoque'}</div>
        </div>
    );
};

export default FocusTimer;
