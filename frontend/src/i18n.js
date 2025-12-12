import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';

// We can import resources directly for a simple setup,
// or use the Backend plugin to load them from /public/locales
// For this app, importing directly is often easier to bundle standard translations.
// However, the standard way with Backend is creating json files in public/locales.
// Given the initial plan used 'src/locales', I will bundle them to avoid async loading issues on first render if not configured carefully.

const resources = {
    en: {
        translation: translationEN
    },
    es: {
        translation: translationES
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es',
        debug: true,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
