import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the futsal session visualizer. The `base` option
// ensures that assets are resolved correctly when the site is served from
// GitHub Pages under a repository named "futsal-visualizer". If you deploy
// this project under a different repository name you can update the base
// accordingly.
export default defineConfig({
  plugins: [react()],
  base: '/futsal-visualizer/'
});
