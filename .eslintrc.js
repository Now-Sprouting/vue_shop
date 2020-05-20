module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'eol-last': 0,
    'object-curly-spacing': 0,
    'no-trailing-spaces': 0,
    'space-before-function-paren': 0,
    'space-before-blocks': 0,
    'keyword-spacing': 0,
    'key-spacing': 0,
    'spaced-comment': 0,
    'quote-props': 0,
    'no-multiple-empty-lines': 0
  }
}
