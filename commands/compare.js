const SHARED = require('../shared'),
  fs = require('fs'),
  PNG = require('pngjs').PNG,
  JPEG = require('jpeg-js'),
  pixelmatch = require('pixelmatch'),
  _ = require('lodash');

const { debug_log, format_name, rmdir_recursive, die} = require('../common');

configs = SHARED.configs;

function compare_jpg (from_path, to_path, diff_path) {
  
  let imgData1 = fs.readFileSync(from_path);
  let imgData2 = fs.readFileSync(to_path);
  
  const img1 = JPEG.decode(imgData1);
  const img2 = JPEG.decode(imgData2);
  
  const diff = new PNG({
    width: img1.width, 
    height: img1.height
  });

  // console.log('Img 1 data', img1.data);
  // console.log('Img 2 data', img2.data);
  let diffPixel = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {
    threshold: configs.diff_threshold,
    includeAA: configs.anti_alias,
  });

  // console.log('Diff data', diff.data);
  if (diffPixel) {
    let buffer = PNG.sync.write(diff.pack());
    fs.writeFileSync(diff_path, buffer);
  }

  return diffPixel;
}

function read_meta(snapshot_name) {
  return JSON.parse(fs.readFileSync(SHARED.TMP_META_PATH + '/' + snapshot_name + '.json'));
}

function build_report(snapshot_name_1, snapshot_name_2, diff_files) {
  
  let meta = read_meta(snapshot_name_1),
    file_map = meta.files;
  
  // console.log(file_map);
  
  let report_data = {
    name1: snapshot_name_1,
    name2: snapshot_name_2,
    app: SHARED.PACKAGE,
    diff: [],
  };

  const report_name = snapshot_name_1 + '__' + snapshot_name_2;
  for (let i in diff_files) {
    
    let file_name = diff_files[i][0],
      nbr_pixel = diff_files[i][1],
      page_info = file_map[file_name];
    
    // console.log(file_name);
    // console.log(page_info);
    
    let report_row = {
      id: page_info.id,
      url: page_info.url,
      view_port: page_info.vp_width + 'x' + page_info.vp_height,
      img_from: `../${SHARED.SNAPSHOT_DIR_NAME}/${snapshot_name_1}/${file_name}`,
      img_to: `../${SHARED.SNAPSHOT_DIR_NAME}/${snapshot_name_2}/${file_name}`,
      img_diff: `../${SHARED.DIFF_DIR_NAME}/${report_name}/${file_name}.png`,
      nbr_pixel: nbr_pixel,
    };
    report_data.diff.push(report_row);
  }
  
  let tpl_buffer = fs.readFileSync(SHARED.PBD + '/tpl/report.html');
  let compiler = _.template(tpl_buffer);
  
  const buffer = compiler(report_data);
  const report_path = SHARED.TMP_REPORT_PATH + '/' + report_name + '.html';
  fs.writeFileSync(report_path, buffer);
  
  return report_path;
}

async function get_diff(snapshot_name_1, snapshot_name_2) {

  const start = Date.now();
  
  snapshot_name_1 = format_name(snapshot_name_1.toString());
  snapshot_name_2 = format_name(snapshot_name_2.toString());
  
  console.log(`Comparing ${snapshot_name_1} and ${snapshot_name_2}...`);
  const path1 = SHARED.TMP_SNAPSHOT_PATH + '/' + snapshot_name_1,
    path2 = SHARED.TMP_SNAPSHOT_PATH + '/' + snapshot_name_2;
  let files1 = fs.readdirSync(path1),
    files2 = fs.readdirSync(path2);

  debug_log(snapshot_name_1, files1);
  debug_log(snapshot_name_2, files2);

  let inter = _.intersection(files1, files2);
  if (inter.length < files1.length) {
    console.log('Skipping files from snapshot ' + snapshot_name_1 + ":\n", _.difference(files1, inter));
  }
  if (inter.length < files2.length) {
    console.log('Skipping files from snapshot ' + snapshot_name_2 + ":\n", _.difference(files2, inter));
  }

  let diff_files = [];
  
  if (inter.length) {
    
    let diff_name = SHARED.TMP_DIFF_PATH + '/' + snapshot_name_1 + '__' + snapshot_name_2;
    
    // Renew the diff dir
    rmdir_recursive(diff_name);
    fs.mkdirSync(diff_name);

    console.log(`${inter.length} screenshots`);
    for (let i in inter) {
      let name = inter[i];
      let pixel = compare_jpg(
        path1 + '/' + name,
        path2 + '/' + name,
        diff_name + '/' + name + '.png'
      );
      if (pixel > 0) {
        diff_files.push([name, pixel]);
      }
    }
  }

  const time_used = (Date.now() - start)/1000; // second
  
  if (diff_files.length) {
    // Something different, build report now
    const report_path = build_report(snapshot_name_1, snapshot_name_2, diff_files);

    console.log(`Found ${diff_files.length} changes\n`, diff_files);
    console.log('Building report...');
    console.log('Report file:', report_path);
  } else {
    console.log('Spot NO DIFFERENCE');
  }
  
  console.log(`>>> Done in ${time_used}`);
}

module.exports = get_diff;
