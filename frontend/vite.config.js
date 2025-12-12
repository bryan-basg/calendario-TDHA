import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react({ jsxRuntime: 'automatic', jsxImportSource: 'react' })],
    base: './', // Importante para Electron y algunos despliegues
    server: {
        host: '127.0.0.1', // Usar 127.0.0.1 en lugar de localhost para coincidir con el backend
        port: 5173,
        strictPort: true,
    }
})
