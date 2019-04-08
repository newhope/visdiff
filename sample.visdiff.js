// Use base url variable for convenient purpose, not effecting the config
const base_url = 'http://localhost/vischange/';

const configs = {
  
  // Compulsory
  /**
   * Page object:
   * - id (string) - Compulsory - ID of the page
   * - url (string) - Compulsory - URL to load and screenshot
   * - goto_options (object) - Optional - https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options
   * - onLoaded (async callback) - Optional - An async callback once the page loaded
   *    + page (object) - Compulsory - Instance of Page class from Puppeteer
   *      See more: https://github.com/GoogleChrome/puppeteer/blob/v1.14.0/docs/api.md#class-page
   *      Can do anything with page object but DO NOT CALL page.close or WE DIE
   *      Sample:
   *        await page.click('a.accordion-item'); // click on an accordion item
   */
  pages: [
    {
      id: 'anything',
      url: base_url + 'test.php',
    },
  ],
  
  // Optional
  breakpoints: [ // By [width, height]
    [320, 568], // Phone
    [480, 800], // Phone big screen
    [576, 360], // Phone landscape
    [768, 1024], // Tablet
    [992, 600], // Desktop
    [1200, 800] // Wide screen
  ],
  /**
   * resize_mode:
   * - dedicated: reload page after changing viewport size. Slow but sure.
   * - chill: just load the url once, then changing viewports and take screenshot. Fast & easy.
   */
  resize_mode: 'dedicated',
  /**
   * tmp_path: Temporary folder path to store proceeded images
   */
  tmp_path: '.visdiff',
  /**
   * diff_threshold (float) - From 0 to 1, The smaller number the more sensitive
   */
  diff_threshold: 0.1,
  anti_alias: false,
};

// Don't touch, exporting the configs...
module.exports = configs; 
