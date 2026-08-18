module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'indent': 'off',
    // "trailing-comma": 'off',
    indent: ['error', 2],
    'vue/require-v-for-key': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    'vue/multi-word-component-names': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-inferrable-types': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'vue/no-reserved-component-names': 0,
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  globals: {
    defineEmits: "readonly",
    defineProps: "readonly",
  }
}
