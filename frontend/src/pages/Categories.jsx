// src/pages/Categories.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategories, deleteCategory } from '../api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories', err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm(t('categories.confirm_delete_msg', "¿Seguro que quieres eliminar esta categoría?"))) return;
        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            console.error("Error al eliminar categoría", err);
            alert(t('categories.delete_error', "No se pudo eliminar la categoría"));
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="flex justify-between items-center mb-4">
                <h2>{t('categories.my_categories', "Mis Categorías")}</h2>
                <button
                    onClick={() => navigate('/categories/new')}
                    className="btn btn-primary"
                >
                    {t('categories.new_category', "+ Nueva Categoría")}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="card"
                        style={{ borderTop: `4px solid ${cat.color_hex}` }}
                    >
                        <h3 className="text-xl font-bold mb-2">{cat.name}</h3>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => navigate(`/categories/${cat.id}/edit`)}
                                className="btn btn-outline flex-1"
                            >
                                ✏ {t('common.edit', "Editar")}
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="btn btn-danger flex-1"
                            >
                                🗑 {t('common.delete', "Borrar")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <Link to="/" className="btn btn-outline">{t('categories.back_dashboard', "← Volver al Dashboard")}</Link>
            </div>
        </div>
    );
};

export default Categories;
