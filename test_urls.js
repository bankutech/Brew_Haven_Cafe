const https = require('https');

const candidates = [
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&w=600&q=80'
];

for (const url of candidates) {
  https.get(url, res => {
    console.log(url, res.statusCode);
  });
}
