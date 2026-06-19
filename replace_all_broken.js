const fs = require('fs');

const replacements = {
  '1534687941688-192518e38f62': '1514432324607-a09d9b4aefdd', // Quiz Drink
  '1509365465994-3e28404a9e5d': '1611162458324-aae1eb4129a4', // Quiz Pastry
  '1525049383637-236b2f4625b0': '1587734195503-904fca47e0e9', // Ethiopia
  '1533777324565-a040f361d906': '1414235077428-971145504d60'  // Family Feast
};

const files = ['cafe.html', 'script.js', 'restaurant.html'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.replace(new RegExp(bad, 'g'), good);
  }
  fs.writeFileSync(f, content, 'utf8');
});

console.log('Fixed all broken images across the files!');
