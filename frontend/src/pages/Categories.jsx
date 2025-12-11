// src/pages/Categories.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory } from '../api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

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
        if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;
        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            console.error("Error al eliminar categoría", err);
            alert("No se pudo eliminar la categoría");
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Mis Categorías</h2>
                <button
                    onClick={() => navigate('/categories/new')}
                    style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    + Nueva Categoría
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        style={{
                            padding: '1.5rem',
                            border: `2px solid ${cat.color_hex}`,
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            position: 'relative'
                        }}
                    >
                        <div style={{ width: '100%', height: '20px', backgroundColor: cat.color_hex, marginBottom: '0.5rem', borderRadius: '4px' }}></div>
                        <h3 style={{ margin: '0 0 1rem 0' }}>{cat.name}</h3>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => navigate(`/categories/${cat.id}/edit`)}
                                style={{ flex: 1, padding: '0.25rem', cursor: 'pointer', backgroundColor: '#eee', border: 'none', borderRadius: '4px' }}
                            >
                                ✏ Editar
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                style={{ flex: 1, padding: '0.25rem', cursor: 'pointer', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '4px' }}
                            >
                                🗑 Borrar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem' }}>
                <Link to="/">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default Categories;
