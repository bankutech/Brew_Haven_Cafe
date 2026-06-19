const fs = require('fs');
let html = fs.readFileSync('restaurant.html', 'utf8');

// 1. Remove from reservations
const cardStr = `          <div style="margin-top: 40px;">
            <div class="menu-card" style="text-align: center; padding: 40px 30px; display: flex; flex-direction: column; border-color: var(--aurum-gold);">
              <i class="fas fa-birthday-cake" style="font-size: 3rem; color: var(--aurum-gold); margin-bottom: 20px; display:block;"></i>
              <h3 style="color: var(--aurum-ivory); margin-bottom: 15px;">Private Celebrations</h3>
              <p style="color: rgba(253,251,247,0.6); margin-bottom: 25px; line-height:1.7;">Birthdays, proposals, and milestone events curated with bespoke menus and florals.</p>
              <button class="aurum-btn" id="btn-celebration" onclick="openReservationModal()" style="padding: 10px 24px; margin-top: auto; width: 100%;">Plan Your Event</button>
            </div>
          </div>`;

if (html.includes(cardStr)) {
    html = html.replace(cardStr, '');
}

// 2. Put back in catering
const cateringTarget = `          <p style="color: rgba(253,251,247,0.6); margin-bottom: 25px; line-height:1.7;">Impress clients with our exclusive private dining room and AV-equipped banquet hall.</p>
          <button class="aurum-btn" id="btn-corporate" onclick="openCorporateModal()" style="padding: 10px 24px; margin-top: auto;">Request Quote</button>
        </div>
      </div>`;

const cardToInsert = `          <p style="color: rgba(253,251,247,0.6); margin-bottom: 25px; line-height:1.7;">Impress clients with our exclusive private dining room and AV-equipped banquet hall.</p>
          <button class="aurum-btn" id="btn-corporate" onclick="openCorporateModal()" style="padding: 10px 24px; margin-top: auto;">Request Quote</button>
        </div>
        <div class="menu-card" style="text-align: center; padding: 40px 30px; display: flex; flex-direction: column; border-color: var(--aurum-gold);">
          <i class="fas fa-birthday-cake" style="font-size: 3rem; color: var(--aurum-gold); margin-bottom: 20px; display:block;"></i>
          <h3 style="color: var(--aurum-ivory); margin-bottom: 15px;">Private Celebrations</h3>
          <p style="color: rgba(253,251,247,0.6); margin-bottom: 25px; line-height:1.7;">Birthdays, proposals, and milestone events curated with bespoke menus and florals.</p>
          <button class="aurum-btn" id="btn-celebration" onclick="openCelebrationModal()" style="padding: 10px 24px; margin-top: auto; width: 100%;">Plan Your Event</button>
        </div>
      </div>`;

if (html.includes(cateringTarget)) {
    html = html.replace(cateringTarget, cardToInsert);
}

// 3. Add celebration-modal
const modalToInsert = `  <!-- Private Celebrations Modal -->
  <div class="aurum-modal" id="celebration-modal">
    <button class="modal-close-btn" onclick="closeAllModals()" id="btn-modal-close-celeb">&times;</button>
    <h2><i class="fas fa-birthday-cake" style="margin-right: 12px;"></i>Plan Private Celebration</h2>
    <p style="color: #999; margin-bottom: 30px;">Curated bespoke menus and florals for your milestone events.</p>
    <div class="rform-group"><label>Event Type</label><input type="text" class="menu-search-input" id="celeb-type" placeholder="Birthday, Proposal, Anniversary..."></div>
    <div class="rform-group"><label>Estimated Guests</label><input type="number" class="menu-search-input" id="celeb-guests" placeholder="Number of guests"></div>
    <div class="rform-group"><label>Preferred Date</label><input type="date" class="menu-search-input" id="celeb-date"></div>
    <div class="rform-group">
      <label>Floral & Decor Needs</label>
      <select class="menu-search-input" id="celeb-decor">
        <option>Standard Table Setup</option>
        <option>Custom Floral Arrangements</option>
        <option>Full Venue Decor</option>
      </select>
    </div>
    <button class="aurum-btn filled" onclick="submitCelebration()" style="width: 100%; text-align: center; padding: 15px; margin-top: 10px;">Submit Inquiry</button>
  </div>
`;
if (html.includes('<!-- Toast Notification -->')) {
    html = html.replace('<!-- Toast Notification -->', modalToInsert + '\n  <!-- Toast Notification -->');
}

// 4. Add JS function
const jsToInsert = `
    function openCelebrationModal() {
      closeAllModals();
      document.getElementById('modal-backdrop').classList.add('active');
      document.getElementById('celebration-modal').classList.add('active');
      lockScroll();
    }
    
    function submitCelebration() {
      showToast('Celebration inquiry sent! Our event planner will contact you.');
      closeAllModals();
    }
`;
if (html.includes('function openCorporateModal() {')) {
    html = html.replace('    function openCorporateModal() {', jsToInsert + '\n    function openCorporateModal() {');
}

fs.writeFileSync('restaurant.html', html, 'utf8');
console.log('done');
