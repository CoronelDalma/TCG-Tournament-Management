/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
//import path from 'node:path';
//import { fileURLToPath } from 'node:url';
//import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
//import { playwright } from '@vitest/browser-playwright';
//const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  // test: {
  //   projects: [{
  //     extends: true,
  //     plugins: [
  //     // The plugin will run tests for the stories defined in your Storybook config
  //     // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
  //     storybookTest({
  //       configDir: path.join(dirname, '.storybook')
  //     })],
  //     test: {
  //       name: 'storybook',
  //       browser: {
  //         enabled: true,
  //         headless: true,
  //         provider: playwright({}),
  //         instances: [{
  //           browser: 'chromium'
  //         }]
  //       },
  //       setupFiles: ['.storybook/vitest.setup.ts']
  //     }
  //   }]
  // }
    // --- Configuración clave para el proxy ---
  server: {
    // Al detectarse un prefijo "/api" en una solicitud XHR, 
    // Vite la reenviará al puerto 3000.
    proxy: {
      // Proxy para todas las solicitudes que empiezan con '/api'
      // Esto incluye tu ruta: '/api/auth/register'
      '/api': {
        // El objetivo es tu servidor de backend
        target: 'http://localhost:3000',
        
        // Esto es necesario si el backend es un servidor independiente.
        changeOrigin: true,

        // Opcional: para reescribir la URL si es necesario, 
        // pero en este caso es 1:1, por lo que lo dejamos vacío.
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
});