import React from 'react';
import { useTranslation } from 'react-i18next';
import './DetailsModal.css';

const DetailsModal = ({ isOpen, onClose, item, onEdit, onDelete }) => {
    const { t, i18n } = useTranslation();

    if (!isOpen || !item) return null;

    const isTask = item.type === 'task';
    const isEvent = item.type === 'event';

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString(i18n.language, {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderTop: `5px solid ${item.color || '#3174ad'}` }}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <h2 className="modal-title">{item.title}</h2>

                <div className="modal-body">
                    <div className="modal-info-row">
                        <span className="modal-label">{t('common.date', 'Fecha')}:</span>
                        <span className="modal-value">
                            {isTask ? formatDate(item.planned_start) : `${formatDate(item.start)} - ${formatDate(item.end)}`}
                        </span>
                    </div>

                    {item.description && (
                        <div className="modal-info-row">
                            <span className="modal-label">{t('common.description', 'Descripción')}:</span>
                            <p className="modal-description">{item.description}</p>
                        </div>
                    )}

                    {isTask && (
                        <div className="modal-info-row">
                            <span className="modal-label">{t('common.status', 'Estado')}:</span>
                            <span className={`status-badge ${item.is_completed ? 'completed' : 'pending'}`}>
                                {item.is_completed ? t('tasks.completed', 'Completada') : t('tasks.pending', 'Pendiente')}
                            </span>
                        </div>
                    )}

                    {item.category && (
                        <div className="modal-info-row">
                            <span className="modal-label">{t('common.category', 'Categoría')}:</span>
                            <span className="category-badge" style={{ backgroundColor: item.color }}>
                                {item.category.name || item.resource?.category_name || 'General'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={() => onEdit(item)}>
                        {t('common.edit', 'Editar')}
                    </button>
                    <button className="btn btn-danger" onClick={() => onDelete(item)}>
                        {t('common.delete', 'Eliminar')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;
