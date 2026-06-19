const fs = require('fs');
let html = fs.readFileSync('restaurant.html', 'utf8');

html = html.replace(/Maharaja Table/g, 'Saravala');
html = html.replace(/MAHARAJA TABLE/g, 'SARAVALA');
html = html.replace(/Maharaja/g, 'Saravala');

fs.writeFileSync('restaurant.html', html, 'utf8');
console.log('Renamed to SARAVALA');
