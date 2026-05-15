import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: true, // Exposes the dev server to your local network
  },
  preview: {
    host: true, // Exposes the preview server to your local network
  },
  build: {
    // Output the minified bundle to a 'dist' folder
    outDir: 'dist',
    emptyOutDir: true, // Clean the dist folder before every build
  },
  optimizeDeps: {
    include: ['rlo-engine']
  }
});