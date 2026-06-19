const fs = require('fs');

['cafe.html', 'restaurant.html'].forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  
  // Replace empty links that have specific keywords in their vicinity
  text = text.replace(/href="#"(?=[^>]*instagram)/gi, 'href="https://instagram.com/saravala" target="_blank"');
  text = text.replace(/href="#"(?=[^>]*facebook)/gi, 'href="https://facebook.com/saravala" target="_blank"');
  text = text.replace(/href="#"(?=[^>]*twitter)/gi, 'href="https://twitter.com/saravala" target="_blank"');
  text = text.replace(/href="#"(?=[^>]*linkedin)/gi, 'href="https://linkedin.com/company/saravala" target="_blank"');
  text = text.replace(/href="#"(?=[^>]*pinterest)/gi, 'href="https://pinterest.com/saravala" target="_blank"');
  
  // Replace remaining href="#" for generic buttons opening modals
  text = text.replace(/href="#"(?=\s*class="btn)/g, 'href="javascript:void(0)"');
  text = text.replace(/href="#"(?=\s*class="[^"]*btn)/g, 'href="javascript:void(0)"');
  
  fs.writeFileSync(f, text);
});
console.log('Fixed links.');
