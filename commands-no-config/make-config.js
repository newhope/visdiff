const SHARED = require('../shared'),
  fs = require('fs');

function clone_config(config_name) {
  let conf = fs.readFileSync(SHARED.PBD + '/sample.visdiff.js');
  let final_file = config_name ? config_name : '.visdiff.js';
  fs.writeFileSync(SHARED.PWD + '/' + final_file, conf);
  
  return 0;
}

module.exports = clone_config; 
