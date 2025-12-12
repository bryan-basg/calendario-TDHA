import React, { useEffect, useState } from 'react';
import './FocusTimer.css';

const FocusTimer = ({ startTime, status, initialDuration = 0 }) => {
    const [elapsed, setElapsed] = useState(initialDuration);

    useEffect(() => {
        let interval = null;

        if (status === 'active' && startTime) {
            // Calculate initial elapsed to handle page reloads
            // However, if we paused, start_time doesn't shift, so elapsed is technically (now - start) - pause_duration.
            // But our backend MVP doesn't track pause duration properly yet.
            // So for MVP, let's just count from mount if we don't have start_time logic perfect.
            // Better: we rely on backend 'duration_minutes' or similar but that's only calculated on stop.

            // Correct approach for MVP:
            // If we are active, we just show "Running".
            // To show accurate time:
            // If we provided a 'startTime', use it.

            const startMs = new Date(startTime).getTime();

            const update = () => {
                const now = new Date().getTime();
                // We can't easily correct for pauses without more data from backend.
                // Let's assume for now: simple elapsed time from START, ignoring pauses in display (or assuming no pauses happened).
                // OR, passed 'elapsed' prop from parent?
                // Let's rely on client-side interval for "live" feel, but sync with start time.
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

    const formatTime = (seconds) => {
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
