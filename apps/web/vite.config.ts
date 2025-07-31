import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '../../config/apps/web'),
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '#*': path.resolve(__dirname, './src'),
      '#backend/*': path.resolve(__dirname, '../api/src/*'),

      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        '@onlyjs/api',
        'elysia',
        /^@elysiajs\/(?!eden$).*/, // @elysiajs/* (except eden)
        /^#?@?.*prisma/, // Prisma variants
        /^#backend\/.*/, // Backend imports
      ],
    },
  },
});
