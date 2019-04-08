const SHARED = require('../shared');

function show_help() {
  let msg = `
visdiff command [params..]
command:
  make-config [file-name]: Make a config file from default template
    file-name (string) - Optional - If empty, a file called ".visdiff.js" will be created in the current directory.
  version: show current version info
  take {name}: Take a snapshot
    name (string) - Snapshot name
  cmp {name_1} {name_2}: Compare 2 snapshot
    name_1 (string) - Snapshot 1 to compare
    name_2 (string) - Snapshot 2 to compare
`
  console.log(msg);
}

module.exports = show_help; 
