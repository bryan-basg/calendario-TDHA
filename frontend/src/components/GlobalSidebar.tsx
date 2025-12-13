// src/components/GlobalSidebar.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../api';
import EnergyWidget from './EnergyWidget';
import { useTour } from '../hooks/useTour';
import './GlobalSidebar.css';
import { Category } from '../types';

const GlobalSidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { startTour } = useTour({ onOpenSidebar: () => setIsOpen(true) });

    // Toggle drawer
    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    // Logout logic
    const handleLogout = () => {
        if (window.confirm(t('navbar.confirm_logout', '¿Cerrar sesión?'))) {
            localStorage.removeItem('access_token');
            navigate('/login');
        }
    };

    // Language Toggle
    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    // Load Categories on mount (for widget display)
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                console.error("Error loading categories for sidebar:", err);
            }
        };
        // Only fetch if authenticated (simple check: if token exists)
        if (localStorage.getItem('access_token')) {
            fetchCats();
        }
    }, [isOpen]);

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);


    return (
        <>
            {/* FAB Trigger */}
            <button
                className="global-fab"
                onClick={toggleSidebar}
                title={isOpen ? t('common.close', "Cerrar menú") : t('common.open', "Abrir menú")}
                style={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? 'none' : 'auto' }}
            >
                ☰
            </button>

            {/* Backdrop */}
            {isOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}

            {/* Drawer */}
            <div className={`global-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-title">{t('sidebar.title', 'Mi Agenda')}</h2>
                    <button className="close-btn" onClick={closeSidebar}>✕</button>
                </div>

                <div className="sidebar-content">
                    {/* Navigation */}
                    <nav className="nav-section">
                        <NavLink to="/" className="nav-item">
                            <span className="nav-icon">🏠</span> {t('navbar.dashboard', 'Dashboard')}
                        </NavLink>
                        <NavLink to="/tasks" className="nav-item">
                            <span className="nav-icon">📝</span> {t('navbar.tasks', 'Tareas')}
                        </NavLink>
                        <NavLink to="/events" className="nav-item">
                            <span className="nav-icon">📅</span> {t('navbar.events', 'Eventos')}
                        </NavLink>
                        <NavLink to="/categories" className="nav-item">
                            <span className="nav-icon">🏷️</span> {t('navbar.categories', 'Categorías')}
                        </NavLink>
                        <NavLink to="/focus" className="nav-item">
                            <span className="nav-icon">🎯</span> {t('navbar.focus', 'Focus Mode')}
                        </NavLink>
                        <NavLink to="/settings" className="nav-item">
                            <span className="nav-icon">⚙️</span> {t('navbar.settings', 'Configuración')}
                        </NavLink>
                    </nav>

                    <hr style={{ border: '0', borderTop: '1px solid var(--neutral-200)' }} />

                    {/* Widgets */}
                    <div className="widget-section">
                        <div className="widget-section-title">{t('sidebar.energy', 'Energía')}</div>
                        <EnergyWidget />
                    </div>

                    <div className="widget-section">
                        <div className="widget-section-title">{t('sidebar.quick_categories', 'Categorías Rápidas')}</div>
                        <div className="nav-section">
                            {categories.slice(0, 5).map(cat => (
                                <div key={cat.id} className="mini-category">
                                    <div
                                        className="category-dot"
                                        style={{ backgroundColor: cat.color_hex }}
                                    ></div>
                                    {cat.name}
                                </div>
                            ))}
                            <button
                                onClick={() => navigate('/categories')}
                                className="btn-small"
                                style={{ textAlign: 'left', paddingLeft: '0.5rem', color: 'var(--primary-600)' }}
                            >
                                + {t('common.view_all', 'Ver todas')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <button className="btn nav-item" onClick={toggleLanguage} style={{ flex: 1, justifyContent: 'center', background: 'var(--neutral-100)' }}>
                            <span className="nav-icon">🌐</span> {i18n.language === 'es' ? 'English' : 'Español'}
                        </button>
                    </div>
                    <button className="btn nav-item" onClick={() => { closeSidebar(); startTour(); }} style={{ marginBottom: '0.5rem', justifyContent: 'flex-start', color: 'var(--primary-700)' }}>
                        <span className="nav-icon">❓</span> {t('sidebar.help', 'Guía Interactiva')}
                    </button>
                    <button className="btn btn-logout nav-item" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span> {t('navbar.logout', 'Cerrar Sesión')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default GlobalSidebar;
