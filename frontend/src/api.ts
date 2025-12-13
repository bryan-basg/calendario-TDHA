import toast from 'react-hot-toast';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import {
    LoginResponse,
    User,
    Task,
    Category,
    Event,
    TimelineItem,
    FocusSession,
    FocusStats,
    PushSubscriptionData
} from './types';

// Base URL for the backend API
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.startsWith('http'))
        ? `https://${import.meta.env.VITE_API_URL}`
        : (import.meta.env.VITE_API_URL || '/api'),
});

// Request interceptor to add JWT token if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle errors
api.interceptors.response.use((response) => response, (error: AxiosError | any) => {
    let message = 'Error desconocido';
    if (error.response) {
        // Server responded with a status code other than 2xx
        const status = error.response.status;
        const data = error.response.data as any;

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
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/token', new URLSearchParams({ username: email, password }));
    return response.data; // { access_token, token_type }
};

export const register = async (email: string, password: string): Promise<User> => {
    const response = await api.post<User>('/users/', { email, password });
    return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks/');
    return response.data;
};

export const getTaskStats = async (): Promise<any> => {
    const response = await api.get('/tasks/stats');
    return response.data;
};

export const getTask = async (taskId: number | string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response.data;
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
    const response = await api.post<Task>('/tasks/', task);
    return response.data;
};

export const updateTask = async (taskId: number | string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${taskId}`, updates);
    return response.data;
};

export const deleteTask = async (taskId: number | string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
};

export const completeTask = async (taskId: number | string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${taskId}/complete`);
    return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/');
    return response.data;
};

export const getCategory = async (categoryId: number | string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${categoryId}`);
    return response.data;
};

export const createCategory = async (category: Partial<Category>): Promise<Category> => {
    const response = await api.post<Category>('/categories/', category);
    return response.data;
};

export const updateCategory = async (categoryId: number | string, updates: Partial<Category>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${categoryId}`, updates);
    return response.data;
};

export const deleteCategory = async (categoryId: number | string): Promise<void> => {
    await api.delete(`/categories/${categoryId}`);
};

export const getEvents = async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events/');
    return response.data;
};

export const createEvent = async (event: Partial<Event>): Promise<Event> => {
    const response = await api.post<Event>('/events/', event);
    return response.data;
};

export const getEvent = async (eventId: number | string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${eventId}`);
    return response.data;
};

export const updateEvent = async (eventId: number | string, updates: Partial<Event>): Promise<Event> => {
    const response = await api.put<Event>(`/events/${eventId}`, updates);
    return response.data;
};

export const deleteEvent = async (eventId: number | string): Promise<void> => {
    await api.delete(`/events/${eventId}`);
};

export const getTimeline = async (start?: string, end?: string, skip: number = 0, limit: number = 1000): Promise<TimelineItem[]> => {
    // start and end should be ISO strings or Date objects
    const params: any = { skip, limit };
    if (start) params.start = start;
    if (end) params.end = end;

    const response = await api.get<TimelineItem[]>('/timeline/', { params });
    return response.data;
};

export const getNowView = async (): Promise<{ current: TimelineItem | null, next: TimelineItem | null }> => {
    const response = await api.get('/timeline/now');
    return response.data;
};

export const getTaskSuggestions = async (energyLevel: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/tasks/suggestions?energy=${energyLevel}`);
    return response.data;
};

export const subscribeToPush = async (subscription: PushSubscriptionData): Promise<any> => {
    try {
        const response = await api.post('/notifications/subscribe', subscription);
        return response.data;
    } catch (error) {
        console.error("Error subscribing to push:", error);
        return null; // Fail silently
    }
};

// Focus Mode APIs

export const startFocusSession = async (taskId: number | null = null): Promise<FocusSession> => {
    const response = await api.post<FocusSession>('/focus/start', { task_id: taskId });
    return response.data;
};

export const getCurrentFocusSession = async (): Promise<FocusSession | null> => {
    try {
        const response = await api.get<FocusSession>('/focus/current');
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null; // No active session
        }
        throw error;
    }
};

export const stopFocusSession = async (sessionId: number, feedbackScore: number | null = null, completeTask: boolean = false): Promise<FocusSession> => {
    const params: any = {};
    if (feedbackScore) params.feedback_score = feedbackScore;
    if (completeTask) params.complete_task = true;
    const response = await api.post<FocusSession>(`/focus/${sessionId}/stop`, null, { params });
    return response.data;
};

export const pauseFocusSession = async (sessionId: number): Promise<FocusSession> => {
    const response = await api.post<FocusSession>(`/focus/${sessionId}/pause`);
    return response.data;
};

export const resumeFocusSession = async (sessionId: number): Promise<FocusSession> => {
    const response = await api.post<FocusSession>(`/focus/${sessionId}/resume`);
    return response.data;
};

export const logInterruption = async (sessionId: number, note: string | null = null): Promise<FocusSession> => {
    const params: any = {};
    if (note) params.note = note;
    const response = await api.post<FocusSession>(`/focus/${sessionId}/interruption`, null, { params });
    return response.data;
};

export const getFocusStats = async (): Promise<FocusStats> => {
    const response = await api.get<FocusStats>('/focus/stats');
    return response.data;
};

export default api;
