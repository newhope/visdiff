#!/usr/bin/env node

const fs = require('fs'),
  argv = require('minimist')(process.argv.slice(2)),
  _ = require('lodash'),
  PACKAGE = require('./package.json');
  
let SHARED = require('./shared');

SHARED.IS_DEBUG = argv.debug;
SHARED.PACKAGE = PACKAGE;

SHARED.PWD = process.env.PWD;
SHARED.PBD = __dirname;

const { debug_log } = require('./common');

// Introduce
// console.log(PACKAGE.name + ' v' + PACKAGE.version + ', by ' + PACKAGE.author.name);

debug_log('Working directory:', SHARED.PWD);
debug_log('Base directory:', SHARED.PBD);

(async () => {

  // Handle commands with no config required first
  await handle_commands('no-config');

  // Load config
  SHARED.configs = configs = load_configs();
  debug_log('Config loaded', configs);

  // Define more internal path
  prepare_internal_paths();

  // Prepare working dir
  prepare_working_dir();

  // Handle normal commands
  await handle_commands();

})();


function load_configs() {

  // Default file location
  let conf_file = SHARED.PWD + '/.visdiff.js';
  
  // Or from the argument
  if (argv.c) {
    debug_log('Specified config file: ', argv.c);
    conf_file = argv.c;
  } else if (argv.config) {
    debug_log('Specified config file: ', argv.config);
    conf_file = argv.config;
  }
  
  debug_log('Reading config at:', conf_file);
  
  // Try searching for the config file
  if ( ! fs.existsSync(conf_file)) {
    throw new Error('Cant read config file at "' + conf_file + '"');
  }
  
  const configs = require(conf_file);
  if ( ! configs.pages || configs.pages.length === 0) {
    throw new Error('Missing array "pages" from the config')
  }
  
  let default_configs = {
    pages: [],
    resize_mode: 'dedicated',
    breakpoints: [
      [800, 600],
    ],
    tmp_path: '.visdiff',
    diff_threshold: 0.1,
    anti_alias: false,
  };

  default_configs = _.assign(default_configs, configs);
  
  return default_configs;
}

function prepare_internal_paths() {
  SHARED.TMP_PWD = SHARED.PWD + '/' + SHARED.configs.tmp_path;
  SHARED.SNAPSHOT_DIR_NAME = 'snapshots';
  SHARED.TMP_SNAPSHOT_PATH = SHARED.TMP_PWD + '/' + SHARED.SNAPSHOT_DIR_NAME;
  SHARED.DIFF_DIR_NAME = 'diff';
  SHARED.TMP_DIFF_PATH = SHARED.TMP_PWD + '/' + SHARED.DIFF_DIR_NAME;
  SHARED.META_DIR_NAME = 'meta';
  SHARED.TMP_META_PATH = SHARED.TMP_PWD + '/' + SHARED.META_DIR_NAME;
  SHARED.REPORT_DIR_NAME = 'reports';
  SHARED.TMP_REPORT_PATH = SHARED.TMP_PWD + '/' + SHARED.REPORT_DIR_NAME;
}

function prepare_working_dir() {
  
  if ( ! fs.existsSync(SHARED.TMP_PWD)) {
    fs.mkdirSync(SHARED.TMP_PWD);
    debug_log('Created tmp_path:', SHARED.TMP_PWD);
  }
  if ( ! fs.existsSync(SHARED.TMP_SNAPSHOT_PATH)) {
    fs.mkdirSync(SHARED.TMP_SNAPSHOT_PATH);
    debug_log('Created temporary snapshot path:', SHARED.TMP_SNAPSHOT_PATH);
  }
  if ( ! fs.existsSync(SHARED.TMP_DIFF_PATH)) {
    fs.mkdirSync(SHARED.TMP_DIFF_PATH);
    debug_log('Created temporary diff path:', SHARED.TMP_DIFF_PATH);
  }
  if ( ! fs.existsSync(SHARED.TMP_META_PATH)) {
    fs.mkdirSync(SHARED.TMP_META_PATH);
    debug_log('Created temporary meta path:', SHARED.TMP_META_PATH);
  }
  if ( ! fs.existsSync(SHARED.TMP_REPORT_PATH)) {
    fs.mkdirSync(SHARED.TMP_REPORT_PATH);
    debug_log('Created temporary report path:', SHARED.TMP_REPORT_PATH);
  }
}

async function handle_commands(type = null) {
  let cmd = argv._[0],
    params = [];

  if (argv._.length > 1) {
    params = argv._.slice(1);
  }

  debug_log('CMD:', cmd);
  debug_log('Params:', params);
  
  let cmd_dir_name = 'commands';
  const support_types = ['no-config'];
  if (support_types.indexOf(type) > -1) {
    cmd_dir_name += ('-' + type);
  } 

  if (fs.existsSync(`${SHARED.PBD}/${cmd_dir_name}/${cmd}.js`)) {
    const command_exe = require(`./${cmd_dir_name}/${cmd}.js`);

    const AsyncFunction = (async () => {}).constructor;
    
    let ret_code;
    
    if (command_exe instanceof AsyncFunction) {
      ret_code = await command_exe.apply(this, params);
    } else {
      ret_code = command_exe.apply(this, params);
    }
    
    process.exit(ret_code);
  }
}
