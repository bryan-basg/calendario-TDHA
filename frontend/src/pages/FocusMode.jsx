// src/pages/FocusMode.jsx
import React, { useState, useEffect } from 'react';
import { getTaskSuggestions, completeTask } from '../api';
// import confetti from 'canvas-confetti'; // Optional: for celebration (would need install), but we can do simple CSS for now

const FocusMode = () => {
    const [step, setStep] = useState('energy'); // energy, focus, empty
    const [currentTask, setCurrentTask] = useState(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);

    // Timer logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound?
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEnergySelect = async (level) => {
        setLoading(true);
        try {
            const suggestions = await getTaskSuggestions(level);
            if (suggestions.length > 0) {
                setCurrentTask(suggestions[0]); // Pick the top one
                setStep('focus');
                setTimeLeft(25 * 60); // Reset timer
            } else {
                setStep('empty');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!currentTask) return;
        try {
            await completeTask(currentTask.id);
            // Celebration!
            alert("¡Excelente trabajo! Tarea completada 🎉");
            handleSkip(); // Look for next one or go back
        } catch (err) {
            console.error(err);
        }
    };

    const handleSkip = () => {
        // Simple "Skip" logic: For now, just go back to energy selection to pick again
        // Ideally we would fetch the next one from the previous list, but keeps it simple.
        setStep('energy');
        setIsActive(false);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>🔄 Cargando tu misión...</div>;

    if (step === 'empty') return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>¡Todo limpio!</h2>
            <p>No hay tareas sugeridas para este nivel de energía. ¡Eres libre!</p>
            <button onClick={() => setStep('energy')} style={styles.buttonSecondary}>Volver</button>
        </div>
    );

    if (step === 'energy') return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h1>🎯 Modo Enfoque</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Para empezar, dinos cómo te sientes ahora:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => handleEnergySelect('high')} style={{ ...styles.energyBtn, backgroundColor: '#ff5252' }}>
                    🔥 Alta Energía (¡A por todas!)
                </button>
                <button onClick={() => handleEnergySelect('medium')} style={{ ...styles.energyBtn, backgroundColor: '#ffa726' }}>
                    😐 Me siento normal
                </button>
                <button onClick={() => handleEnergySelect('low')} style={{ ...styles.energyBtn, backgroundColor: '#66bb6a' }}>
                    😴 Baja Energía (Algo tranqui)
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            padding: '1rem'
        }}>
            <h3 style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Tu Objetivo Ahora</h3>

            <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '1rem 0 3rem 0',
                padding: '1rem',
                borderBottom: '2px solid #eee'
            }}>
                {currentTask.title}
            </div>

            <div style={{ fontSize: '6rem', fontFamily: 'monospace', fontWeight: 'bold', color: isActive ? '#333' : '#aaa' }}>
                {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                    onClick={() => setIsActive(!isActive)}
                    style={{ ...styles.buttonBig, backgroundColor: isActive ? '#f44336' : '#2196f3' }}
                >
                    {isActive ? '⏸ Pausar' : '▶ Iniciar Focus'}
                </button>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
                <button onClick={handleComplete} style={styles.buttonAction}>✅ Completar</button>
                <button onClick={handleSkip} style={{ ...styles.buttonAction, backgroundColor: '#ccc', color: '#333' }}>⏭ Saltar</button>
            </div>
        </div>
    );
};

const styles = {
    energyBtn: {
        padding: '1.5rem',
        fontSize: '1.2rem',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    buttonBig: {
        padding: '1rem 3rem',
        fontSize: '1.5rem',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
    },
    buttonAction: {
        padding: '0.8rem 2rem',
        fontSize: '1rem',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    buttonSecondary: {
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        marginTop: '1rem'
    }
};

export default FocusMode;
