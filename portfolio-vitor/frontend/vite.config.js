import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // O build vai direto para a pasta que o Spring Boot serve como site estático.
  build: { outDir: '../target/classes/static', emptyOutDir: true },
  // Só para `npm run dev` (opcional): repassa /api para o Spring Boot.
  server: { proxy: { '/api': 'http://localhost:8080' } },
});
