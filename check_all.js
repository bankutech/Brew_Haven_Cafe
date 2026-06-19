const fs = require('fs');
const https = require('https');
const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
const urls = new Set();
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = [...content.matchAll(/https:\/\/images\.unsplash\.com\/[^"'\s]+/g)];
  matches.forEach(m => urls.add(m[0]));
});
const uniqueUrls = [...urls];
let completed = 0;
if (uniqueUrls.length === 0) { console.log("No URLs found"); process.exit(0); }
uniqueUrls.forEach(url => {
  https.get(url, res => {
    if (res.statusCode !== 200) console.log('BROKEN:', url, res.statusCode);
    completed++;
    if (completed === uniqueUrls.length) console.log('Done checking images');
  }).on('error', e => {
    console.log('ERR:', url);
    completed++;
    if (completed === uniqueUrls.length) console.log('Done checking images');
  });
});
