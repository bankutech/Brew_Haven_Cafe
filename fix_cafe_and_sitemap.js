const fs = require('fs');

// --- 1. Fix cafe.html images and remove sitemap link ---
let cafeHtml = fs.readFileSync('cafe.html', 'utf8');

// Replace broken image IDs with working ones
cafeHtml = cafeHtml.replace(/photo-1580933079467-aa257dd33a1a/g, 'photo-1587734195503-904fca47e0e9');
cafeHtml = cafeHtml.replace(/photo-1610631780825-2c3bfae76449/g, 'photo-1611162458324-aae1eb4129a4');
cafeHtml = cafeHtml.replace(/photo-1510061164039-bfa22421a221/g, 'photo-1514432324607-a09d9b4aefdd');

// Remove Sitemap link from footer
cafeHtml = cafeHtml.replace(/<a href="legal\.html#sitemap">Sitemap<\/a>/g, '');

fs.writeFileSync('cafe.html', cafeHtml, 'utf8');

// --- 2. Remove Sitemap section from legal.html ---
let legalHtml = fs.readFileSync('legal.html', 'utf8');

// Remove the sitemap link in the ToC
legalHtml = legalHtml.replace(/<li><a href="legal\.html#sitemap">Sitemap<\/a><\/li>/g, '');

// Remove the Sitemap section itself
// It starts with <!-- Sitemap Section --> and ends before </div> <!-- End content -->
// Let's use a regex to cut it out
legalHtml = legalHtml.replace(/<!-- Sitemap Section -->[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/main>)/, '');

fs.writeFileSync('legal.html', legalHtml, 'utf8');

console.log('Fixed images and removed sitemap.');
