module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: false,
  rules: {
    // 여기에 원하는 규칙을 추가할 수 있습니다
  }
}; 