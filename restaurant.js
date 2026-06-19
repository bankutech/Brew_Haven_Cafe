// restaurant.js - Logic for BrewVerse Restaurant Portal

document.addEventListener('DOMContentLoaded', () => {

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark'; // Restaurant defaults to dark
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Header Scroll
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile Nav
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navLinksContainer = document.querySelector('.main-nav');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('mobile-active');
      const icon = mobileToggle.querySelector('i');
      if (navLinksContainer.classList.contains('mobile-active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  // Restaurant Menu Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');

      menuItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Shared Cart State
  let cart = JSON.parse(localStorage.getItem('brewverse_cart')) || [];
  const cartToggle = document.getElementById('cart-toggle');
  const cartCloseBtn = document.getElementById('cart-drawer-close');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsBox = document.getElementById('cart-items-container');
  const cartBadgeCount = document.getElementById('cart-count');
  const cartSubtotalVal = document.getElementById('cart-subtotal-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Toggle Drawer & Focus Traps
  const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function toggleDrawerOpen() {
    cartDrawer?.classList.add('active');
    cartOverlay?.classList.add('active');
    
    setTimeout(() => {
      if(!cartDrawer) return;
      const focusable = cartDrawer.querySelectorAll(focusableElementsSelector);
      if(focusable.length) focusable[0].focus();
    }, 50);
  }

  function toggleDrawerClose() {
    cartDrawer?.classList.remove('active');
    cartOverlay?.classList.remove('active');
    const inner = document.getElementById('cart-drawer-inner');
    if(inner) inner.classList.remove('show-payment');
    
    if(cartToggle) cartToggle.focus();
  }

  cartToggle?.addEventListener('click', toggleDrawerOpen);
  cartCloseBtn?.addEventListener('click', toggleDrawerClose);
  cartOverlay?.addEventListener('click', toggleDrawerClose);
  
  // Global Keydown for Modals
  document.addEventListener('keydown', (e) => {
    // Escape to close
    if(e.key === 'Escape') {
      if(cartDrawer && cartDrawer.classList.contains('active')) toggleDrawerClose();
    }
    
    // Focus Trap for Drawer
    if(e.key === 'Tab' && cartDrawer && cartDrawer.classList.contains('active')) {
      const focusable = cartDrawer.querySelectorAll(focusableElementsSelector);
      if(focusable.length === 0) return;
      
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      
      if(e.shiftKey && document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      } else if(!e.shiftKey && document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  });

  function saveCart() {
    localStorage.setItem('brewverse_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.cssText = 'background: var(--accent-gold); color: #000; padding: 10px 20px; border-radius: 5px; margin-bottom: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.3s;';
    toast.innerHTML = message;
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999;';
    container.appendChild(toast);
    
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function addToCart(productId, name, price, imgSrc) {
    const itemKey = `${productId}`;
    const existingIndex = cart.findIndex(item => item.key === itemKey);

    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ key: itemKey, id: productId, name, price: parseFloat(price), img: imgSrc, qty: 1, type: 'restaurant' });
    }
    saveCart();
    showToast(`<strong>${name}</strong> added to bag!`);
  }

  function updateCartUI() {
    if (!cartBadgeCount) return;
    
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadgeCount.textContent = totalQty;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if(cartSubtotalVal) cartSubtotalVal.textContent = `$${subtotal.toFixed(2)}`;

    if (cart.length === 0) {
      if(cartItemsBox) cartItemsBox.innerHTML = `<div class="empty-cart-message" style="padding: 20px; text-align: center;">Your order is empty.</div>`;
      return;
    }

    if(cartItemsBox) {
      let itemsHTML = '';
      cart.forEach(item => {
        itemsHTML += `
          <div class="cart-item-row">
            <div class="cart-item-row-info">
              <h5 class="cart-item-row-title">${item.name} <span class="cart-item-row-type">[${item.type || 'Cafe'}]</span></h5>
              <div class="cart-item-row-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-row-qty">x${item.qty}</div>
          </div>
        `;
      });
      cartItemsBox.innerHTML = itemsHTML;
    }
  }

  updateCartUI();

  // Bind Menu Order Buttons (Direct Add)
  const menuOrderBtns = document.querySelectorAll('.menu-order-btn');
  menuOrderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      const card = btn.closest('.menu-card');
      const imgSrc = card ? card.querySelector('img').src : '';
      addToCart(name, name, price, imgSrc);
    });
  });

  // Customization Modal Logic
  const customizeModal = document.getElementById('customize-modal');
  const customizeOverlay = document.getElementById('customize-overlay');
  const customizeClose = document.getElementById('customize-close');
  const customizeName = document.getElementById('customize-item-name');
  const customizePrice = document.getElementById('customize-item-price');
  const customizeTotalPriceBtn = document.getElementById('customize-total-price');
  const confirmCustomizeBtn = document.getElementById('confirm-customize-btn');
  
  let currentCustomizingItem = null;

  function closeCustomizeModal() {
    if(customizeModal) customizeModal.classList.remove('active');
    if(customizeOverlay) customizeOverlay.classList.remove('active');
  }

  if(customizeClose) customizeClose.addEventListener('click', closeCustomizeModal);
  if(customizeOverlay) customizeOverlay.addEventListener('click', closeCustomizeModal);

  const customizeBtns = document.querySelectorAll('.menu-customize-btn');
  customizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const card = btn.closest('.menu-card');
      const imgSrc = card ? card.querySelector('img').src : '';
      
      currentCustomizingItem = { name, basePrice: price, imgSrc };
      
      customizeName.textContent = name;
      customizePrice.textContent = '$' + price.toFixed(2);
      customizeTotalPriceBtn.textContent = '$' + price.toFixed(2);
      
      // Reset Form
      document.getElementById('custom-doneness').value = 'Medium Rare';
      document.getElementById('custom-side').value = 'Standard';
      document.getElementById('allergy-nut').checked = false;
      document.getElementById('allergy-dairy').checked = false;
      document.getElementById('allergy-gluten').checked = false;
      document.getElementById('custom-notes').value = '';
      
      customizeModal.classList.add('active');
      customizeOverlay.classList.add('active');
    });
  });

  // Update Price dynamically if side changes
  document.getElementById('custom-side')?.addEventListener('change', (e) => {
    if(!currentCustomizingItem) return;
    let finalPrice = currentCustomizingItem.basePrice;
    if(e.target.value !== 'Standard') finalPrice += 2.00;
    customizeTotalPriceBtn.textContent = '$' + finalPrice.toFixed(2);
  });

  if(confirmCustomizeBtn) {
    confirmCustomizeBtn.addEventListener('click', () => {
      if(!currentCustomizingItem) return;
      
      const doneness = document.getElementById('custom-doneness').value;
      const side = document.getElementById('custom-side').value;
      const notes = document.getElementById('custom-notes').value;
      
      let price = currentCustomizingItem.basePrice;
      let titleMods = [];
      if(doneness !== 'Medium Rare') titleMods.push(doneness);
      if(side !== 'Standard') { price += 2.00; titleMods.push(side); }
      if(document.getElementById('allergy-nut').checked) titleMods.push('Nut-Free');
      if(document.getElementById('allergy-dairy').checked) titleMods.push('Dairy-Free');
      if(document.getElementById('allergy-gluten').checked) titleMods.push('GF');
      
      let finalName = currentCustomizingItem.name;
      if(titleMods.length > 0) finalName += ` (${titleMods.join(', ')})`;
      
      // The `notes` could be appended or saved, but for UI simplicity we embed it in the finalName or just log it
      if(notes) finalName += ' *Notes Attached*';
      
      // Add custom item
      const customId = currentCustomizingItem.name + '-' + Date.now();
      addToCart(customId, finalName, price, currentCustomizingItem.imgSrc);
      
      closeCustomizeModal();
      toggleDrawerOpen(); // Open the cart to show it was added
    });
  }

  // Reservation Form & Table Map Logic
  const resForm = document.querySelector('.reservation-form');
  const tableBtns = document.querySelectorAll('.table-btn');
  const confirmBookingBtn = document.getElementById('confirm-booking-btn');
  const bookingTypeSelect = document.getElementById('booking-type');
  const guestsInput = document.getElementById('guests-input');
  const tableMap = document.querySelector('.table-map');
  
  let selectedTable = 'T1'; // default
  
  // Handle Table Map Clicks
  tableBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if(bookingTypeSelect.value === 'buffet') return; // Buffets don't select tables
      
      // Reset all buttons to default border
      tableBtns.forEach(b => b.style.borderColor = 'var(--border-color)');
      
      // Highlight selected
      e.target.style.borderColor = 'var(--accent-gold)';
      selectedTable = e.target.textContent;
      
      if(confirmBookingBtn) confirmBookingBtn.textContent = 'Confirm Table ' + selectedTable;
    });
  });
  
  // Handle Booking Type Changes
  if(bookingTypeSelect) {
    bookingTypeSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      
      if(type === 'group') {
        guestsInput.min = 6;
        if(guestsInput.value < 6) guestsInput.value = 6;
        tableMap.style.opacity = '1';
        if(confirmBookingBtn) confirmBookingBtn.textContent = 'Confirm Table ' + selectedTable;
      } else if(type === 'buffet') {
        guestsInput.min = 1;
        tableMap.style.opacity = '0.4'; // Dim out table map
        if(confirmBookingBtn) confirmBookingBtn.textContent = 'Confirm Buffet Booking';
      } else {
        guestsInput.min = 1;
        tableMap.style.opacity = '1';
        if(confirmBookingBtn) confirmBookingBtn.textContent = 'Confirm Table ' + selectedTable;
      }
    });
  }

  if(resForm) {
    resForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = bookingTypeSelect.value;
      const t = type === 'buffet' ? 'Buffet' : `Table ${selectedTable}`;
      alert(`Reservation Confirmed for ${t}! We look forward to serving you at the BrewVerse Restaurant.`);
      resForm.reset();
      
      // Reset logic
      guestsInput.min = 1;
      tableMap.style.opacity = '1';
      confirmBookingBtn.textContent = 'Confirm Table T1';
      tableBtns.forEach(b => b.style.borderColor = 'var(--border-color)');
      if(tableBtns.length > 0) tableBtns[0].style.borderColor = 'var(--accent-gold)';
    });
  }

  // Checkout UI Controls
  const cartDrawerInner = document.getElementById('cart-drawer-inner');
  const cartBackBtn = document.getElementById('cart-back-btn');
  const cartPayBtn = document.getElementById('cart-pay-btn');
  const cartPayTotal = document.getElementById('cart-pay-total');
  
  if(checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if(cart.length === 0) return;
      
      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      cartPayTotal.textContent = '$' + subtotal.toFixed(2);
      cartPayBtn.textContent = 'Pay $' + subtotal.toFixed(2);
      
      cartDrawerInner.classList.add('show-payment');
    });
  }
  
  if(cartBackBtn) {
    cartBackBtn.addEventListener('click', () => {
      cartDrawerInner.classList.remove('show-payment');
    });
  }

  if (cartPayBtn) {
    cartPayBtn.addEventListener('click', () => {
      // Package order data for the success page
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      const orderData = {
        orderNumber: "BV-" + Math.floor(100000 + Math.random() * 900000),
        portal: "BrewVerse Evening Dining",
        items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        pointsEarned: Math.floor(total * 5)
      };
      
      cartPayBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
      cartPayBtn.disabled = true;
      cartPayBtn.style.opacity = '0.8';

      setTimeout(() => {
        localStorage.setItem('brewverse_latest_order', JSON.stringify(orderData));
        cart = []; // Empty cart
        localStorage.removeItem('brewverse_cart');
        updateCartUI();
        window.location.href = 'success.html';
      }, 1200);
    });
  }
  
  // Card Input Formatting
  const restCardInput = document.getElementById('rest-card-input');
  const restCardIcon = document.getElementById('rest-card-icon');
  const restExpiryInput = document.getElementById('rest-expiry-input');
  
  if(restCardInput) {
    restCardInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;
      
      restCardIcon.className = 'fas fa-credit-card card-icon';
      if(val.startsWith('4')) restCardIcon.classList.add('fa-cc-visa', 'visa');
      else if(val.startsWith('5')) restCardIcon.classList.add('fa-cc-mastercard', 'mastercard');
      else if(val.startsWith('3')) restCardIcon.classList.add('fa-cc-amex', 'amex');
    });
  }
  
  if(restExpiryInput) {
    restExpiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if(val.length > 2) val = val.slice(0,2) + '/' + val.slice(2,4);
      e.target.value = val;
    });
  }
  
  // Pay Now Button Logic
  if(cartPayBtn) {
    cartPayBtn.addEventListener('click', () => {
      if(cart.length === 0) return;
      
      cartPayBtn.classList.add('btn-processing');
      
      setTimeout(() => {
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        const pointsEarned = Math.round(total * 5);
        
        const orderDetails = {
          orderNumber: "Bistro-" + Math.floor(100000 + Math.random() * 900000),
          portal: "The Restaurant",
          items: cart,
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          pointsEarned: pointsEarned,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('brewverse_latest_order', JSON.stringify(orderDetails));
        
        const currentPoints = parseInt(localStorage.getItem('brewverse_points')) || 0;
        localStorage.setItem('brewverse_points', currentPoints + pointsEarned);
        
        cart = [];
        saveCart();
        cartPayBtn.classList.remove('btn-processing');
        toggleDrawerClose();
        cartDrawerInner.classList.remove('show-payment');
        
        window.location.href = 'success.html';
      }, 1500);
    });
  }

});
