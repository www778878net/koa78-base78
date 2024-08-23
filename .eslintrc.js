module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // 使用 TypeScript 插件的推荐配置
  ],
  parser: '@typescript-eslint/parser', // 使用 TypeScript 解析器
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // 指定 TypeScript 配置文件
  },
  plugins: [
    '@typescript-eslint', // 使用 TypeScript 插件
  ],
  rules: {
    // 这里可以添加或覆盖规则
    // 例如：'@typescript-eslint/no-var-requires': 'off'
  },
};