const SHARED = require('../shared');

function show_version() {
  console.log(SHARED.PACKAGE.version);
  return 0;
}

module.exports = show_version;
