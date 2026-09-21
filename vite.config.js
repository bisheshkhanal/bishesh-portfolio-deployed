import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

function copyPublicDirManually() {
  return {
    name: 'copy-public-dir-manually',
    apply: 'build',
    closeBundle() {
      const publicDir = path.resolve('public');
      const distDir = path.resolve('dist');

      if (!fs.existsSync(publicDir)) return;

      const copyEntry = (sourcePath, destPath) => {
        const stats = fs.statSync(sourcePath);

        if (stats.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          for (const entry of fs.readdirSync(sourcePath)) {
            copyEntry(path.join(sourcePath, entry), path.join(destPath, entry));
          }
          return;
        }

        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, fs.readFileSync(sourcePath));
      };

      for (const entry of fs.readdirSync(publicDir)) {
        copyEntry(path.join(publicDir, entry), path.join(distDir, entry));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), glsl(), copyPublicDirManually()],
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.js'],
    pool: 'vmThreads',
  },
  build: {
    outDir: 'dist',
    copyPublicDir: false,
  },
});
