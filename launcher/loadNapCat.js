const path = require('path');
const CurrentPath = path.dirname(__filename);
(async () => {
    await import("file://" + path.join(CurrentPath, './napcat/napcat.mjs'));
})();