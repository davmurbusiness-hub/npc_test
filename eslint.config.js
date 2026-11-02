import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const TS = ['src/**/*.ts', 'src/**/*.tsx'];

const BOUNDARY_ELEMENTS = [
  { type: 'config', pattern: 'src/config', partialMatch: false },
  { type: 'component', pattern: 'src/app/components/*', partialMatch: false },
  { type: 'component', pattern: 'src/app/components', partialMatch: false },
  { type: 'hook-ui', pattern: 'src/app/hooks/ui', partialMatch: false },
  { type: 'hook', pattern: 'src/app/hooks', partialMatch: false },
  { type: 'local-store', pattern: 'src/app/stores/LocalStore', partialMatch: false },
  { type: 'store', pattern: 'src/app/stores', partialMatch: false },
  { type: 'util', pattern: 'src/app/utils', partialMatch: false },
  { type: 'type', pattern: 'src/app/types', partialMatch: false },
  { type: 'data', pattern: 'src/app/data', partialMatch: false },
  { type: 'api', pattern: 'src/app/api', partialMatch: false },
  { type: 'app', pattern: 'src/app', partialMatch: false },
];

if (BOUNDARY_ELEMENTS.at(-1)?.type !== 'app') {
  throw new Error(
    'boundaries: элемент `app` обязан быть последним в BOUNDARY_ELEMENTS, ' +
      'иначе шаблон `src/app` поглощает вложенные слои и проверка границ молча выключается.'
  );
}

if (
  BOUNDARY_ELEMENTS.findIndex((e) => e.type === 'hook-ui') >
  BOUNDARY_ELEMENTS.findIndex((e) => e.type === 'hook')
) {
  throw new Error(
    'boundaries: `hook-ui` обязан идти раньше `hook`, иначе `hooks/ui` станет `hooks`.'
  );
}

if (
  BOUNDARY_ELEMENTS.findIndex((e) => e.type === 'local-store') >
  BOUNDARY_ELEMENTS.findIndex((e) => e.type === 'store')
) {
  throw new Error(
    'boundaries: `local-store` обязан идти раньше `store`, иначе `stores/LocalStore` станет `stores`.'
  );
}

const TS_RESOLVER = {
  typescript: {
    alwaysTryTypes: true,
    noWarnOnMultipleProjects: true,
    project: ['./tsconfig.app.json', './tsconfig.node.json'],
  },
};

const allowFrom = (type, allowedTypes) => ({
  from: { element: { type } },
  allow: { to: { element: { types: { anyOf: allowedTypes } } } },
});

const BOUNDARY_POLICIES = [
  { allow: { to: { module: { origin: 'external' } } } },

  allowFrom('app', [
    'config',
    'component',
    'hook-ui',
    'hook',
    'store',
    'local-store',
    'api',
    'util',
    'type',
  ]),
  allowFrom('component', ['component', 'hook-ui', 'util', 'type']),
  allowFrom('hook', ['hook', 'hook-ui', 'store', 'util', 'type']),
  allowFrom('hook-ui', ['hook-ui', 'util', 'type']),
  allowFrom('store', ['store', 'util', 'type']),
  allowFrom('local-store', ['store', 'api', 'util', 'type']),
  allowFrom('api', ['api', 'data', 'util', 'type']),
  allowFrom('data', ['data', 'util', 'type']),
  allowFrom('util', ['util', 'type']),
  allowFrom('type', ['type']),
  allowFrom('config', ['config']),
];

const DEEP_IMPORT_PATTERNS = [
  {
    group: ['components/*/*', 'hooks/ui/*'],
    message: 'Папка импортируется через свой index.ts.',
  },
];

const RESTRICTED_SYNTAX = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'Внешний текст рисуем как текст, а не как HTML.',
  },
];

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules', '**/*.cjs', '**/*.d.ts'],
  },

  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  prettierConfig,

  {
    files: TS,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { prettier, boundaries, 'import-x': importX },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/ignore': ['src/app/main.tsx', 'src/**/*.test.*', 'src/**/*.spec.*'],
      'boundaries/elements': BOUNDARY_ELEMENTS,
      'import-x/resolver': TS_RESOLVER,
      'import/resolver': TS_RESOLVER,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'error',
      'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX],
      'no-restricted-imports': ['error', { patterns: DEEP_IMPORT_PATTERNS }],

      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'error',
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [
            {
              pattern: '{api,components,data,hooks,stores,styles,types,utils}{,/**}',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message: '`{{from.type}}` не может импортировать `{{to.type}}` — см. BOUNDARY_POLICIES',
          policies: BOUNDARY_POLICIES,
        },
      ],
    },
  },

  {
    files: ['*.config.js', '*.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off',
    },
  }
);
