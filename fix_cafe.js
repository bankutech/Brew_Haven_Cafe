const fs = require('fs');

let html = fs.readFileSync('cafe.html', 'utf8');
let css = fs.readFileSync('style.css', 'utf8');
let js = fs.readFileSync('script.js', 'utf8');

// 1. Inline CSS and JS
html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }\n</style>`);
html = html.replace('<script src="script.js"></script>', `<script>\n${js}\n</script>`);

// 2. Checkout overlay unclosed
html = html.replace('<div class="checkout-overlay" id="checkout-overlay">\n\n<!-- ── SUCCESS OVERLAY ── -->', '<div class="checkout-overlay" id="checkout-overlay"></div>\n\n<!-- ── SUCCESS OVERLAY ── -->');

// 3. Local assets 404
html = html.replace(/assets\/about-cafe\.png/g, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80');
html = html.replace(/assets\/menu-espresso\.png/g, 'https://images.unsplash.com/photo-1510061164039-bfa22421a221?auto=format&fit=crop&w=600&q=80');
html = html.replace(/assets\/barista-1\.png/g, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80');
html = html.replace('content="assets/hero-bg.png"', 'content="https://brewhaven.cafe/assets/hero-bg.png"');

// 4. window.closeCheckout() called but never defined
if (!html.includes('window.closeCheckout = ')) {
    html = html.replace('function closeCheckout() {', 'window.closeCheckout = function closeCheckout() {');
}

// 5. Cart drawer has no close-on-backdrop-click handler
html = html.replace('<div id="cart-overlay" class="cart-overlay"></div>', '<div id="cart-overlay" class="cart-overlay" onclick="document.getElementById(\'cart-close-btn\').click()"></div>');

// 6. Menu order btn USD -> INR
const priceMap = {
    'South Indian Filter Kaapi': '290',
    'Velvet Cappuccino': '373',
    'Caramel Macchiato': '415',
    'Nitro Cold Brew': '352',
    'Matcha Latte': '410',
    'Artisanal Masala Chai': '332',
    'Signature Tiramisu': '539',
    'Molten Lava Cake': '601',
    'Artisan Avocado Toast': '705',
    'Cardamom Pistachio Croissant': '373'
};
for (const [name, price] of Object.entries(priceMap)) {
    const regex = new RegExp(`data-item-name="${name}"\\s+data-item-price="[0-9.]+"`, 'g');
    html = html.replace(regex, `data-item-name="${name}" data-item-price="${price}"`);
}

// 7. Shop product price USD -> INR
html = html.replace('data-p1="16.00" data-p2="38.00"', 'data-p1="1328" data-p2="3154"');
html = html.replace('data-p1="15.00" data-p2="36.00"', 'data-p1="1245" data-p2="2988"');
html = html.replace('data-p1="17.00" data-p2="40.00"', 'data-p1="1411" data-p2="3320"');

// 8. Contact form has no action
html = html.replace('<form id="contact-form" class="contact-form" novalidate>', '<form id="contact-form" class="contact-form" novalidate action="javascript:void(0);">');

// 9. Google Maps iframe
html = html.replace('https://www.google.com/maps/embed?pb=!11m18!1m12!1m3!1d3022.241219808383!2d-73.98784412343048!3d40.757978734874495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25859c1b614e1%3A0xb565d21469e380f3!2sTimes%20Square%20Red%20Steps!5e0!3m2!1sen!2sus!4v1717600000000!5m2!1sen!2sus', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.001696423075!2d77.6389!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a0!2sIndiranagar%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1717600000000!5m2!1sen!2sin');

// 10. Hero buttons href
html = html.replace(/href="restaurant\.html#reservations"/g, 'href="#contact"');

// 11. Success modal close reset state
const scriptAddition = `
<script>
window.closeSuccessModal = function() {
    document.getElementById('success-modal').classList.remove('active');
    if (document.getElementById('contact-form')) document.getElementById('contact-form').reset();
    let btn = document.querySelector('#contact-form button[type="submit"]');
    if (btn) { btn.disabled = false; btn.innerText = 'Send Message'; }
};
window.claimDiscount = function(e) {
    if(e) e.preventDefault();
    const promoInput = document.getElementById('promoInput');
    if(promoInput) promoInput.value = 'MORNINGBREW';
    document.getElementById('cart-toggle').click();
};
// Add touch/swipe support for carousel
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    if(track) {
        let startX = 0;
        track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
        track.addEventListener('touchend', e => {
            let diff = startX - e.changedTouches[0].clientX;
            if(diff > 50) document.getElementById('carousel-next').click();
            else if(diff < -50) document.getElementById('carousel-prev').click();
        });
    }
});
</script>
`;
html = html.replace("onclick=\"document.getElementById('success-modal').classList.remove('active');\"", "onclick=\"closeSuccessModal();\"");
html = html.replace("</body>", scriptAddition + "\n</body>");

// 13. Quiz result images src
html = html.replace('src="" alt="Drink Match"', 'src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="Drink Match"');
html = html.replace('src="" alt="Pastry Match"', 'src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="Pastry Match"');

// 15. Phone number malformed
html = html.replace('+91 98450 789-2345', '+91 98450 78923');

// 16. Schema @id
html = html.replace('"@id": ""', '"@id": "https://brewhaven.cafe/#cafe"');

// 17. Team aria labels
html = html.replace(/Liam's/g, "Rohan's");
html = html.replace(/Sophia's/g, "Ananya's");
html = html.replace(/Daniel's/g, "Vikram's");

// 19. Nav logo title
html = html.replace('title="Back to BrewVerse Portal"', 'title="Brew Haven"');

// 20. WhatsApp float button
html = html.replace('https://wa.me/15557892345', 'https://wa.me/919845078923');

// 21. Footer legal links
html = html.replace('legal.html#privacy', '#privacy');
html = html.replace('legal.html#terms', '#terms');
html = html.replace('legal.html#sitemap', '#sitemap');

// 24. Newsletter form no action
html = html.replace('<form id="newsletter-form" class="newsletter-form">', '<form id="newsletter-form" class="newsletter-form" action="javascript:void(0);">');

// Write back to file
fs.writeFileSync('cafe.html', html, 'utf8');
console.log("Done fixing cafe.html");
