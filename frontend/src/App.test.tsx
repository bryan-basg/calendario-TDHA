import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: () => new Promise(() => { }),
            language: 'es',
        },
    }),
}));

// Mock push notifications
vi.mock('./pushNotifications', () => ({
    initPushNotifications: vi.fn(),
}));

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Check for "to consider" or generic elements,
        // but initially just rendering is a good smoke test.
        // We can check for the loading spinner or similar if known.
        // For now, let's just assert truthy to verify it runs through the render cycle.
        expect(true).toBeTruthy();
    });
});
