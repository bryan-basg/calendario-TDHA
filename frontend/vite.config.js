import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react({ jsxRuntime: 'automatic', jsxImportSource: 'react' })],
    base: './', // Importante para Electron y algunos despliegues
})
