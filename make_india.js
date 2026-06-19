const fs = require('fs');

let html = fs.readFileSync('restaurant.html', 'utf8');

// Replace names
html = html.replace(/Aurum Table/g, 'Maharaja Table');
html = html.replace(/AURUM TABLE/g, 'MAHARAJA TABLE');
html = html.replace(/Aurum/g, 'Maharaja');

// Replace locations
html = html.replace(/New York, NY 10001/g, 'Indiranagar, Bengaluru 560038');
html = html.replace(/New York, NY/g, 'Bengaluru, KA');
html = html.replace(/The New York Times/g, 'The Times of India');

// Replace Google maps
html = html.replace(/https:\/\/www\.google\.com\/maps\/embed\?pb=[^"]+/, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.001696423075!2d77.6389!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a0!2sIndiranagar%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1717600000000!5m2!1sen!2sin');

// Convert prices
html = html.replace(/\$(\d+)/g, (match, p1) => {
    return '₹' + (parseInt(p1) * 83);
});

fs.writeFileSync('restaurant.html', html, 'utf8');
console.log('Done modifying restaurant.html');
