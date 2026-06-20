import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text-summary'],
      reportsDirectory: './coverage',
      include: [
        'src/validation.js',
        'src/storage.js',
      ],
      exclude: [
        'src/main.js',
      ],
      all: true,
    },
  },
})
