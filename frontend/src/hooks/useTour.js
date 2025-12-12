import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useTour = ({ onOpenSidebar } = {}) => {
    const driverObj = driver({
        showProgress: true,
        animate: true,
        steps: [
            {
                popover: {
                    title: '👋 Bienvenido a tu Calendario TDHA',
                    description: 'Esta guía te mostrará cómo sacar el máximo provecho de tu aplicación.'
                }
            },
            {
                element: '.dashboard-main',
                popover: {
                    title: '📅 Tu Calendario',
                    description: 'Aquí verás todos tus eventos y tareas. Toca cualquier fecha para añadir algo nuevo rápidamente.',
                    side: "top",
                    align: 'center'
                }
            },
            {
                element: '.global-fab',
                popover: {
                    title: '☰ Menú Principal',
                    description: 'Este botón abre el menú lateral. ¡Vamos a abrirlo para ver más opciones!',
                    side: "left",
                    align: 'center'
                }
            },
            {
                element: '.nav-section',
                popover: {
                    title: '🧭 Navegación',
                    description: 'Desde aquí puedes ir a tus Tareas, Eventos, Categorías y Configuración.',
                    side: "right"
                }
            },
            {
                element: '.energy-widget',
                popover: {
                    title: '🔋 Widget de Energía',
                    description: 'Registra tu nivel de energía aquí. Esto te ayudará a elegir tareas adecuadas para tu estado actual.',
                    side: "right"
                }
            }
        ],
        onNextClick: (element, step, { config, state }) => {
            // Check if we are on the step targeting .global-fab (index 2)
            // Note: Steps are 0-indexed in array.
            const stepIndex = config.steps.indexOf(step);

            if (stepIndex === 2) {
                // We are at FAB, moving to Sidebar internals
                if (onOpenSidebar) {
                    onOpenSidebar();
                    // Wait for animation
                    setTimeout(() => {
                        driverObj.moveNext();
                    }, 400);
                    return; // Prevent default moveNext
                }
            }

            driverObj.moveNext();
        }
    });

    return { startTour: () => driverObj.drive() };
};
