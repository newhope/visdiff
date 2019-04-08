const SHARED = require('../shared'),
  fs = require('fs');

const { debug_log, ask, rmdir_recursive} = require('../common');

async function clear_all() {
  
  let ans = await ask("Are you sure to clear all the snapshots/reports on this project? (Type 'y' or 'yes' to confirm)\n");
  ans = ans.toLowerCase();
  if (ans === 'y' || ans === 'yes') {
    rmdir_recursive(SHARED.TMP_PWD);
    console.log('Done');
  } else {
    console.log('Cancel!');
  }
}

module.exports = clear_all; 
