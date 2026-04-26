import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

function copyWidget() {
  try {
    mkdirSync('out/renderer', { recursive: true })
    if (existsSync('src/widget.html')) {
      copyFileSync('src/widget.html', 'out/renderer/widget.html')
    }
  } catch (e) {
    console.warn('widget copy failed:', e)
  }
}

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ['electron-store', 'dayjs'] }),
      {
        name: 'copy-widget-html',
        buildStart() { copyWidget() },
        closeBundle() { copyWidget() }
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
          'widget-preload': resolve(__dirname, 'electron/widget-preload.ts')
        }
      }
    }
  },
  renderer: {
    plugins: [
      react(),
      {
        name: 'copy-widget-html-renderer',
        buildStart() { copyWidget() },
        closeBundle() { copyWidget() }
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
