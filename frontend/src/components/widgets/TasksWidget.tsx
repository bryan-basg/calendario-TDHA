import React from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '../../types';

interface TasksWidgetProps {
    tasks: Task[];
    onNavigate: (path: string) => void;
    onSelect: (task: Task) => void;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks, onNavigate, onSelect }) => {
    const { t } = useTranslation();

    return (
        <div className="dashboard-list-card">
            <div className="list-header">
                <h3>{t('tasks.header', 'Tareas')}</h3>
                <button className="btn-icon" onClick={() => onNavigate('/tasks/new')}>+</button>
            </div>
            <ul className="mini-list">
                {tasks.slice(0, 5).map(task => (
                    <li key={task.id} onClick={() => onSelect(task)}>
                        <span className={`status-dot ${task.is_completed ? 'completed' : 'pending'}`}></span>
                        <span className="list-item-title">{task.title}</span>
                    </li>
                ))}
                {tasks.length === 0 && <li className="empty-msg">{t('tasks.empty', 'Sin tareas')}</li>}
            </ul>
            <button className="btn-text" onClick={() => onNavigate('/tasks')}>{t('common.see_all', 'Ver todas')}</button>
        </div>
    );
};
