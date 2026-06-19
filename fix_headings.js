const fs = require('fs');

function fixHeadings(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (file === 'cafe.html') {
        content = content.replace(/<h4 class="offer-card-title">/g, '<h3 class="offer-card-title">')
                         .replace(/<\/h4>(\s*<p class="offer-card-desc">)/g, '</h3>$1');
        content = content.replace(/<h4 id="result-drink-name">/g, '<h3 id="result-drink-name">')
                         .replace(/<h4 id="result-pastry-name">/g, '<h3 id="result-pastry-name">')
                         .replace(/<\/h4>(\s*<div class="result-tags">)/g, '</h3>$1')
                         .replace(/<\/h4>(\s*<div class="result-details">)/g, '</h3>$1');
        content = content.replace(/<h4 id="recipe-name">/g, '<h3 id="recipe-name">')
                         .replace(/<\/h4>(\s*<div class="recipe-meta">)/g, '</h3>$1');
        content = content.replace(/<h5>/g, '<h3>').replace(/<\/h5>/g, '</h3>');
        content = content.replace(/<h4>/g, '<h3>').replace(/<\/h4>/g, '</h3>');
    }
    else if (file === 'restaurant.html') {
        content = content.replace(/<h4>/g, '<h3>').replace(/<\/h4>/g, '</h3>');
        content = content.replace(/<button class="nav-btn" role="tab"/g, '<button class="nav-btn" role="tab" aria-controls="tabpanel-dummy"');
    }
    else if (file === 'admin.html') {
        content = content.replace(/<h3>/g, '<h2>').replace(/<\/h3>/g, '</h2>');
    }
    
    fs.writeFileSync(file, content);
}

['cafe.html', 'restaurant.html', 'admin.html'].forEach(fixHeadings);
console.log('Fixed headings');
