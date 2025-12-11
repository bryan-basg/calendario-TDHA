// src/api.js
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

export const getTimeline = async (start, end) => {
    // start and end should be ISO strings or Date objects
    const params = {};
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

export default api;
