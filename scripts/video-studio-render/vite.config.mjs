import {defineConfig} from 'vite';
import plugin from '@motion-canvas/vite-plugin';
export default defineConfig({plugins: [plugin.default({project: './project.ts'})], server: {host: '127.0.0.1', port: 0}});
