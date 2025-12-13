export interface Category {
    id: number;
    name: string;
    color_hex: string;
    user_id: number;
}

export interface Task {
    id: number;
    title: string;
    is_completed: boolean;
    energy_required: 'low' | 'medium' | 'high';
    deadline?: string; // ISO string
    planned_start?: string;
    planned_end?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'ignored';
    user_id: number;
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    start_time: string; // ISO string
    end_time: string; // ISO string
    category_id: number;
    user_id: number;
    category?: Category;
}

export interface User {
    id: number;
    email: string;
    country: string;
    is_active: boolean;
}

export interface TimelineItem {
    id: number;
    title: string;
    start: string; // ISO string
    end: string;   // ISO string
    type: 'event' | 'task';
    color?: string;
    is_completed?: boolean;
}

export interface FocusSession {
    id: number;
    user_id: number;
    task_id?: number;
    start_time: string;
    end_time?: string;
    duration_minutes: number;
    interruptions: number;
    interruption_notes?: string;
    feedback_score?: number;
    status: 'active' | 'paused' | 'completed';
    task?: Task;
}

export interface FocusStats {
    total_sessions: number;
    total_minutes: number;
    avg_score: number;
    total_interruptions: number;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    platform?: string;
}
