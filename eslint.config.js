export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      "node_modules/**",
      ".next/**", 
      "app/**",  // Temporarily ignore all app directory files
      "test.tsx"
    ],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {}
  }
]; 