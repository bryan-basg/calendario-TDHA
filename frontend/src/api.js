// src/api.js
import toast from 'react-hot-toast';
import axios from 'axios';

// Base URL for the backend API
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

// Request interceptor to add JWT token if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle errors
api.interceptors.response.use((response) => response, (error) => {
    let message = 'Error desconocido';
    if (error.response) {
        // Server responded with a status code other than 2xx
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
            // handled below
        } else if (status === 403) {
            message = 'No tienes permiso para realizar esta acción.';
            toast.error(message);
        } else if (status >= 500) {
            message = 'Error del servidor. Por favor, intenta más tarde.';
            toast.error(message);
        } else {
            // Try to extract detail
            message = data.detail || 'Error en la solicitud.';
            if (typeof message === 'object') message = JSON.stringify(message);
            toast.error(message);
        }

        if (status === 401) {
            localStorage.removeItem('access_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    } else if (error.request) {
        // Request made but no response
        message = 'Error de conexión. Verifica tu internet.';
        toast.error(message);
    } else {
        message = error.message;
        toast.error(message);
    }
    return Promise.reject(error);
});

// Exported API functions
export const login = async (email, password) => {
    const response = await api.post('/token', new URLSearchParams({ username: email, password }));
    return response.data; // { access_token, token_type }
};

export const register = async (email, password) => {
    const response = await api.post('/users/', { email, password });
    return response.data;
};

export const getTasks = async () => {
    const response = await api.get('/tasks/');
    return response.data;
};

export const getTaskStats = async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
};

export const getTask = async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
};

export const createTask = async (task) => {
    const response = await api.post('/tasks/', task);
    return response.data;
};

export const updateTask = async (taskId, updates) => {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
};

export const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
};

export const completeTask = async (taskId) => {
    const response = await api.patch(`/tasks/${taskId}/complete`);
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/categories/');
    return response.data;
};

export const getCategory = async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`); // Backend endpoint needs to support this if strictly necessary, or we can find from list. But detailed GET is better practice. Wait, backend DOES have get_category internal function but router only exposed list.
    // Actually, looking at router `routers/categories.py`, I only added PUT and DELETE. I did NOT add GET /{id}.
    // I need to add GET /{id} to backend first if I want to use it here.
    // OR I can pass the category object via React Router state (simpler).
    // Let's stick to adding GET /{id} to backend for completeness.
    return response.data;
};

export const createCategory = async (category) => {
    const response = await api.post('/categories/', category);
    return response.data;
};

export const updateCategory = async (categoryId, updates) => {
    const response = await api.put(`/categories/${categoryId}`, updates);
    return response.data;
};

export const deleteCategory = async (categoryId) => {
    await api.delete(`/categories/${categoryId}`);
};

export const getEvents = async () => {
    const response = await api.get('/events/');
    return response.data;
};

export const createEvent = async (event) => {
    const response = await api.post('/events/', event);
    return response.data;
};

export const getEvent = async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
};

export const updateEvent = async (eventId, updates) => {
    const response = await api.put(`/events/${eventId}`, updates);
    return response.data;
};

export const deleteEvent = async (eventId) => {
    await api.delete(`/events/${eventId}`);
};

export const getTimeline = async (start, end, skip = 0, limit = 1000) => {
    // start and end should be ISO strings or Date objects
    const params = { skip, limit };
    if (start) params.start = start;
    if (end) params.end = end;

    const response = await api.get('/timeline/', { params });
    return response.data;
};

export const getNowView = async () => {
    const response = await api.get('/timeline/now');
    return response.data;
};

export const getTaskSuggestions = async (energyLevel) => {
    const response = await api.get(`/tasks/suggestions?energy=${energyLevel}`);
    return response.data;
};

export const subscribeToPush = async (subscription) => {
    try {
        const response = await api.post('/notifications/subscribe', subscription);
        return response.data;
    } catch (error) {
        console.error("Error subscribing to push:", error);
        return null; // Fail silently
    }
};

// Focus Mode APIs

export const startFocusSession = async (taskId = null) => {
    const response = await api.post('/focus/start', { task_id: taskId });
    return response.data;
};

export const getCurrentFocusSession = async () => {
    try {
        const response = await api.get('/focus/current');
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null; // No active session
        }
        throw error;
    }
};

export const stopFocusSession = async (sessionId, feedbackScore = null, completeTask = false) => {
    const params = {};
    if (feedbackScore) params.feedback_score = feedbackScore;
    if (completeTask) params.complete_task = true;
    const response = await api.post(`/focus/${sessionId}/stop`, null, { params });
    return response.data;
};

export const pauseFocusSession = async (sessionId) => {
    const response = await api.post(`/focus/${sessionId}/pause`);
    return response.data;
};

export const resumeFocusSession = async (sessionId) => {
    const response = await api.post(`/focus/${sessionId}/resume`);
    return response.data;
};

export const logInterruption = async (sessionId, note = null) => {
    const params = {};
    if (note) params.note = note;
    const response = await api.post(`/focus/${sessionId}/interruption`, null, { params });
    return response.data;
};

export const getFocusStats = async () => {
    const response = await api.get('/focus/stats');
    return response.data;
};

export default api;
