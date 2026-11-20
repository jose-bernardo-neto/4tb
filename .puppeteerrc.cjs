/** @type {import("puppeteer").Configuration} */
module.exports = {
  // whatsapp-web.js usa headless: true (Chrome completo); o shell não é necessário.
  "chrome-headless-shell": { skipDownload: true },
};
