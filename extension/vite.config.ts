import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const publicDir = path.resolve(__dirname, 'public');

        // Copy manifest.json
        copyFileSync(
          path.join(publicDir, 'manifest.json'),
          path.join(distDir, 'manifest.json')
        );

        // Copy background.js
        copyFileSync(
          path.join(publicDir, 'background.js'),
          path.join(distDir, 'background.js')
        );

        // Create icons directory and placeholder icons
        const iconsDir = path.join(distDir, 'icons');
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true });
        }

        // Create simple SVG icons as placeholders
        const iconSizes = [16, 32, 48, 128];
        const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>`;

        iconSizes.forEach(size => {
          const svg = svgIcon.replace('viewBox="0 0 24 24"', `viewBox="0 0 24 24" width="${size}" height="${size}"`);
          // We'll just copy a simple placeholder - in production you'd use sharp or similar
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    port: 3000,
  },
});