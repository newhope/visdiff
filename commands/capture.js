const SHARED = require('../shared'),
  fs = require('fs'),
  puppeteer = require('puppeteer'),
  _ = require('lodash');

const { debug_log, format_name, rmdir_recursive} = require('../common');


const default_goto_options = {
  waitUntil: 'networkidle2',
  timeout: 60000,
};

let session_meta = {};

async function do_screenshot(page, page_obj, size, capture_to) {

  debug_log('> Taking screenshot');
  
  let jpg_name = page_obj.id + '__' + size[0] + 'x' + size[1] + '.jpg';

  // Meta for "file" object to be store in session meta
  let file_meta = {
    id: page_obj.id,
    url: page_obj.url,
    vp_width: size[0],
    vp_height: size[1],
    time: Date.now().toString(),
  };

  await page.screenshot({
    path: capture_to + '/' + jpg_name,
    type: 'jpeg',
    fullPage: true,
  });

  session_meta.files[jpg_name] = file_meta;

  debug_log(`> Screenshot captured: ${jpg_name}`);
}

async function chill_capture(browser, page_obj, goto_opts, capture_to) {
  
  let captured_count = 0;
  
  debug_log('Capture mode: Chill');

  debug_log(`> Goto ${page_obj.url}`);

  const page = await browser.newPage();
  await page.goto(page_obj.url, goto_opts);
  
  if (page_obj.onLoaded) {
    try {
      debug_log('> Found a callback onLoaded, triggering...');
      await page_obj.onLoaded(page);
      debug_log('> Callback triggered');
    } catch (ex) {
      console.log(`>> Error from onLoaded callback of ${page_obj.id}`);
      console.error(ex);
    }
  }
  
  for (let i in SHARED.configs.breakpoints) {
    let bp = SHARED.configs.breakpoints[i];

    debug_log(`> Resizing browser to  ${bp[0]} x ${bp[1]}`);
    await page.setViewport({
      width: bp[0],
      height: bp[1]
    });
    await page.waitFor(300); // wait for 300ms to make sure...

    await do_screenshot(page, page_obj, bp, capture_to);
    captured_count++;
  }
  
  await page.close();
  
  return captured_count;
}

async function dedicated_capture(browser, page_obj, goto_opts, capture_to) {

  let captured_count = 0;
  
  debug_log('Capture mode: Dedicated');

  const page = await browser.newPage();
  
  for (let i in SHARED.configs.breakpoints) {
    let bp = SHARED.configs.breakpoints[i];

    debug_log(`> Goto ${page_obj.url} on screen ${bp[0]} x ${bp[1]}`);

    await page.setViewport({
      width: bp[0], 
      height: bp[1]
    });
    await page.goto(page_obj.url, goto_opts);

    if (page_obj.onLoaded) {
      try {
        debug_log('> Found a callback onLoaded, triggering...');
        await page_obj.onLoaded(page);
        debug_log('> Callback triggered');
      } catch (ex) {
        console.log(`>> Error from onLoaded callback of ${page_obj.id}`);
        console.error(ex);
      }
    }

    await do_screenshot(page, page_obj, bp, capture_to);
    captured_count++
  }
 
  await page.close();
  
  return captured_count;
}

async function load_and_capture(browser, page_obj, capture_to) {

  const id = page_obj.id;

  console.log(`Processing item #${id}:  ${page_obj.url} (on ${SHARED.configs.breakpoints.length} breakpoints)`);

  let goto_opts = _.clone(default_goto_options);
  if (page_obj.goto_options) {
    _.assign(goto_opts, page_obj.goto_options);
  }
  debug_log('Goto options: ', goto_opts);

  let count;
  if (SHARED.configs.resize_mode === 'dedicated') {
    count = await dedicated_capture(browser, page_obj, goto_opts, capture_to);    
  } else {
    count = await chill_capture(browser, page_obj, goto_opts, capture_to);
  }
  
  console.log(`> Captured ${count} screenshots`);
  
  return count;
}

async function capture_snapshot(snapshot_name) {

  snapshot_name = snapshot_name.toString();
  let current_snapshot_path = SHARED.TMP_SNAPSHOT_PATH + '/' + format_name(snapshot_name);
  
  // prepare snapshot path
  rmdir_recursive(current_snapshot_path);
  fs.mkdirSync(current_snapshot_path);

  const browser = await puppeteer.launch();

  session_meta.name = snapshot_name;
  session_meta.version = SHARED.PACKAGE.version;
  session_meta.resize_mode = SHARED.configs.resize_mode;
  session_meta.start_time = Date.now();
  session_meta.end_time = null;
  session_meta.files = {};
  
  let count = 0;
  for (let i in SHARED.configs.pages) {
    let page_obj = SHARED.configs.pages[i];
    count += await load_and_capture(browser, page_obj, current_snapshot_path);
  }
  
  await browser.close();

  session_meta.end_time = Date.now();
  let time_used = (session_meta.end_time - session_meta.start_time)/1000; // second
  
  console.log(`>>> Captured total ${count} screenshots in ${time_used} seconds`);
  
  // Write meta to file
  fs.writeFileSync(
    SHARED.TMP_META_PATH + '/' + snapshot_name + '.json', 
    JSON.stringify(session_meta)
  );

  return 0;
}

module.exports = capture_snapshot; 
