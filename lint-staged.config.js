const path = require('node:path');

module.exports = {
  'apps/web/**/*.{js,ts,jsx,tsx,mjs,cjs}': (filenames) => {
    if (filenames.length === 0) return [];
    const webRoot = path.join(__dirname, 'apps', 'web');
    const relativePaths = filenames.map((f) => path.relative(webRoot, f));
    return [`cd apps/web && npx eslint --fix ${relativePaths.map((p) => `"${p}"`).join(' ')}`];
  },
  '**/*.ts?(x)': () => 'npm run check-types',
};
