const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('cafe.html', 'utf8');
let js = fs.readFileSync('script.js', 'utf8');

// Strip out IntersectionObserver so JSDOM doesn't crash
js = js.replace(/const revealObserver = new IntersectionObserver[\s\S]*?revealObserver\.observe\(el\)\;/g, '/* observer removed */');

const fixedHtml = html.replace('<script src="script.js"></script>', '<script>' + js + '</script>');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("jsdomError", (err) => console.log("JSDOM ERROR:", err.message));
virtualConsole.on("error", (err) => console.log("CONSOLE ERROR:", err.stack ? err.stack : err));
virtualConsole.on("log", (msg) => console.log("LOG:", msg));

const dom = new JSDOM(fixedHtml, {
  runScripts: "dangerously",
  virtualConsole
});

dom.window.addEventListener('load', () => {
  console.log("Window loaded successfully.");
  try {
    const btn = dom.window.document.querySelector('.add-to-cart-btn');
    if (btn) {
      console.log("Found add to cart button. Clicking...");
      btn.click();
      console.log("Cart Badge text:", dom.window.document.getElementById('cart-badge-count').textContent);
      console.log("Cart overlay classes:", dom.window.document.getElementById('checkout-overlay').className);
    } else {
      console.log("Button not found.");
    }
  } catch (e) {
    console.error("Execution error:", e.stack);
  }
});
