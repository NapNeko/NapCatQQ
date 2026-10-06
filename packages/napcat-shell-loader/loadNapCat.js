const path = require('path');
const { pathToFileURL } = require('url');
const mainPath = process.env.NAPCAT_MAIN_PATH || path.join(__dirname, 'napcat.mjs');
(async () => {
  await import(pathToFileURL(mainPath).href);
})();
