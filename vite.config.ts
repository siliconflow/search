import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: './client',
  build: {
    outDir: path.resolve(__dirname, 'dist/client'),
    emptyOutDir: true,
    rollupOptions: {
      input: './client/index.html'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src')
    }
  }
});
