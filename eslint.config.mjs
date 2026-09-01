import js from '@eslint/js'

export default [
  {
    ignores: ['coverage/**', 'docs-site/dist/**', 'node_modules/**', 'release-candidate/**']
  },
  js.configs.recommended,
  {
    files: ['index.js', 'lib/**/*.js', 'scripts/**/*.cjs', 'test/**/*.cjs', 'examples/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        Buffer: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly'
      }
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly'
      }
    }
  },
  {
    files: ['docs-site/app.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly'
      }
    }
  }
]
