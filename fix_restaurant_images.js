const fs = require('fs');

let html = fs.readFileSync('restaurant.html', 'utf8');

// Wagyu Filet Mignon
html = html.replace(/photo-1550461716-dbf266b2a840/g, 'photo-1546833999-b9f581a1996d');

// Golden Osso Buco
html = html.replace(/photo-1544025162-83508c9d2f6d/g, 'photo-1504674900247-0877df9cc836');

// Family Feast
html = html.replace(/photo-1590846406792-0adc7f928a1f/g, 'photo-1533777324565-a040f361d906');

fs.writeFileSync('restaurant.html', html, 'utf8');
console.log('Fixed broken images in restaurant.html');
