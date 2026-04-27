import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

function copyHtmlFiles() {
  try {
    mkdirSync('out/renderer', { recursive: true })
    if (existsSync('src/widget.html')) {
      copyFileSync('src/widget.html', 'out/renderer/widget.html')
    }
    if (existsSync('src/audio-capture.html')) {
      copyFileSync('src/audio-capture.html', 'out/renderer/audio-capture.html')
    }
  } catch (e) {
    console.warn('html copy failed:', e)
  }
}

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ['electron-store', 'dayjs'] }),
      {
        name: 'copy-html',
        buildStart() { copyHtmlFiles() },
        closeBundle() { copyHtmlFiles() }
      }
    ],
    build: {
      outDir: 'out/main',
      lib: {
        entry: resolve(__dirname, 'electron/main.ts')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'electron/preload.ts'),
          'widget-preload': resolve(__dirname, 'electron/widget-preload.ts'),
          'audio-capture-preload': resolve(__dirname, 'electron/audio-capture-preload.ts')
        }
      }
    }
  },
  renderer: {
    plugins: [
      react(),
      {
        name: 'copy-html-renderer',
        buildStart() { copyHtmlFiles() },
        closeBundle() { copyHtmlFiles() }
      }
    ],
    root: '.',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    }
  }
})
