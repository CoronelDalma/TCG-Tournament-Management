import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true, 
        
        // **Verificar que esté presente:** Habilita el entorno DOM
        environment: 'jsdom', 
        
        // **Verificar que esté presente:** Carga los matchers de RTL
        setupFiles: './src/setupTests.ts', 
        
        clearMocks: true, 
    },
});