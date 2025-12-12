import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startFocusSession, stopFocusSession, pauseFocusSession, resumeFocusSession, logInterruption, getTasks, getFocusStats, getCurrentFocusSession } from '../api';
import FocusTimer from '../components/focus/FocusTimer';
import './FocusMode.css';

const FocusMode = () => {
    const location = useLocation();
    const [session, setSession] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (location.state?.taskId && tasks.length > 0) {
            // Ensure type match if needed, but usually select handles values
            setSelectedTask(location.state.taskId);
        }
    }, [tasks, location.state]);


    const loadData = async () => {
        try {
            const [tasksData, statsData, currentSession] = await Promise.all([
                getTasks(),
                getFocusStats(),
                getCurrentFocusSession()
            ]);
            // Filter only pending tasks?
            setTasks(tasksData.filter(t => !t.is_completed));
            setStats(statsData);

            if (currentSession) {
                setSession(currentSession);
            }
        } catch (error) {
            console.error("Error loading focus data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        try {
            const newSession = await startFocusSession(selectedTask ? parseInt(selectedTask) : null);
            setSession(newSession);
        } catch (error) {
            if (error.response && error.response.data.detail) {
                alert(error.response.data.detail);
            } else {
                console.error("Failed to start", error);
            }
        }
    };

    const handleStop = async () => {
        if (!session) return;

        // Ask for feedback
        const score = prompt("¿Qué tal fue tu sesión? (1-5)");

        // Ask if task was completed (if attached to a task)
        let completed = false;
        if (session.task_id) {
            completed = window.confirm("¿Completaste la tarea en la que estabas trabajando?");
        }

        try {
            await stopFocusSession(session.id, score ? parseInt(score) : null, completed);
            setSession(null);
            loadData(); // Refresh stats and tasks list
        } catch (error) {
            console.error("Failed to stop", error);
        }
    };

    const handlePause = async () => {
        if (!session) return;
        try {
            const updated = await pauseFocusSession(session.id);
            setSession(updated);
        } catch (error) {
            console.error("Failed to pause", error);
        }
    };

    const handleResume = async () => {
        if (!session) return;
        try {
            const updated = await resumeFocusSession(session.id);
            setSession(updated);
        } catch (error) {
            console.error("Failed to resume", error);
        }
    };

    const handleInterrupt = async () => {
        if (!session) return;
        const reason = prompt("Razón de interrupción (opcional):");
        try {
            // Optimistic update of simple counter if we wanted
            await logInterruption(session.id, reason);
            // Ideally re-fetch session to get accurate count, but we can just ignore visual update for now
        } catch (error) {
            console.error("Failed to log interruption", error);
        }
    };

    // Find task title
    const currentTaskTitle = session && session.task_id
        ? tasks.find(t => t.id === session.task_id)?.title
        : "Enfoque Libre";

    return (
        <div className="focus-page">
            <div className="focus-header">
                <h1>Modo Enfoque 🧠</h1>
                {stats && <p>Hoy: {stats.total_minutes} mins dedicados</p>}
            </div>

            {session ? (
                <div className="focus-session-active">
                    <div className="focus-current-task">
                        Enfocándote en: <strong>{currentTaskTitle}</strong>
                    </div>

                    <FocusTimer
                        startTime={session.start_time}
                        status={session.status}
                    />

                    <div className="focus-controls">
                        {session.status === 'active' ? (
                            <button className="focus-btn focus-btn-pause" onClick={handlePause}>⏸ Pausar</button>
                        ) : (
                            <button className="focus-btn focus-btn-resume" onClick={handleResume}>▶ Reanudar</button>
                        )}
                        <button className="focus-btn focus-btn-stop" onClick={handleStop}>⏹ Terminar</button>
                    </div>

                    <button className="focus-btn focus-btn-interrupt" onClick={handleInterrupt}>
                        🚨 Registrar Interrupción
                    </button>
                </div>
            ) : (
                <div className="focus-task-selector">
                    <h2>¿En qué quieres trabajar?</h2>
                    <select
                        className="focus-task-select"
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                    >
                        <option value="">-- Enfoque Libre (Sin Tarea) --</option>
                        {tasks.map(t => (
                            <option key={t.id} value={t.id}>{t.title} ({t.energy_required})</option>
                        ))}
                    </select>

                    <button className="focus-start-btn" onClick={handleStart}>
                        🚀 Comenzar Enfoque
                    </button>
                </div>
            )}
        </div>
    );
};

export default FocusMode;
