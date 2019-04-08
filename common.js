// Common functions being used
const fs = require('fs'),
  SHARED = require('./shared');

function rmdir_recursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      let curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        rmdir_recursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function format_name(name) {
  return name.replace(/[^\w\d\-.]/g, '_');
}

function debug_log() {
  
  if (SHARED.IS_DEBUG) {
    console.log.apply(null, arguments);
  }
}

function die() {
  
  if (msg) {
    console.log(msg);
  }

  process.exit(999);
}

function ask(query) {
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

module.exports = {
  rmdir_recursive: rmdir_recursive,
  format_name: format_name,
  debug_log: debug_log,
  die: die,
  ask: ask,
};
