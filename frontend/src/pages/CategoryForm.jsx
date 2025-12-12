// src/pages/CategoryForm.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createCategory, updateCategory, getCategory } from '../api';

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [color, setColor] = useState('#50C878'); // Emerald green default
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEdit) {
            const fetchCat = async () => {
                try {
                    const data = await getCategory(id);
                    setName(data.name);
                    setColor(data.color_hex || '#50C878');
                } catch (err) {
                    console.error('Error loading category', err);
                    setError(t('categories.save_error', 'No se pudo cargar la categoría'));
                }
            };
            fetchCat();
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isEdit) {
                await updateCategory(id, { name, color_hex: color });
                toast.success(t('categories.updated_success', 'Categoría actualizada correctamente'));
            } else {
                await createCategory({ name, color_hex: color });
                toast.success(t('categories.created_success', 'Categoría creada correctamente'));
            }
            navigate('/categories');
        } catch (err) {
            console.error('Error saving category', err);
            // Error toast handled by api interceptor
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2>{isEdit ? t('categories.edit_title', 'Editar Categoría') : t('categories.create_title', 'Crear Nueva Categoría')}</h2>
            {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>{t('categories.name_label', 'Nombre de la Categoría:')}</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="off"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={t('categories.placeholder', 'Ej. Trabajo, Universidad, Salud')}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div>
                    <label htmlFor="color" style={{ display: 'block', marginBottom: '0.5rem' }}>{t('categories.color_label', 'Color Identificativo:')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="color"
                            id="color"
                            name="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{ height: '40px', width: '80px', cursor: 'pointer' }}
                        />
                        <span style={{ color: '#666' }}>{color}</span>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {isEdit ? t('categories.update_btn', 'Actualizar') : t('categories.save_btn', 'Guardar Categoría')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/categories')}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {t('common.cancel', 'Cancelar')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
