const TOKEN_ONLY = 'только через переменную из app/styles/tokens.css';

const LENGTH_LITERAL = '/(^|[\\s(,-])(\\d*\\.)?\\d+(px|rem|em)\\b/';

export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-css-modules'],
  ignoreFiles: ['dist/**', 'coverage/**', 'node_modules/**'],
  rules: {
    'declaration-no-important': true,

    'declaration-property-value-disallowed-list': [
      {
        '/.*/': ['/#[0-9a-fA-F]{3,8}\\b/', '/\\b(rgba?|hsla?|oklch|color-mix)\\(/'],
        '/^(margin|padding|gap|row-gap|column-gap|inset)/': [LENGTH_LITERAL],
        '/radius$/': [LENGTH_LITERAL],
        '/^font(-size|-family)?$/': [LENGTH_LITERAL, '/^(?!var\\(|inherit|unset).+/'],
      },
      { message: (property) => `${property}: значение ${TOKEN_ONLY}` },
    ],

    'media-feature-name-disallowed-list': [
      ['/width$/'],
      { message: 'Брейкпоинт — только `@include breakpoints.…`' },
    ],

    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',
      {
        message: 'Класс в CSS-модуле пишется camelCase',
        resolveNestedSelectors: true,
      },
    ],
  },
  overrides: [
    {
      files: ['src/app/styles/tokens.css'],
      rules: { 'declaration-property-value-disallowed-list': null },
    },
    {
      files: ['src/app/styles/breakpoints.scss'],
      rules: { 'media-feature-name-disallowed-list': null },
    },
    {
      files: ['src/app/styles/*.css'],
      rules: { 'selector-class-pattern': null },
    },
    {
      files: ['src/app/styles/index.css'],
      rules: { 'declaration-no-important': null },
    },
  ],
};
