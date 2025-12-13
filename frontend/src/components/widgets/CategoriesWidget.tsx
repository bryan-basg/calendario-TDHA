import React from 'react';
import { useTranslation } from 'react-i18next';
import { Category } from '../../types';

interface CategoriesWidgetProps {
    categories: Category[];
    onNavigate: (path: string) => void;
    onSelect: (category: Category) => void;
}

export const CategoriesWidget: React.FC<CategoriesWidgetProps> = ({ categories, onNavigate, onSelect }) => {
    const { t } = useTranslation();

    return (
        <div className="dashboard-list-card">
            <div className="list-header">
                <h3>{t('categories.header', 'Categorías')}</h3>
                <button className="btn-icon" onClick={() => onNavigate('/categories/new')}>+</button>
            </div>
            <div className="categories-chips">
                {categories.map(cat => (
                    <span
                        key={cat.id}
                        className="category-chip"
                        style={{ border: `1px solid ${cat.color_hex}`, color: cat.color_hex }}
                        onClick={() => onSelect(cat)}
                    >
                        {cat.name}
                    </span>
                ))}
            </div>
        </div>
    );
};
