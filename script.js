/**
 * Brew Haven Elite - Core Logic (V2)
 * Clean, lightweight, and robust.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. LOADER
  const loader = document.getElementById('loader-wrapper');
  
  function hideLoader() {
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
      }, 300);
    }
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
    // Fallback
    setTimeout(hideLoader, 2000);
  }

  // 2. SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (typeof IntersectionObserver !== 'undefined') {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('reveal-active'));
  }

  // 3. NAVBAR SCROLL & MOBILE MENU
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');
  });

  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  mobileToggle?.addEventListener('click', () => {
    navLinksContainer?.classList.toggle('mobile-active');
  });

  // 4. THEME TOGGLE
  const themeToggle = document.getElementById('theme-toggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  themeToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  // 5. CART DRAWER & LOCAL STORAGE
  const cartToggle = document.getElementById('cart-toggle');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartBadge = document.getElementById('cart-badge-count');
  const cartSubtotal = document.getElementById('cart-subtotal-val');
  const cartItemsBox = document.getElementById('cart-items-box');

  let cart = [];
  try {
    const parsed = JSON.parse(localStorage.getItem('brewhaven_cart'));
    cart = Array.isArray(parsed) ? parsed : [];
  } catch(e) {
    cart = [];
  }
  cartToggle?.addEventListener('click', toggleCart);

  function toggleCart() {
    const coOverlay = document.getElementById('checkout-overlay');
    if (coOverlay) {
      coOverlay.classList.toggle('active');
      document.body.style.overflow = coOverlay.classList.contains('active') ? 'hidden' : '';
      if (coOverlay.classList.contains('active')) updateCartUI();
    }
  }

  let promoDiscount = 0;
  const TAX_RATE = 0.08;
  const VALID_PROMOS = { 'BREW20': 0.20, 'FIRST10': 0.10, 'VIP30': 0.30 };

  function fmtUSD(n) {
    return '\u20B9' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  window.changeQty = function(id, delta) {
    const item = cart.find(i => i.id == id);
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty < 1) { window.removeItem(id); return; }
    item.qty = newQty;
    saveCart();
  };

  window.removeItem = function(id) {
    const idx = cart.findIndex(i => i.id == id);
    if (idx !== -1) {
      cart.splice(idx, 1);
      saveCart();
    }
  };

  window.applyPromo = function() {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    const msg = document.getElementById('promoMsg');
    if (VALID_PROMOS[code]) {
      promoDiscount = VALID_PROMOS[code];
      msg.className = 'promo-msg ok';
      msg.textContent = '\u2713 Code applied \u2014 ' + (promoDiscount * 100) + '% off your order.';
    } else {
      promoDiscount = 0;
      msg.className = 'promo-msg err';
      msg.textContent = 'Invalid or expired promo code.';
    }
    updateCartUI();
  };

  window.processPayment = function() {
    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke-linecap="round"/></svg><span>Processing...</span>';
    btn.style.background = 'rgba(196,98,45,0.6)';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span class="btn-label">Pay securely \u2014 </span><span class="btn-amount">${document.getElementById('btnAmount').textContent}</span>`;
      btn.style.background = '';
      const orderId = 'BRW-' + Math.random().toString(36).slice(2,8).toUpperCase();
      document.getElementById('orderNum').textContent = 'Order #' + orderId;
      document.getElementById('coSuccessOverlay').classList.add('show');
      
      cart = [];
      saveCart();
    }, 2200);
  };
  
  window.switchMethod = function(method, btn) {
    document.querySelectorAll('.method-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.method-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + method).classList.add('active');
  };

  window.closeCheckout = function() {
    document.getElementById('checkout-overlay').classList.remove('active');
    document.body.style.overflow = '';
  };

  function updateCartUI() {
    if (cartBadge) cartBadge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    
    const coItemList = document.getElementById('coItemList');
    const coEmptyState = document.getElementById('coEmptyState');
    const promoRow = document.getElementById('coPromoRow');
    if (!coItemList) return;
    
    let sub = 0;
    if (cart.length === 0) {
      coItemList.innerHTML = '';
      coEmptyState.classList.add('show');
      promoRow.style.display = 'none';
    } else {
      coEmptyState.classList.remove('show');
      promoRow.style.display = 'flex';
      coItemList.innerHTML = '';
      cart.forEach((item) => {
        sub += item.price * item.qty;
        coItemList.innerHTML += `
      <div class="co-item" data-id="${item.id}">
        <div class="item-img">
          <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="item-info">
          <p class="item-brand">${item.category || 'Brew Haven'}</p>
          <h3 class="item-name">${item.name}</h3>
          <div class="item-meta">
            <span>Standard Size</span>
          </div>
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="window.changeQty('${item.id}',-1)">\u2212</button>
            <span class="qty-num" id="qty-${item.id}">${item.qty}</span>
            <button class="qty-btn" onclick="window.changeQty('${item.id}',1)">+</button>
          </div>
        </div>
        <div class="item-price-col">
          <p class="item-price" id="price-${item.id}">${fmtUSD(item.price * item.qty)}</p>
          <button class="item-remove" onclick="window.removeItem('${item.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            Remove
          </button>
        </div>
      </div>
        `;
      });
    }

    const discRow = document.getElementById('discountRow');
    const savingsTag = document.getElementById('savingsTag');
    const disc = sub * promoDiscount;
    const taxable = sub - disc;
    const tax = taxable * TAX_RATE;
    const total = taxable + tax;

    document.getElementById('subtotalVal').textContent = fmtUSD(sub);
    document.getElementById('taxVal').textContent = fmtUSD(tax);
    document.getElementById('totalVal').textContent = fmtUSD(total);
    document.getElementById('btnAmount').textContent = fmtUSD(total);

    if (promoDiscount > 0) {
      discRow.textContent = '\u2212' + fmtUSD(disc);
      document.getElementById('savingsAmt').textContent = fmtUSD(disc);
      savingsTag.style.display = 'inline-flex';
    } else {
      discRow.textContent = '\u2014';
      savingsTag.style.display = 'none';
    }

    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('coBagCount').textContent = count + ' item' + (count !== 1 ? 's' : '');
  }

  function saveCart() {
    try {
      localStorage.setItem('brewhaven_cart', JSON.stringify(cart));
    } catch(e) {}
    updateCartUI();
  }

  // Global addToCart accessible via window
  window.addToCart = function(id, name, price, img, category, desc) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty++;
    else cart.push({ id, name, price, img, category, desc, qty: 1 });
    saveCart();
    toggleCart();
  };

  updateCartUI();

  // 6. ADD TO CART BUTTONS (Shop & Menu)
  document.querySelectorAll('.add-to-cart-btn, .shop-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.shop-card') || e.target.closest('.menu-card');
      if (card) {
        const name = card.querySelector('h3')?.textContent || 'Item';
        const priceText = card.querySelector('.shop-card-price, .menu-card-price')?.textContent || '0';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        const img = card.querySelector('img')?.src || '';
        const desc = card.querySelector('p')?.textContent || '';
        window.addToCart(Date.now(), name, price, img, 'Shop', desc);
      }
    });
  });

  // 7. MENU TABS
  const tabBtns = document.querySelectorAll('.tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.getAttribute('data-category');
      menuCards.forEach(card => {
        card.style.display = (category === 'all' || card.getAttribute('data-category') === category) ? 'flex' : 'none';
      });
    });
  });

  // 8. PAYMENT FLOW (Mock)
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const cartViewItems = document.getElementById('cart-view-items');
  const cartViewPayment = document.getElementById('cart-view-payment');
  const cartBackBtn = document.getElementById('cart-back-btn');
  const cartPayTotal = document.getElementById('cart-pay-total');

  cartCheckoutBtn?.addEventListener('click', () => {
    cartViewItems.style.display = 'none';
    cartViewPayment.style.display = 'flex';
    cartPayTotal.textContent = cartSubtotal?.textContent || '₹0';
  });

  cartBackBtn?.addEventListener('click', () => {
    cartViewPayment.style.display = 'none';
    cartViewItems.style.display = 'flex';
  });


  // 9. MENU ORDER BUTTONS
  document.querySelectorAll('.menu-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-card');
      if (card) {
        const name = card.querySelector('h3')?.textContent || 'Item';
        const priceText = card.querySelector('.menu-card-price')?.textContent || '0';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        const img = card.querySelector('img')?.src || '';
        const desc = card.querySelector('p')?.textContent || '';
        window.addToCart(Date.now(), name, price, img, 'Menu', desc);
      }
    });
  });

  // 10. CONFIGURE YOUR RECIPE (Brew Lab)
  const customOrderBtn = document.getElementById('custom-order-btn');
  const customResetBtn = document.getElementById('custom-reset-btn');
  
  // Slider Elements
  const sliderEspresso = document.getElementById('slider-espresso');
  const valEspresso = document.getElementById('val-espresso');
  const sliderMilk = document.getElementById('slider-milk');
  const valMilk = document.getElementById('val-milk');
  const sliderFoam = document.getElementById('slider-foam');
  const valFoam = document.getElementById('val-foam');
  const sliderChoc = document.getElementById('slider-chocolate');
  const valChoc = document.getElementById('val-chocolate');
  const sliderCaramel = document.getElementById('slider-caramel');
  const valCaramel = document.getElementById('val-caramel');

  // Stats Elements
  const statCalories = document.getElementById('recipe-calories');
  const statStrength = document.getElementById('recipe-strength');
  const statNotes = document.getElementById('recipe-notes');

  function updateBrewLabVisuals() {
    if (!sliderEspresso) return;
    
    const shots = parseInt(sliderEspresso.value);
    const milk = parseInt(sliderMilk.value);
    const foam = parseInt(sliderFoam.value);
    const choc = parseInt(sliderChoc.value);
    const caramel = parseInt(sliderCaramel.value);

    // Update Text Labels
    valEspresso.textContent = shots + (shots === 1 ? ' Shot' : ' Shots');
    valMilk.textContent = milk + '%';
    valFoam.textContent = foam + '%';
    valChoc.textContent = choc + '%';
    valCaramel.textContent = caramel + '%';

    // Calculate Calories (Mock calculation)
    const calories = (shots * 5) + (milk * 1.5) + (foam * 0.5) + (choc * 3) + (caramel * 4);
    if (statCalories) statCalories.textContent = Math.round(calories);

    // Calculate Strength
    let strength = 'Balanced';
    if (shots === 0) strength = 'None';
    else if (shots === 1) strength = 'Single';
    else if (shots === 2) strength = 'Double';
    else if (shots >= 3) strength = 'Strong';
    if (statStrength) statStrength.textContent = strength;

    // Calculate Notes
    let notes = 'Classic';
    if (choc > 15 && caramel > 15) notes = 'Decadent';
    else if (choc > 10) notes = 'Mocha Hint';
    else if (caramel > 10) notes = 'Sweet Caramel';
    else if (milk > 60) notes = 'Milky Smooth';
    else if (shots >= 3 && milk < 20) notes = 'Intense';
    if (statNotes) statNotes.textContent = notes;
    // Update Visual Mug Layers
    const layerEspresso = document.getElementById('layer-espresso');
    const layerMilk = document.getElementById('layer-milk');
    const layerFoam = document.getElementById('layer-foam');
    const layerChoc = document.getElementById('layer-chocolate');
    const layerCaramel = document.getElementById('layer-caramel');
    
    // Normalize heights so they look good in the mug (max 100%)
    const eH = shots * 15;
    const mH = milk * 0.8;
    const fH = foam * 0.8;
    const cH = choc * 0.8;
    const caH = caramel * 0.8;
    
    if (layerEspresso) layerEspresso.style.height = eH + '%';
    if (layerMilk) layerMilk.style.height = mH + '%';
    if (layerFoam) layerFoam.style.height = fH + '%';
    if (layerChoc) layerChoc.style.height = cH + '%';
    if (layerCaramel) layerCaramel.style.height = caH + '%';
  }

  // Attach event listeners to sliders
  const allSliders = [sliderEspresso, sliderMilk, sliderFoam, sliderChoc, sliderCaramel];
  allSliders.forEach(slider => {
    if (slider) {
      slider.addEventListener('input', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        updateBrewLabVisuals();
      });
    }
  });

  // Preset Buttons Logic
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      presetBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const preset = e.target.getAttribute('data-preset');
      
      if (preset === 'latte') { if(sliderEspresso) sliderEspresso.value = 2; if(sliderMilk) sliderMilk.value = 40; if(sliderFoam) sliderFoam.value = 15; if(sliderChoc) sliderChoc.value = 10; if(sliderCaramel) sliderCaramel.value = 5; }
      else if (preset === 'cappuccino') { if(sliderEspresso) sliderEspresso.value = 2; if(sliderMilk) sliderMilk.value = 30; if(sliderFoam) sliderFoam.value = 30; if(sliderChoc) sliderChoc.value = 0; if(sliderCaramel) sliderCaramel.value = 0; }
      else if (preset === 'macchiato') { if(sliderEspresso) sliderEspresso.value = 2; if(sliderMilk) sliderMilk.value = 10; if(sliderFoam) sliderFoam.value = 20; if(sliderChoc) sliderChoc.value = 5; if(sliderCaramel) sliderCaramel.value = 5; }
      else if (preset === 'espresso') { if(sliderEspresso) sliderEspresso.value = 1; if(sliderMilk) sliderMilk.value = 0; if(sliderFoam) sliderFoam.value = 0; if(sliderChoc) sliderChoc.value = 0; if(sliderCaramel) sliderCaramel.value = 0; }
      else if (preset === 'mocha') { if(sliderEspresso) sliderEspresso.value = 2; if(sliderMilk) sliderMilk.value = 35; if(sliderFoam) sliderFoam.value = 10; if(sliderChoc) sliderChoc.value = 25; if(sliderCaramel) sliderCaramel.value = 0; }
      
      updateBrewLabVisuals();
    });
  });

  // Reset Button
  customResetBtn?.addEventListener('click', () => {
    if (sliderEspresso) sliderEspresso.value = 2;
    if (sliderMilk) sliderMilk.value = 40;
    if (sliderFoam) sliderFoam.value = 15;
    if (sliderChoc) sliderChoc.value = 10;
    if (sliderCaramel) sliderCaramel.value = 5;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.preset-btn[data-preset="latte"]')?.classList.add('active');
    updateBrewLabVisuals();
  });

  // Initial calculation
  updateBrewLabVisuals();

  customOrderBtn?.addEventListener('click', () => {
    const name = 'My Custom Blend';
    window.addToCart(Date.now(), name, 450, 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&w=150&q=80', 'Brew Lab', 'Your personalized recipe from the Brew Lab.');
    
    const successModal = document.getElementById('success-modal');
    if (successModal) {
      document.getElementById('success-msg').innerHTML = `Your custom blend <strong>"${name}"</strong> has been added to your Shopping Bag!`;
      successModal.classList.add('active');
    } else {
      alert(`${name} added to bag!`);
    }
  });

  // 11. CLAIM DISCOUNT (Loyalty)
  window.claimDiscount = function(e) {
    if (e) e.preventDefault();
    const successModal = document.getElementById('success-modal');
    if (successModal) {
      document.getElementById('success-msg').innerHTML = `Congratulations! Your discount code <strong>BREW10</strong> has been applied to your account.`;
      successModal.classList.add('active');
    } else {
      alert('Discount code BREW10 claimed successfully!');
    }
  };

  const claimBtn = document.querySelector('.loyalty-claim-btn');
  claimBtn?.addEventListener('click', window.claimDiscount);

  // 12. CLOSE SUCCESS MODAL
  const modalCloseBtn = document.getElementById('modal-close-btn');
  modalCloseBtn?.addEventListener('click', () => {
    document.getElementById('success-modal')?.classList.remove('active');
  });

  // 14. UPI CHECKOUT TAB LOGIC
  const paymentTabBtns = document.querySelectorAll('.payment-tab-btn');
  const tabUpi = document.getElementById('tab-upi');
  const tabCard = document.getElementById('tab-card');

  paymentTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active from all
      paymentTabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const targetTab = e.target.getAttribute('data-tab');
      if (targetTab === 'upi') {
        tabUpi.style.display = 'block';
        tabCard.style.display = 'none';
      } else {
        tabUpi.style.display = 'none';
        tabCard.style.display = 'block';
      }
    });
  });

  // 15. MOCK PAYMENT SUCCESS
  const cartPayBtnFinal = document.getElementById('cart-pay-btn');
  cartPayBtnFinal?.addEventListener('click', () => {
    cartPayBtnFinal.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    cartPayBtnFinal.disabled = true;

    setTimeout(() => {
      // Clear cart
      localStorage.removeItem('brewhaven_cart');
      
      const cartDrawer = document.getElementById('cart-drawer');
      const cartOverlay = document.getElementById('cart-overlay');
      cartDrawer?.classList.remove('active');
      cartOverlay?.classList.remove('active');
      document.body.style.overflow = '';
      
      // Show Success Modal
      const successModal = document.getElementById('success-modal');
      if (successModal) {
        document.getElementById('success-msg').innerHTML = `<strong>Payment Successful!</strong> Your order has been placed securely via Razorpay.`;
        successModal.classList.add('active');
      } else {
        alert('Payment Successful! Your order has been placed securely via Razorpay.');
      }
      
      // Reload page to reset state after a short delay
      setTimeout(() => window.location.reload(), 2000);
      
    }, 1500);
  });


  // 16. SMOOTH SCROLL & SCROLL SPY
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#') {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        const navLinksContainer = document.getElementById('nav-links');
        navLinksContainer?.classList.remove('mobile-active');
      }
    });
  });

  // Scroll Spy
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  // 17. COFFEE MATCHER QUIZ LOGIC
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizOptions = document.querySelectorAll('.quiz-opt-btn');
  const quizResultBox = document.getElementById('quiz-result-box');
  const quizResetBtn = document.getElementById('quiz-reset-btn');
  const quizAddOrderBtn = document.getElementById('quiz-add-order-btn');
  const progressBar = document.getElementById('quiz-progress');
  
  let currentQuizStep = 0;
  let quizAnswers = { temp: '', flavor: '', pair: '' };

  quizOptions.forEach(opt => {
    opt.addEventListener('click', (e) => {
      // Record answer
      const key = opt.getAttribute('data-key');
      const val = opt.getAttribute('data-value');
      if(key) quizAnswers[key] = val;

      // Highlight selection
      const siblings = e.target.closest('.quiz-options').querySelectorAll('.quiz-opt-btn');
      siblings.forEach(s => {
        s.style.borderColor = 'var(--border-color)';
        s.style.backgroundColor = 'var(--bg-primary)';
      });
      const btn = e.target.closest('.quiz-opt-btn');
      btn.style.borderColor = 'var(--accent)';
      btn.style.backgroundColor = 'var(--bg-secondary)';

      // Auto advance after a brief delay
      setTimeout(() => {
        quizSteps[currentQuizStep]?.classList.remove('active');
        currentQuizStep++;
        
        if (progressBar) {
          progressBar.style.width = ((currentQuizStep + 1) / 3 * 100) + '%';
        }

        if (currentQuizStep < quizSteps.length - 1) { // -1 because the last step is the result
          quizSteps[currentQuizStep]?.classList.add('active');
        } else {
          // Show result
          const progressWrapper = document.querySelector('.quiz-progress-wrapper');
          if (progressWrapper) progressWrapper.style.display = 'none';
          
          // Calculate result based on answers
          const resultDrinkName = document.getElementById('result-drink-name');
          const resultDrinkDesc = document.getElementById('result-drink-desc');
          const resultDrinkImg = document.getElementById('result-drink-img');
          const resultPastryName = document.getElementById('result-pastry-name');
          const resultPastryDesc = document.getElementById('result-pastry-desc');
          const resultPastryImg = document.getElementById('result-pastry-img');
          
          let drinkPrice = 0;
          let pastryPrice = 0;

          if (quizAnswers.temp === 'hot') {
             if(resultDrinkName) resultDrinkName.textContent = 'Velvet Cappuccino';
             if(resultDrinkDesc) resultDrinkDesc.textContent = 'Rich espresso and steamed milk.';
             if(resultDrinkImg) resultDrinkImg.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=150&q=80';
             drinkPrice = 373;
          } else if (quizAnswers.temp === 'cold') {
             if(resultDrinkName) resultDrinkName.textContent = 'Nitro Cold Brew';
             if(resultDrinkDesc) resultDrinkDesc.textContent = 'Ultra-smooth, infused with nitrogen.';
             if(resultDrinkImg) resultDrinkImg.src = 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=150&q=80';
             drinkPrice = 352;
          } else {
             if(resultDrinkName) resultDrinkName.textContent = 'Caramel Macchiato';
             if(resultDrinkDesc) resultDrinkDesc.textContent = 'Sweet vanilla and buttery caramel.';
             if(resultDrinkImg) resultDrinkImg.src = 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=150&q=80';
             drinkPrice = 415;
          }

          if (quizAnswers.pair === 'pastry') {
             if(resultPastryName) resultPastryName.textContent = 'Almond Croissant';
             if(resultPastryDesc) resultPastryDesc.textContent = 'Flaky crust with sweet almond paste.';
             if(resultPastryImg) resultPastryImg.src = 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&w=150&q=80';
             pastryPrice = 290;
          } else if (quizAnswers.pair === 'savory') {
             if(resultPastryName) resultPastryName.textContent = 'Avocado Toast';
             if(resultPastryDesc) resultPastryDesc.textContent = 'Artisan sourdough with fresh avocado.';
             if(resultPastryImg) resultPastryImg.src = 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=150&q=80';
             pastryPrice = 705;
          } else {
             if(resultPastryName) resultPastryName.textContent = 'None';
             if(resultPastryDesc) resultPastryDesc.textContent = 'Just focusing on the coffee today!';
             if(resultPastryImg) resultPastryImg.src = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=150&q=80';
             pastryPrice = 0;
          }

          window.quizResultMatch = {
             drink: { name: resultDrinkName?.textContent, price: drinkPrice, img: resultDrinkImg?.src },
             pastry: { name: resultPastryName?.textContent, price: pastryPrice, img: resultPastryImg?.src }
          };

          document.getElementById('quiz-step-result')?.classList.add('active');
        }
      }, 400);
    });
  });

  quizResetBtn?.addEventListener('click', () => {
    currentQuizStep = 0;
    const progressWrapper = document.querySelector('.quiz-progress-wrapper');
    if (progressWrapper) progressWrapper.style.display = 'block';
    if (progressBar) progressBar.style.width = '33%';
    
    quizSteps.forEach(s => s.classList.remove('active'));
    quizOptions.forEach(s => {
      s.style.borderColor = 'var(--border-color)';
      s.style.backgroundColor = 'var(--bg-primary)';
    });
    
    quizSteps[0]?.classList.add('active');
  });

  quizAddOrderBtn?.addEventListener('click', () => {
    const match = window.quizResultMatch;
    if (match) {
      if (match.drink.price > 0) window.addToCart(Date.now(), match.drink.name, match.drink.price, match.drink.img, 'Quiz Match', 'Drink matched to your profile.');
      if (match.pastry.price > 0) window.addToCart(Date.now()+1, match.pastry.name, match.pastry.price, match.pastry.img, 'Quiz Match', 'Pastry matched to your profile.');
      
      const successModal = document.getElementById('success-modal');
      if (successModal) {
        document.getElementById('success-msg').innerHTML = `Your customized pairing has been added to your Shopping Bag!`;
        successModal.classList.add('active');
      } else {
        alert('Pairing added to your Shopping Bag!');
      }
    }
  });

  // 18. SOURCING MAP LOGIC
  const mapPins = document.querySelectorAll('.map-pin');
  const originsImg = document.getElementById('origins-feature-img');
  const originsTitle = document.getElementById('origins-region-title');
  const originsDesc = document.getElementById('origins-region-desc');

  const regionData = {
    'colombia': { img: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=600&q=80', title: 'Colombia', desc: 'Renowned for its medium body and rich, caramel-like sweetness.' },
    'ethiopia': { img: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80', title: 'Ethiopia', desc: 'The birthplace of coffee. Expect bright, floral, and fruity notes.' },
    'sumatra': { img: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80', title: 'Sumatra', desc: 'Known for its full body, low acidity, and earthy, spicy profile.' },
    'brazil': { img: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=600&q=80', title: 'Brazil', desc: 'Nutty, sweet, and low in acidity, perfect for classic espresso blends.' }
  };

  mapPins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      mapPins.forEach(p => p.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      
      const region = target.getAttribute('data-region');
      if (regionData[region]) {
        if (originsImg) originsImg.src = regionData[region].img;
        if (originsTitle) originsTitle.textContent = regionData[region].title;
        if (originsDesc) originsDesc.textContent = regionData[region].desc;
      }
    });
  });

  // 19. LOYALTY CALCULATOR LOGIC
  const loyaltySlider = document.getElementById('loyalty-slider');
  const calcPoints = document.getElementById('calc-points');
  const calcTier = document.getElementById('calc-tier');
  const tierCards = [document.getElementById('tier-bronze'), document.getElementById('tier-silver'), document.getElementById('tier-gold')];

  loyaltySlider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const points = val * 10;
    if (calcPoints) calcPoints.textContent = points;
    
    let tier = 'Bronze';
    let activeIdx = 0;
    if (points >= 200) { tier = 'Silver'; activeIdx = 1; }
    if (points >= 500) { tier = 'Gold'; activeIdx = 2; }
    
    if (calcTier) calcTier.textContent = tier;
    
    tierCards.forEach((c, i) => {
      if (c) {
        if (i === activeIdx) c.classList.add('active');
        else c.classList.remove('active');
      }
    });
  });

  // 15. CONTACT & NEWSLETTER FORMS
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const successModal = document.getElementById('success-modal');
    if (successModal) {
      document.getElementById('success-msg').innerHTML = `Thank you for your message. Our team will get back to you shortly!`;
      successModal.classList.add('active');
      contactForm.reset();
    } else {
      alert('Thank you for your message!');
      contactForm.reset();
    }
  });

  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const successModal = document.getElementById('success-modal');
    if (successModal) {
      document.getElementById('success-msg').innerHTML = `You have successfully subscribed to our newsletter!`;
      successModal.classList.add('active');
      newsletterForm.reset();
    } else {
      alert('Subscribed to newsletter successfully!');
      newsletterForm.reset();
    }
  });

  // 19. OFFERS COUNTDOWN TIMER
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('minutes');
  const secsEl = document.getElementById('seconds');
  if (daysEl && hoursEl && minsEl && secsEl) {
    let timeLeft = 2 * 24 * 60 * 60 + 5 * 60 * 60 + 30 * 60 + 15; // 2 days, 5 hours, 30 mins
    setInterval(() => {
      if (timeLeft > 0) timeLeft--;
      daysEl.textContent = String(Math.floor(timeLeft / (24 * 3600))).padStart(2, '0');
      hoursEl.textContent = String(Math.floor((timeLeft % (24 * 3600)) / 3600)).padStart(2, '0');
      minsEl.textContent = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
      secsEl.textContent = String(timeLeft % 60).padStart(2, '0');
    }, 1000);
  }

});


/* ==========================================================================
   PREMIUM AESTHETIC JAVASCRIPT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Inject Ambient Orbs globally
  const orb1 = document.createElement('div');
  orb1.className = 'ambient-orb orb-1';
  const orb2 = document.createElement('div');
  orb2.className = 'ambient-orb orb-2';
  document.body.prepend(orb1, orb2);

  // 2. Smooth Parallax Scrolling
  const heroImage = document.querySelector('.hero-content');
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    
    // Hero subtle parallax fade/scale
    if (heroImage && scrollY < window.innerHeight) {
      heroImage.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroImage.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
    }

    // Generic parallax elements
    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const speed = el.getAttribute('data-speed') || 0.15;
        el.style.transform = `translateY(${(rect.top - window.innerHeight/2) * speed}px)`;
      }
    });
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  // 3. Staggered Reveals
  // Upgrade existing reveal classes to support stagger if they are in a grid
  const grids = document.querySelectorAll('.menu-grid, .shop-grid, .team-grid, .features-grid, .sitemap-grid');
  grids.forEach(grid => {
    const items = grid.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    items.forEach((item, index) => {
      item.style.transitionDelay = `${index * 0.1}s`;
    });
  });

  // 4. Magnetic Buttons (Hover effect)
  const magneticButtons = document.querySelectorAll('.btn-primary');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // 5. Inject Wave Dividers after major sections dynamically
  const sections = document.querySelectorAll('.features, .menu-preview, .about-section, .testimonial-section');
  sections.forEach((sec, idx) => {
    // Skip if it already has a wave or is the last section
    if (idx % 2 === 0) {
      const wave = document.createElement('div');
      wave.className = 'wave-divider';
      wave.innerHTML = `<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.54,196.42,106.68Z" class="shape-fill"></path>
      </svg>`;
      sec.parentNode.insertBefore(wave, sec.nextSibling);
    }
  });

});
