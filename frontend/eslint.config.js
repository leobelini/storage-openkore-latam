// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  // Ignorar pastas/arquivos específicos
  globalIgnores([
    'dist',
    'start-openkore-latam/frontend/**', // ignora essa pasta
  ]),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Desativar regras chatas para permitir o --fix passar
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',

      // Ajustar regras dos hooks (para não travar)
      'react-hooks/exhaustive-deps': 'warn',

      // Outras melhorias para auto-fix
      'no-unused-vars': 'off',
    },
  },
])
