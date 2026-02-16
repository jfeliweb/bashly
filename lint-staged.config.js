module.exports = {
  'apps/web/**/*.{js,ts,jsx,tsx,mjs,cjs}': (filenames) =>
    filenames.length > 0
      ? [`eslint --config apps/web/eslint.config.mjs --fix ${filenames.join(' ')}`]
      : [],
  '**/*.ts?(x)': () => 'npm run check-types',
};
