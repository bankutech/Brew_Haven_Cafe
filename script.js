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