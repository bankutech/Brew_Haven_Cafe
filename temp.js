
    // ─── NAVIGATION ───
    function toggleNav(event) {
      if(event) event.stopPropagation();
      const nav = document.getElementById('main-nav');
      const icon = document.getElementById('hamburger-icon');
      nav.classList.toggle('nav-open');
      icon.className = nav.classList.contains('nav-open') ? 'fas fa-times' : 'fas fa-bars';
    }
    function closeNav() {
      const nav = document.getElementById('main-nav');
      const icon = document.getElementById('hamburger-icon');
      nav.classList.remove('nav-open');
      icon.className = 'fas fa-bars';
    }

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      const nav = document.getElementById('main-nav');
      const toggleBtn = document.getElementById('nav-toggle');
      if (nav && toggleBtn && nav.classList.contains('nav-open') && !nav.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeNav();
      }
    });

    // Sticky header on scroll
    window.addEventListener('scroll', () => {
      const header = document.getElementById('main-header');
      header.classList.toggle('header-scrolled', window.scrollY > 60);
    });

    // ─── DATE INPUT VALIDATION ───
    document.addEventListener('DOMContentLoaded', () => {
      const today = new Date().toISOString().split('T')[0];
      document.querySelectorAll('input[type="date"]').forEach(el => el.min = today);
    });

    // ─── MENU TABS ───
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.menu-item').forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.classList.remove('hidden-item');
          } else {
            item.classList.add('hidden-item');
          }
        });
      });
    });

    // ─── TABLE SELECTION ───
    let selectedTable = 'T1';
    function selectTable(name) {
      document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('selected'));
      const buttons = Array.from(document.querySelectorAll('.table-btn'));
      const btn = buttons.find(b => b.textContent.trim() === name || b.id === 'table-' + name.replace(/\s/g, ''));
      if (btn) btn.classList.add('selected');
      selectedTable = name;
      document.getElementById('selected-table-label').textContent = 'Table ' + name;
      document.getElementById('btn-confirm-booking').innerHTML = '<i class="fas fa-calendar-check"></i> Confirm — Table ' + name;
    }

    // ─── RESERVATION FORM SUBMIT ───
    function submitReservation(e) {
      e.preventDefault();
      const name = document.getElementById('res-name').value;
      if (!name) { showToast('Please enter your name.'); return; }
      showToast('✅ Reservation confirmed for ' + name + ' at Table ' + selectedTable + '! Our concierge will call you shortly.');
      e.target.reset();
      selectTable('T1'); // Reset floor plan state
    }

    // ─── MODALS ───
    function lockScroll() {
      document.body.style.overflow = 'hidden';
    }
    function unlockScroll() {
      document.body.style.overflow = '';
    }

    function openReservationModal() {
      closeAllModals();
      document.getElementById('modal-backdrop').classList.add('active');
      document.getElementById('reservation-modal').classList.add('active');
      lockScroll();
    }
    function openVipModal() {
      closeAllModals();
      document.getElementById('modal-backdrop').classList.add('active');
      document.getElementById('vip-modal').classList.add('active');
      lockScroll();
    }
    function openGiftCardModal() {
      closeAllModals();
      document.getElementById('modal-backdrop').classList.add('active');
      document.getElementById('giftcard-modal').classList.add('active');
      lockScroll();
    }
    function openWeddingModal() {
      closeAllModals();
      document.getElementById('modal-backdrop').classList.add('active');
      document.getElementById('wedding-modal').classList.add('active');
      lockScroll();
    }

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

    function openCorporateModal() {
      closeAllModals();
      document.getElementById('modal-backdrop').classList.add('active');
      document.getElementById('corporate-modal').classList.add('active');
      lockScroll();
    }
    function closeAllModals() {
      document.querySelectorAll('.aurum-modal').forEach(m => m.classList.remove('active'));
      document.getElementById('modal-backdrop').classList.remove('active');
      unlockScroll();
    }
    
    document.addEventListener('keydown', e => { 
      if (e.key === 'Escape') closeAllModals(); 
      
      // Focus Trap for active modal
      const activeModal = document.querySelector('.aurum-modal.active');
      if (e.key === 'Tab' && activeModal) {
        const focusable = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    function confirmModalReservation() {
      const name = document.getElementById('modal-name').value;
      const guests = document.getElementById('modal-guests').value;
      const time = document.getElementById('modal-time').value;
      closeAllModals();
      showToast('🎉 Reservation confirmed for ' + (name || 'Guest') + ' — ' + guests + ' at ' + time + '. See you soon!');
    }

    function submitVip() {
      const name = document.getElementById('vip-name').value;
      closeAllModals();
      showToast('💎 Thank you, ' + (name || 'valued guest') + '. Our concierge will contact you within 24 hours.');
    }

    let selectedGcAmount = 100;
    function selectGcAmount(btn, amount) {
      document.querySelectorAll('.gc-amount-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedGcAmount = amount;
    }
    function submitGiftCard() {
      const recipient = document.getElementById('gc-recipient').value;
      closeAllModals();
      showToast('🎁 Gift Card of $' + selectedGcAmount + ' for ' + (recipient || 'your recipient') + ' is being processed! Check your email shortly.');
    }

    function submitCorporateQuote() {
      const company = document.getElementById('corp-company').value;
      closeAllModals();
      showToast('🏢 Quote request received for ' + (company || 'your company') + '. Our events team will send a detailed proposal within 24 hours.');
    }

    function showDishDetails(title, price, desc) {
      document.getElementById('dish-modal-title').textContent = title;
      document.getElementById('dish-modal-price').textContent = price;
      document.getElementById('dish-modal-desc').textContent = desc;
      closeAllModals();
      document.getElementById('modal-backdrop').classList.add('active');
      document.getElementById('dish-modal').classList.add('active');
    }

    // ─── EXPERIENCE PLANNER ───
    function curateEvening() {
      const occasion = document.getElementById('planner-occasion').value;
      const seating = document.getElementById('planner-seating').value;
      const cuisine = document.getElementById('planner-cuisine').value;
      showToast('✨ Your evening is curated! ' + occasion + ' at the ' + seating + ' with our ' + cuisine + '. Our concierge will prepare everything.');
      setTimeout(() => openReservationModal(), 2500);
    }

    function selectAmbience(name) {
      showToast('📍 ' + name + ' selected. Click "Book This Space" to proceed.');
    }

    // ─── SCROLL TO RESERVATION ───
    function scrollToReservation(type) {
      document.getElementById('booking-type').value = type;
      document.getElementById('reservations').scrollIntoView({ behavior: 'smooth' });
    }

    // ─── FAQ ACCORDION ───
    function toggleFaq(item) {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    }

    // ─── TOAST ───
    function showToast(msg) {
      const toast = document.getElementById('aurum-toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }
  