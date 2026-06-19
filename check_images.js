const fs = require('fs');
const https = require('https');

const html = fs.readFileSync('cafe.html', 'utf8');
const urls = [...html.matchAll(/https:\/\/images\.unsplash\.com\/[^"]+/g)].map(m => m[0]);

const uniqueUrls = [...new Set(urls)];

let completed = 0;
for (const url of uniqueUrls) {
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.log('BROKEN:', url, res.statusCode);
    }
    completed++;
    if (completed === uniqueUrls.length) {
      console.log('Done checking images');
    }
  }).on('error', (e) => {
    console.log('ERROR:', url, e.message);
    completed++;
    if (completed === uniqueUrls.length) {
      console.log('Done checking images');
    }
  });
}
