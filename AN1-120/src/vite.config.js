import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        outDir: './dist/',
        rollupOptions: {
            input: {
                words: resolve(__dirname, 'words.html'),
                acais: resolve(__dirname, 'acais.html')
            },
        },
    },
    base: './',
});
