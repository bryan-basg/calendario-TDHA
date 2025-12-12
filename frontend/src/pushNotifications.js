import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { subscribeToPush } from './api';

const isPushSupported = () => {
    const platform = Capacitor.getPlatform();
    return platform !== 'web'; // Por ahora solo soportamos nativo via Capacitor plugin, Web usa ServiceWorker APIS distintas
};

export const initPushNotifications = async () => {
    if (!isPushSupported()) {
        // console.log("Push Notifications not supported on web yet (need SW configuration).");
        return;
    }

    try {
        // 1. Request Permission
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            // console.log("User denied push notifications permissions");
            return;
        }

        // 2. Register
        await PushNotifications.register();

        // 3. Listeners
        // On success, we get the token
        PushNotifications.addListener('registration', async (token) => {
            // console.log('Push Registration Token:', token.value);

            // Enviamos al backend
            // El backend espera: { endpoint, keys, platform }
            // Para Android/iOS nativo, "keys" no son VAPID, el token es suficiente como endpoint o ID.
            // Adaptaremos el schema en backend o aquí.
            // Para FCM el token.value es el ID del dispositivo.

            const subscriptionData = {
                endpoint: token.value,
                // En nativo no hay auth/p256dh keys como en Web Push VAPID tradicionales
                // Enviaremos un dummy JSON para validar el schema
                keys: JSON.stringify({ auth: "native", p256dh: "native" }),
                platform: Capacitor.getPlatform()
            };

            await subscribeToPush(subscriptionData);
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on push registration:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            // console.log('Push received:', notification);
            // Podríamos mostrar un toast o actualizar datos
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            // console.log('Push action performed:', notification);
            // Navegar a una pantalla específica
        });

    } catch (error) {
        console.error("Error initializing push notifications:", error);
    }
};
